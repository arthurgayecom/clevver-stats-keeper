
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use Gemini 2.5 Pro for best image+text reasoning
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `You are a food detection AI for a school cafeteria sustainability app. 
Analyze food images and identify each food item visible on the tray or plate.

For each food item, provide:
1. name: The food name (e.g., "Grilled Chicken", "Steamed Broccoli")
2. category: One of "protein", "vegetables", "grains", "dairy", "fruits", "beverage", "dessert"
3. carbonFootprint: Estimated kg CO₂ per serving (use these guidelines):
   - Beef: 4-6 kg
   - Lamb: 3-5 kg
   - Pork: 1.5-2.5 kg
   - Chicken/Turkey: 1-2 kg
   - Fish: 1-3 kg
   - Eggs: 0.5-1 kg
   - Dairy: 0.5-2 kg
   - Grains/Rice: 0.3-1 kg
   - Vegetables: 0.1-0.5 kg
   - Fruits: 0.1-0.4 kg
   - Legumes/Beans: 0.2-0.5 kg
   - Processed foods: 1-3 kg
4. isPlantBased: true if the item contains no animal products

Be accurate and realistic. If you can't identify a food clearly, make your best educated guess based on appearance.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this meal image and identify all visible food items. Return the results as a JSON array."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "detect_foods",
              description: "Return the detected food items from the image",
              parameters: {
                type: "object",
                properties: {
                  foods: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Name of the food item" },
                        category: { 
                          type: "string", 
                          enum: ["protein", "vegetables", "grains", "dairy", "fruits", "beverage", "dessert"]
                        },
                        carbonFootprint: { type: "number", description: "CO2 footprint in kg" },
                        isPlantBased: { type: "boolean", description: "Whether the item is plant-based" }
                      },
                      required: ["name", "category", "carbonFootprint", "isPlantBased"]
                    }
                  }
                },
                required: ["foods"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "detect_foods" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI Response:", JSON.stringify(aiResponse, null, 2));

    // Extract foods from tool call response
    let foods = [];
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      foods = parsed.foods || [];
    }

    return new Response(
      JSON.stringify({ foods }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing food:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

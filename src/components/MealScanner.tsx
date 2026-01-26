import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, Loader2, Leaf, Sparkles, AlertCircle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";

interface MealScannerProps {
  onComplete?: () => void;
}

interface DetectedFood {
  name: string;
  category: string;
  carbonFootprint: number;
  isPlantBased: boolean;
}

export const MealScanner: React.FC<MealScannerProps> = ({ onComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [detectedFoods, setDetectedFoods] = useState<DetectedFood[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { logMeal } = useUser();

  const analyzeWithAI = async (base64Image: string): Promise<DetectedFood[]> => {
    const { data, error } = await supabase.functions.invoke('analyze-food', {
      body: { imageBase64: base64Image }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to analyze image');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data.foods || [];
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreviewImage(base64);
      
      setIsAnalyzing(true);
      try {
        const foods = await analyzeWithAI(base64);
        setDetectedFoods(foods);
        
        if (foods.length === 0) {
          setError("No foods detected. Try taking a clearer photo of your meal.");
        }
      } catch (err) {
        console.error('AI analysis error:', err);
        setError(err instanceof Error ? err.message : 'Failed to analyze image');
        setDetectedFoods([]);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogMeal = () => {
    const totalCarbon = detectedFoods.reduce((sum, f) => sum + f.carbonFootprint, 0);
    const isPlantBased = detectedFoods.every(f => f.isPlantBased);
    
    logMeal({
      foods: detectedFoods,
      totalCarbon,
      isPlantBased,
    });

    toast({
      title: "Meal Logged! 🌱",
      description: `You saved ${(isPlantBased ? totalCarbon * 0.5 : totalCarbon * 0.2).toFixed(1)} kg CO₂`,
    });

    setPreviewImage(null);
    setDetectedFoods([]);
    setError(null);
    onComplete?.();
  };

  const handleRetry = () => {
    setPreviewImage(null);
    setDetectedFoods([]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {!previewImage ? (
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-border/50 rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <p className="font-medium text-foreground mb-2">Upload a photo of your meal</p>
            <p className="text-sm text-muted-foreground mb-3">AI-powered food detection with carbon footprint analysis</p>
            <div className="flex items-center justify-center gap-2 text-xs text-primary">
              <Zap className="w-3 h-3" />
              <span>Powered by Gemini 2.5 Pro Vision</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button variant="eco" className="w-full" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Choose Image
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden">
            <img src={previewImage} alt="Meal" className="w-full h-64 object-cover" />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground">AI analyzing your meal...</p>
                  <p className="text-xs text-muted-foreground/70">Using Gemini 2.5 Pro Vision</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <Card variant="glass" className="border-destructive/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">{error}</p>
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={handleRetry}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {detectedFoods.length > 0 && (
            <Card variant="glass">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h4 className="font-display font-bold">AI Detected Foods</h4>
                </div>
                {detectedFoods.map((food, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      {food.isPlantBased && <Leaf className="w-4 h-4 text-primary" />}
                      <div>
                        <span className="font-medium">{food.name}</span>
                        <span className="text-xs text-muted-foreground ml-2 capitalize">({food.category})</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{food.carbonFootprint.toFixed(1)} kg CO₂</span>
                  </div>
                ))}
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between font-bold">
                    <span>Total Carbon</span>
                    <span className="text-destructive">
                      {detectedFoods.reduce((sum, f) => sum + f.carbonFootprint, 0).toFixed(1)} kg CO₂
                    </span>
                  </div>
                  {detectedFoods.every(f => f.isPlantBased) && (
                    <p className="text-xs text-primary mt-2 flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      100% plant-based meal! Great choice for the planet!
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleRetry}>
                    Retake
                  </Button>
                  <Button variant="eco" className="flex-1" onClick={handleLogMeal}>
                    <Leaf className="w-4 h-4 mr-2" />
                    Log Meal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

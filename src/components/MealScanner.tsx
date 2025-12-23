import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, Loader2, Leaf, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";

interface MealScannerProps {
  onComplete?: () => void;
}

// Simulated AI food detection
const detectFoodsFromImage = (): { name: string; category: string; carbonFootprint: number; isPlantBased: boolean }[] => {
  const foods = [
    { name: "Grilled Chicken", category: "protein", carbonFootprint: 2.5, isPlantBased: false },
    { name: "Steamed Broccoli", category: "vegetables", carbonFootprint: 0.3, isPlantBased: true },
    { name: "Brown Rice", category: "grains", carbonFootprint: 0.8, isPlantBased: true },
    { name: "Garden Salad", category: "vegetables", carbonFootprint: 0.2, isPlantBased: true },
    { name: "Lentil Soup", category: "protein", carbonFootprint: 0.4, isPlantBased: true },
    { name: "Beef Steak", category: "protein", carbonFootprint: 5.2, isPlantBased: false },
    { name: "Quinoa Bowl", category: "grains", carbonFootprint: 0.6, isPlantBased: true },
    { name: "Salmon Fillet", category: "protein", carbonFootprint: 1.8, isPlantBased: false },
  ];
  
  const numFoods = Math.floor(Math.random() * 3) + 2;
  const shuffled = foods.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numFoods);
};

export const MealScanner: React.FC<MealScannerProps> = ({ onComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [detectedFoods, setDetectedFoods] = useState<{ name: string; category: string; carbonFootprint: number; isPlantBased: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { logMeal } = useUser();

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreviewImage(base64);
      await analyzeFood();
    };
    reader.readAsDataURL(file);
  };

  const analyzeFood = async () => {
    setIsAnalyzing(true);
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    const foods = detectFoodsFromImage();
    setDetectedFoods(foods);
    setIsAnalyzing(false);
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
    onComplete?.();
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
            <p className="text-sm text-muted-foreground">Our AI will detect foods and calculate carbon footprint</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
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
                </div>
              </div>
            )}
          </div>

          {detectedFoods.length > 0 && (
            <Card variant="glass">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h4 className="font-display font-bold">Detected Foods</h4>
                </div>
                {detectedFoods.map((food, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      {food.isPlantBased && <Leaf className="w-4 h-4 text-primary" />}
                      <span className="font-medium">{food.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{food.carbonFootprint} kg CO₂</span>
                  </div>
                ))}
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between font-bold">
                    <span>Total Carbon</span>
                    <span className="text-destructive">
                      {detectedFoods.reduce((sum, f) => sum + f.carbonFootprint, 0).toFixed(1)} kg CO₂
                    </span>
                  </div>
                </div>
                <Button variant="eco" className="w-full" onClick={handleLogMeal}>
                  <Leaf className="w-4 h-4 mr-2" />
                  Log This Meal
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

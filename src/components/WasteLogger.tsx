
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, AlertTriangle, TrendingDown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getMenu, logWaste, MenuItem } from "@/lib/menuData";

interface WasteLoggerProps {
  onComplete?: () => void;
}

export const WasteLogger: React.FC<WasteLoggerProps> = ({ onComplete }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [wasteLevel, setWasteLevel] = useState<'low' | 'medium' | 'high' | null>(null);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setMenu(getMenu());
  }, []);

  const handleLogWaste = () => {
    if (!selectedItem || !wasteLevel) return;

    logWaste(selectedItem.id, selectedItem.name, wasteLevel, notes || undefined);

    toast({
      title: "Waste logged! 📊",
      description: `${selectedItem.name} - ${wasteLevel} waste recorded`,
    });

    setSelectedItem(null);
    setWasteLevel(null);
    setNotes("");
    onComplete?.();
  };

  const getWasteLevelColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'border-primary text-primary bg-primary/10';
      case 'medium': return 'border-destructive text-destructive bg-destructive/10';
      case 'high': return 'border-eco-waste text-eco-waste bg-eco-waste/10';
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Log food waste to help identify items that aren't popular with students
      </p>

      {/* Item Selection */}
      {!selectedItem ? (
        <div className="space-y-3">
          <h4 className="font-semibold">Select the food item</h4>
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {menu.map((item) => (
              <Button
                key={item.id}
                variant="glass"
                className="justify-start h-auto py-3"
                onClick={() => setSelectedItem(item)}
              >
                <Trash2 className="w-4 h-4 mr-3 text-muted-foreground" />
                {item.name}
              </Button>
            ))}
          </div>
          {menu.length === 0 && (
            <Card variant="glass">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No items on today's menu to log waste for</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selected Item */}
          <Card variant="elevated" className="border-primary/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">{selectedItem.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Waste Level Selection */}
          <div className="space-y-3">
            <h4 className="font-semibold">How much was wasted?</h4>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <Button
                  key={level}
                  variant="glass"
                  className={`h-auto py-4 flex-col gap-2 ${wasteLevel === level ? getWasteLevelColor(level) : ''}`}
                  onClick={() => setWasteLevel(level)}
                >
                  <div className="text-2xl">
                    {level === 'low' && '📉'}
                    {level === 'medium' && '📊'}
                    {level === 'high' && '📈'}
                  </div>
                  <span className="capitalize font-semibold">{level}</span>
                  <span className="text-xs text-muted-foreground">
                    {level === 'low' && '< 10%'}
                    {level === 'medium' && '10-30%'}
                    {level === 'high' && '> 30%'}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <h4 className="font-semibold">Notes (optional)</h4>
            <Textarea
              placeholder="Any observations? e.g., 'Students didn't like the seasoning'"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button 
            variant="eco" 
            className="w-full" 
            size="lg"
            disabled={!wasteLevel}
            onClick={handleLogWaste}
          >
            <Check className="w-4 h-4 mr-2" />
            Log Waste
          </Button>
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Plus, UtensilsCrossed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";

interface MenuViewerProps {
  isCafeteria?: boolean;
}

const SAMPLE_MENU = [
  { id: "1", name: "Grilled Chicken Salad", category: "Main", carbonFootprint: 1.8, isPlantBased: false, price: 8.99 },
  { id: "2", name: "Vegetable Stir Fry", category: "Main", carbonFootprint: 0.5, isPlantBased: true, price: 7.49 },
  { id: "3", name: "Lentil Soup", category: "Soup", carbonFootprint: 0.4, isPlantBased: true, price: 4.99 },
  { id: "4", name: "Quinoa Buddha Bowl", category: "Main", carbonFootprint: 0.6, isPlantBased: true, price: 9.99 },
  { id: "5", name: "Beef Burger", category: "Main", carbonFootprint: 4.5, isPlantBased: false, price: 10.99 },
  { id: "6", name: "Garden Fresh Salad", category: "Side", carbonFootprint: 0.2, isPlantBased: true, price: 3.99 },
];

export const MenuViewer: React.FC<MenuViewerProps> = ({ isCafeteria }) => {
  const [menu] = useState(SAMPLE_MENU);
  const { toast } = useToast();
  const { logMeal, addActivity } = useUser();

  const handleSelectItem = (item: typeof SAMPLE_MENU[0]) => {
    logMeal({
      foods: [{ name: item.name, category: item.category, carbonFootprint: item.carbonFootprint, isPlantBased: item.isPlantBased }],
      totalCarbon: item.carbonFootprint,
      isPlantBased: item.isPlantBased,
    });

    toast({
      title: "Added to your log! 🌱",
      description: `${item.name} - ${item.carbonFootprint} kg CO₂`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {isCafeteria ? "Manage today's offerings" : "Choose your meal to track carbon"}
        </p>
        {isCafeteria && (
          <Button variant="eco" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {menu.map((item) => (
          <Card key={item.id} variant="glass" className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.isPlantBased ? 'bg-primary/20' : 'bg-secondary'}`}>
                    {item.isPlantBased ? <Leaf className="w-6 h-6 text-primary" /> : <UtensilsCrossed className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{item.name}</h4>
                      {item.isPlantBased && <Badge variant="outline" className="border-primary text-primary text-xs">Plant-Based</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.category} • ${item.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-bold ${item.carbonFootprint < 1 ? 'text-primary' : item.carbonFootprint < 3 ? 'text-destructive' : 'text-eco-waste'}`}>
                      {item.carbonFootprint} kg
                    </p>
                    <p className="text-xs text-muted-foreground">CO₂</p>
                  </div>
                  {!isCafeteria && (
                    <Button variant="ghost" size="sm" onClick={() => handleSelectItem(item)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

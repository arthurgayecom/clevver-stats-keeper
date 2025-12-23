import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Leaf, Plus, UtensilsCrossed, Trash2, Search, Sparkles, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { 
  getMenu, 
  addMenuItem, 
  removeMenuItem, 
  recordSelection,
  COMMON_FOODS,
  MenuItem 
} from "@/lib/menuData";

interface MenuViewerProps {
  isCafeteria?: boolean;
}

export const MenuViewer: React.FC<MenuViewerProps> = ({ isCafeteria }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { logMeal } = useUser();

  useEffect(() => {
    setMenu(getMenu());
  }, []);

  const handleAddFromCommon = (food: typeof COMMON_FOODS[0]) => {
    const newItem = addMenuItem(food);
    setMenu(getMenu());
    toast({
      title: "Added to menu! 🍽️",
      description: `${food.name} is now on today's menu`,
    });
  };

  const handleRemoveItem = (id: string, name: string) => {
    removeMenuItem(id);
    setMenu(getMenu());
    toast({
      title: "Removed",
      description: `${name} removed from menu`,
    });
  };

  const handleSelectItem = (item: MenuItem) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id);
    } else {
      newSelected.add(item.id);
    }
    setSelectedItems(newSelected);
  };

  const handleLogSelectedMeals = () => {
    const selectedFoods = menu.filter(item => selectedItems.has(item.id));
    if (selectedFoods.length === 0) return;

    selectedFoods.forEach(item => {
      recordSelection(item.id, item.name);
    });

    const totalCarbon = selectedFoods.reduce((sum, item) => sum + item.carbonFootprint, 0);
    const isPlantBased = selectedFoods.every(item => item.isPlantBased);

    logMeal({
      foods: selectedFoods.map(item => ({
        name: item.name,
        category: item.category,
        carbonFootprint: item.carbonFootprint,
        isPlantBased: item.isPlantBased,
      })),
      totalCarbon,
      isPlantBased,
    });

    toast({
      title: "Meal logged! 🌱",
      description: `${selectedFoods.length} items logged - ${totalCarbon.toFixed(1)} kg CO₂`,
    });

    setSelectedItems(new Set());
  };

  const filteredCommonFoods = COMMON_FOODS.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    food.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCarbonColor = (carbon: number) => {
    if (carbon < 0.5) return "text-primary";
    if (carbon < 1.5) return "text-accent";
    if (carbon < 3) return "text-destructive";
    return "text-eco-waste";
  };

  const categoryOrder: MenuItem['category'][] = ['protein', 'vegetables', 'grains', 'dairy', 'fruits', 'beverages'];
  const groupedMenu = categoryOrder.reduce((acc, category) => {
    const items = menu.filter(item => item.category === category);
    if (items.length > 0) acc[category] = items;
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {isCafeteria 
            ? "Add food items to today's menu" 
            : "Select what you're eating to track your carbon footprint"}
        </p>
        {isCafeteria && (
          <Button 
            variant={showAddPanel ? "secondary" : "eco"} 
            size="sm"
            onClick={() => setShowAddPanel(!showAddPanel)}
          >
            {showAddPanel ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showAddPanel ? "Close" : "Add Items"}
          </Button>
        )}
      </div>

      {/* Quick Add Panel for Cafeteria */}
      {isCafeteria && showAddPanel && (
        <Card variant="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Quick Add Food Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {filteredCommonFoods.map((food, index) => (
                <Button
                  key={index}
                  variant="glass"
                  size="sm"
                  className="h-auto py-2 px-3 justify-start text-left"
                  onClick={() => handleAddFromCommon(food)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {food.isPlantBased && <Leaf className="w-3 h-3 text-primary flex-shrink-0" />}
                    <span className="truncate text-xs">{food.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Selection Summary */}
      {!isCafeteria && selectedItems.size > 0 && (
        <Card variant="elevated" className="border-primary/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{selectedItems.size} items selected</p>
                <p className="text-sm text-muted-foreground">
                  Total: {menu.filter(i => selectedItems.has(i.id)).reduce((s, i) => s + i.carbonFootprint, 0).toFixed(1)} kg CO₂
                </p>
              </div>
              <Button variant="eco" onClick={handleLogSelectedMeals}>
                <Check className="w-4 h-4 mr-2" />
                Log Meal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu Display */}
      {Object.keys(groupedMenu).length === 0 ? (
        <Card variant="glass">
          <CardContent className="py-12 text-center">
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-medium text-foreground">No items on today's menu</p>
            <p className="text-sm text-muted-foreground mt-1">
              {isCafeteria ? "Add items using the button above" : "Check back later for today's menu"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 capitalize">
                {category}
              </h4>
              <div className="grid gap-3">
                {items.map((item) => (
                  <Card 
                    key={item.id} 
                    variant="glass" 
                    className={`hover-lift cursor-pointer transition-all ${
                      selectedItems.has(item.id) ? 'border-primary ring-2 ring-primary/20' : ''
                    }`}
                    onClick={() => !isCafeteria && handleSelectItem(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            item.isPlantBased ? 'bg-primary/20' : 'bg-secondary'
                          }`}>
                            {item.isPlantBased 
                              ? <Leaf className="w-5 h-5 text-primary" /> 
                              : <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />
                            }
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{item.name}</h4>
                              {item.isPlantBased && (
                                <Badge variant="outline" className="border-primary text-primary text-xs">
                                  Plant-Based
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`font-bold ${getCarbonColor(item.carbonFootprint)}`}>
                              {item.carbonFootprint} kg
                            </p>
                            <p className="text-xs text-muted-foreground">CO₂</p>
                          </div>
                          {isCafeteria && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveItem(item.id, item.name);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          {!isCafeteria && (
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              selectedItems.has(item.id) 
                                ? 'bg-primary border-primary' 
                                : 'border-muted-foreground/30'
                            }`}>
                              {selectedItems.has(item.id) && <Check className="w-4 h-4 text-primary-foreground" />}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingDown, Heart, Trash2, AlertTriangle, Sparkles } from "lucide-react";
import { getRecommendations, getTopItems, getMostWastedItems } from "@/lib/menuData";

export const InsightsPanel: React.FC = () => {
  const [recommendations, setRecommendations] = useState<ReturnType<typeof getRecommendations>>([]);
  const [topItems, setTopItems] = useState<ReturnType<typeof getTopItems>>([]);
  const [wastedItems, setWastedItems] = useState<ReturnType<typeof getMostWastedItems>>([]);

  useEffect(() => {
    setRecommendations(getRecommendations());
    setTopItems(getTopItems(5));
    setWastedItems(getMostWastedItems(5));
  }, []);

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'border-destructive bg-destructive/10 text-destructive';
      case 'medium': return 'border-eco-carbon bg-eco-carbon/10 text-eco-carbon';
      case 'low': return 'border-primary bg-primary/10 text-primary';
    }
  };

  const getTypeIcon = (type: 'carbon' | 'popular' | 'waste') => {
    switch (type) {
      case 'carbon': return <TrendingDown className="w-5 h-5" />;
      case 'popular': return <Heart className="w-5 h-5" />;
      case 'waste': return <Trash2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Add more menu items and log some data to get personalized recommendations
            </p>
          ) : (
            recommendations.map((rec, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-xl border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getTypeIcon(rec.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {rec.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {rec.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm">{rec.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Popular Items */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5 text-primary" />
            Student Favorites
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No selections recorded yet
            </p>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <span className="font-medium">{item.itemName}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.selections} picks</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Most Wasted */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Waste Watch
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wastedItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No waste recorded yet
            </p>
          ) : (
            <div className="space-y-3">
              {wastedItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center text-xs font-bold text-destructive">
                      {index + 1}
                    </span>
                    <span className="font-medium">{item.itemName}</span>
                  </div>
                  <Badge variant="outline" className={`${
                    item.wasteScore > 6 ? 'border-eco-waste text-eco-waste' :
                    item.wasteScore > 3 ? 'border-destructive text-destructive' :
                    'border-muted-foreground text-muted-foreground'
                  }`}>
                    {item.wasteScore > 6 ? 'High' : item.wasteScore > 3 ? 'Medium' : 'Low'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

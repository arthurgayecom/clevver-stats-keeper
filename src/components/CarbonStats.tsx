import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Leaf, Target, Award, Calendar } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export const CarbonStats: React.FC = () => {
  const { profile, meals } = useUser();

  const stats = {
    carbonSaved: profile?.carbon_saved || 0,
    mealsTracked: profile?.meals_tracked || 0,
    impactScore: profile?.impact_score || 0,
    currentStreak: profile?.current_streak || 0,
  };

  const weeklyGoal = 10; // kg CO₂ saved goal
  const progressPercent = Math.min(100, (stats.carbonSaved / weeklyGoal) * 100);

  // Calculate category breakdown
  const categoryBreakdown = meals.reduce((acc, meal) => {
    if (Array.isArray(meal.foods)) {
      meal.foods.forEach(food => {
        acc[food.category] = (acc[food.category] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const totalFoods = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Weekly Goal Progress */}
      <Card variant="glass">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-display font-bold">Weekly Goal</h4>
                <p className="text-sm text-muted-foreground">Save {weeklyGoal} kg CO₂</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-primary">{progressPercent.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {stats.carbonSaved.toFixed(1)} / {weeklyGoal} kg saved
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card variant="glass">
          <CardContent className="pt-6 text-center">
            <TrendingDown className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.carbonSaved.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">kg CO₂ Saved</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="pt-6 text-center">
            <Leaf className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.mealsTracked}</p>
            <p className="text-sm text-muted-foreground">Meals Tracked</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="pt-6 text-center">
            <Award className="w-8 h-8 text-eco-sky mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.impactScore}</p>
            <p className="text-sm text-muted-foreground">Impact Score</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="pt-6 text-center">
            <Calendar className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.currentStreak}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {totalFoods > 0 && Object.keys(categoryBreakdown).length > 0 && (
        <Card variant="glass">
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-display font-bold">Food Categories</h4>
            {Object.entries(categoryBreakdown).map(([category, count]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{category}</span>
                  <span className="text-muted-foreground">{((count / totalFoods) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(count / totalFoods) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
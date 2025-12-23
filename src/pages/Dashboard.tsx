import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, LogOut, UtensilsCrossed, Camera, TrendingDown, BarChart3, Sparkles, GraduationCap, ChefHat, Trophy, Plus, Lightbulb, Trash2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { MealScanner } from "@/components/MealScanner";
import { MenuViewer } from "@/components/MenuViewer";
import { CarbonStats } from "@/components/CarbonStats";
import { Leaderboard } from "@/components/Leaderboard";
import { WasteLogger } from "@/components/WasteLogger";
import { InsightsPanel } from "@/components/InsightsPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";

type ActivePanel = 'none' | 'scanner' | 'menu' | 'stats' | 'leaderboard' | 'waste' | 'insights';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, stats, activities, logout, isLoading } = useUser();
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');

  // Redirect if not logged in
  if (!isLoading && !user) {
    navigate("/auth");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow">
          <Leaf className="w-16 h-16 text-primary animate-leaf-sway" />
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const isCafeteria = user?.role === "cafeteria";

  const closePanel = () => setActivePanel('none');

  return (
    <div className="min-h-screen relative">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50">
        <div className="glass-strong">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-foreground">EcoTaste Buds</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  {isCafeteria ? <ChefHat className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                  {isCafeteria ? "Cafeteria Dashboard" : "Student Dashboard"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-foreground">{user?.fullName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative">
        {/* Welcome section */}
        <div className="mb-10 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Welcome back, <span className="eco-gradient-text">{user?.fullName?.split(' ')[0]}</span>!
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {isCafeteria
              ? "Manage your cafeteria's sustainable impact"
              : "Track your eco-friendly eating habits"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            {
              icon: TrendingDown,
              title: "Carbon Saved",
              value: `${stats.carbonSaved.toFixed(1)} kg`,
              subtitle: "This month",
              color: "text-primary",
            },
            {
              icon: UtensilsCrossed,
              title: "Meals Tracked",
              value: stats.mealsTracked.toString(),
              subtitle: "Eco-friendly choices",
              color: "text-accent",
            },
            {
              icon: BarChart3,
              title: "Impact Score",
              value: stats.impactScore.toString(),
              subtitle: stats.impactScore >= 50 ? "Top 15% of users" : "Keep going!",
              color: "text-eco-sky",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              variant="elevated"
              className="animate-fade-in-up hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Streak indicator */}
        {stats.currentStreak > 0 && (
          <Card variant="glass" className="mb-10 animate-fade-in">
            <CardContent className="py-4">
              <div className="flex items-center justify-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-destructive to-destructive/60 flex items-center justify-center animate-pulse-glow">
                  <span className="text-xl">🔥</span>
                </div>
                <div>
                  <p className="font-display font-bold text-lg">
                    {stats.currentStreak} Day Streak!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Keep up the eco-friendly eating!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mb-10">
          <h3 className="text-xl font-display font-bold mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isCafeteria ? (
              <>
                <Button 
                  variant="hero" 
                  className="h-auto py-6 flex-col gap-3"
                  onClick={() => setActivePanel('menu')}
                >
                  <UtensilsCrossed className="w-6 h-6" />
                  <span>Manage Menu</span>
                </Button>
                <Button 
                  variant="hero" 
                  className="h-auto py-6 flex-col gap-3"
                  onClick={() => setActivePanel('waste')}
                >
                  <Trash2 className="w-6 h-6" />
                  <span>Log Waste</span>
                </Button>
                <Button 
                  variant="hero" 
                  className="h-auto py-6 flex-col gap-3"
                  onClick={() => setActivePanel('insights')}
                >
                  <Lightbulb className="w-6 h-6" />
                  <span>AI Insights</span>
                </Button>
                <Button 
                  variant="hero" 
                  className="h-auto py-6 flex-col gap-3"
                  onClick={() => setActivePanel('stats')}
                >
                  <BarChart3 className="w-6 h-6" />
                  <span>View Stats</span>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="hero" 
                  className="h-auto py-6 flex-col gap-3"
                  onClick={() => setActivePanel('menu')}
                >
                  <UtensilsCrossed className="w-6 h-6" />
                  <span>Today's Menu</span>
                </Button>
                <Button 
                  variant="hero" 
                  className="h-auto py-6 flex-col gap-3"
                  onClick={() => setActivePanel('scanner')}
                >
                  <Camera className="w-6 h-6" />
                  <span>Scan Meal</span>
                </Button>
                <Button 
                  variant="hero" 
                  className="h-auto py-6 flex-col gap-3"
                  onClick={() => setActivePanel('stats')}
                >
                  <TrendingDown className="w-6 h-6" />
                  <span>My Carbon</span>
                </Button>
                <Button 
                  variant="hero" 
                  className="h-auto py-6 flex-col gap-3"
                  onClick={() => setActivePanel('leaderboard')}
                >
                  <Trophy className="w-6 h-6" />
                  <span>Leaderboard</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <Card variant="elevated" className="animate-fade-in">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest eco-friendly actions</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">No activities yet</p>
                  <p className="text-sm text-muted-foreground">
                    {isCafeteria 
                      ? "Start by adding items to today's menu!"
                      : "Start by logging a meal to track your carbon savings!"}
                  </p>
                </div>
                <Button variant="eco" onClick={() => setActivePanel(isCafeteria ? 'menu' : 'menu')}>
                  {isCafeteria ? (
                    <>
                      <UtensilsCrossed className="w-4 h-4 mr-2" />
                      Add Menu Items
                    </>
                  ) : (
                    <>
                      <UtensilsCrossed className="w-4 h-4 mr-2" />
                      View Today's Menu
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <span className="text-primary font-semibold">
                      -{activity.carbonSaved.toFixed(1)} kg CO₂
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modal Panels */}
      <Dialog open={activePanel === 'scanner'} onOpenChange={(open) => !open && closePanel()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Scan Your Meal
            </DialogTitle>
          </DialogHeader>
          <MealScanner onComplete={closePanel} />
        </DialogContent>
      </Dialog>

      <Dialog open={activePanel === 'menu'} onOpenChange={(open) => !open && closePanel()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              {isCafeteria ? "Manage Today's Menu" : "Today's Menu"}
            </DialogTitle>
          </DialogHeader>
          <MenuViewer isCafeteria={isCafeteria} />
        </DialogContent>
      </Dialog>

      <Dialog open={activePanel === 'stats'} onOpenChange={(open) => !open && closePanel()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Carbon Statistics
            </DialogTitle>
          </DialogHeader>
          <CarbonStats />
        </DialogContent>
      </Dialog>

      <Dialog open={activePanel === 'leaderboard'} onOpenChange={(open) => !open && closePanel()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Leaderboard
            </DialogTitle>
          </DialogHeader>
          <Leaderboard currentUserStats={stats} currentUserName={user?.fullName || ''} />
        </DialogContent>
      </Dialog>

      <Dialog open={activePanel === 'waste'} onOpenChange={(open) => !open && closePanel()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-primary" />
              Log Food Waste
            </DialogTitle>
          </DialogHeader>
          <WasteLogger onComplete={closePanel} />
        </DialogContent>
      </Dialog>

      <Dialog open={activePanel === 'insights'} onOpenChange={(open) => !open && closePanel()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              AI Insights & Recommendations
            </DialogTitle>
          </DialogHeader>
          <InsightsPanel />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;

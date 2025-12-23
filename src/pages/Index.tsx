import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, GraduationCap, ChefHat, TrendingDown, Utensils, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index: React.FC = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: "student" | "cafeteria") => {
    navigate(`/auth?role=${role}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />

        {/* Animated glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center space-y-8">
          {/* Floating icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl glass-strong shadow-glow mb-8 animate-float">
            <Leaf className="w-12 h-12 text-primary animate-leaf-sway" />
          </div>

          {/* Title with gradient */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-foreground leading-tight">
              <span className="eco-gradient-text">Eco</span>
              <span className="text-foreground">Taste</span>
              <span className="eco-gradient-text"> Buds</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" style={{ animationDelay: '0.2s' }}>
              Sustainable eating for students and cafeterias.
              <span className="text-primary"> Track carbon</span>, reduce waste, eat healthy.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button
              size="xl"
              variant="hero"
              onClick={() => handleRoleSelect("student")}
              className="gap-4 group"
            >
              <GraduationCap className="w-6 h-6 group-hover:scale-110 transition-transform" />
              I'm a Student
              <Sparkles className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            <Button
              size="xl"
              variant="hero"
              onClick={() => handleRoleSelect("cafeteria")}
              className="gap-4 group"
            >
              <ChefHat className="w-6 h-6 group-hover:scale-110 transition-transform" />
              I'm Cafeteria Staff
              <Sparkles className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-display font-bold animate-fade-in">
              How It <span className="eco-gradient-text">Works</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Simple steps to reduce your carbon footprint while eating delicious meals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Utensils,
                title: "Daily Menus",
                description: "Cafeterias upload daily menus with health scores and carbon footprint data",
                delay: "0s",
              },
              {
                icon: TrendingDown,
                title: "Track Carbon",
                description: "See real-time carbon emissions from food served and waste generated",
                delay: "0.15s",
              },
              {
                icon: Leaf,
                title: "Make Impact",
                description: "Students choose eco-friendly meals and track their personal carbon savings",
                delay: "0.3s",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group animate-fade-in-up"
                style={{ animationDelay: feature.delay }}
              >
                <div className="glass-strong p-8 rounded-3xl text-center space-y-6 hover-lift group-hover:shadow-glow transition-all duration-500">
                  {/* Icon container */}
                  <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-colors" />
                    <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                      <feature.icon className="w-9 h-9 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-display font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="glass-strong rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-[80px]" />

            <div className="relative space-y-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                Ready to make a <span className="eco-gradient-text">difference</span>?
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Join thousands of students and cafeterias making sustainable food choices every day.
              </p>
              <Button
                size="xl"
                variant="eco"
                onClick={() => navigate("/auth")}
                className="gap-3"
              >
                <Leaf className="w-5 h-5" />
                Get Started Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 EcoTaste Buds. Making sustainable eating accessible for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

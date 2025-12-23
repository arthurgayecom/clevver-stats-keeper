import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Leaf, GraduationCap, ChefHat, KeyRound, Copy, Check, Sparkles, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useUser } from "@/contexts/UserContext";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

type UserRole = "student" | "cafeteria";

const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get("role") as UserRole) || "student";

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState("");
  const [newRecoveryKey, setNewRecoveryKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, register, user } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Auto-switch to signup when role is passed from landing page
  useEffect(() => {
    const roleFromUrl = searchParams.get("role");
    if (roleFromUrl === "student" || roleFromUrl === "cafeteria") {
      setRole(roleFromUrl);
      setIsLogin(false);
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    if (!isLogin) {
      try {
        nameSchema.parse(fullName);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.fullName = e.errors[0].message;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const success = await login(email, password);
        if (success) {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate("/dashboard");
        } else {
          toast({
            title: "Login failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        const result = await register(email, password, fullName, role);
        if (result.success && result.recoveryKey) {
          setNewRecoveryKey(result.recoveryKey);
          toast({
            title: "Account Created!",
            description: "Please save your recovery key.",
          });
        } else {
          toast({
            title: "Registration failed",
            description: "An account with this email already exists.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyRecoveryKey = () => {
    navigator.clipboard.writeText(newRecoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Recovery key copied to clipboard.",
    });
  };

  const proceedAfterRecoveryKey = () => {
    setNewRecoveryKey("");
    toast({
      title: "Account Created!",
      description: "You can now log in with your credentials.",
    });
    setIsLogin(true);
    setEmail("");
    setPassword("");
    setFullName("");
  };

  // Recovery key display
  if (newRecoveryKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[120px]" />
        </div>

        <Card variant="elevated" className="w-full max-w-md animate-scale-in relative">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shadow-glow">
              <KeyRound className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Save Your Recovery Key</CardTitle>
            <CardDescription>
              This key is the only way to recover your account if you forget your password. Store it somewhere safe!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative group">
              <div className="glass-strong p-5 rounded-xl font-mono text-center text-lg tracking-widest border border-primary/30 group-hover:border-primary/50 transition-colors">
                {newRecoveryKey}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={copyRecoveryKey}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              ⚠️ This key will only be shown once. Write it down or save it securely.
            </p>
            <Button onClick={proceedAfterRecoveryKey} variant="eco" className="w-full" size="lg">
              I've Saved My Recovery Key
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Recovery form
  if (showRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[120px]" />
        </div>

        <Card variant="elevated" className="w-full max-w-md animate-scale-in relative">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shadow-glow">
              <KeyRound className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Account Recovery</CardTitle>
            <CardDescription>
              Enter your email and recovery key to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="recovery-email">Email</Label>
              <Input
                id="recovery-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recovery-key">Recovery Key</Label>
              <Input
                id="recovery-key"
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value.toUpperCase())}
              />
            </div>
            <Button 
              variant="eco" 
              className="w-full" 
              size="lg"
              onClick={() => {
                toast({
                  title: "Recovery feature",
                  description: "This would verify your recovery key and allow password reset.",
                });
              }}
            >
              Recover Account
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowRecovery(false)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main auth form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-8 relative animate-fade-in">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="absolute -top-16 left-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow animate-float">
            <Leaf className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground">
            <span className="eco-gradient-text">EcoTaste</span> Buds
          </h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Sustainable eating for a better tomorrow
          </p>
        </div>

        <Card variant="elevated">
          <CardHeader className="pb-4">
            <Tabs
              value={isLogin ? "login" : "signup"}
              onValueChange={(v) => setIsLogin(v === "login")}
            >
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-md">Login</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-md">Sign Up</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Role selection */}
                  <div className="space-y-3">
                    <Label>I am a...</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={role === "student" ? "eco" : "glass"}
                        className="h-auto py-5 flex-col gap-3"
                        onClick={() => setRole("student")}
                      >
                        <GraduationCap className="w-7 h-7" />
                        <span className="font-semibold">Student</span>
                      </Button>
                      <Button
                        type="button"
                        variant={role === "cafeteria" ? "eco" : "glass"}
                        className="h-auto py-5 flex-col gap-3"
                        onClick={() => setRole("cafeteria")}
                      >
                        <ChefHat className="w-7 h-7" />
                        <span className="font-semibold">Cafeteria</span>
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
                variant="eco"
              >
                {isLoading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
              </Button>

              {isLogin && (
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-muted-foreground hover:text-primary"
                  onClick={() => setShowRecovery(true)}
                >
                  Forgot password? Use recovery key
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;

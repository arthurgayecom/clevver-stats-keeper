import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: 'student' | 'cafeteria';
  carbon_saved: number;
  meals_tracked: number;
  impact_score: number;
  current_streak: number;
  last_activity_date: string | null;
  created_at: string;
}

export interface MealRecord {
  id: string;
  user_id: string;
  foods: DetectedFood[];
  total_carbon: number;
  is_plant_based: boolean;
  created_at: string;
}

export interface DetectedFood {
  name: string;
  category: string;
  carbonFootprint: number;
  isPlantBased: boolean;
}

export interface ActivityRecord {
  id: string;
  user_id: string;
  action: string;
  carbon_saved: number;
  created_at: string;
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  meals: MealRecord[];
  activities: ActivityRecord[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string, role: 'student' | 'cafeteria') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  logMeal: (meal: { foods: DetectedFood[]; totalCarbon: number; isPlantBased: boolean }) => Promise<void>;
  addActivity: (action: string, carbonSaved: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile data
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as UserProfile | null;
  };

  // Fetch meals
  const fetchMeals = async (userId: string) => {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching meals:', error);
      return [];
    }
    // Parse the JSONB foods field
    return (data || []).map(meal => ({
      ...meal,
      foods: (meal.foods as unknown as DetectedFood[]) || [],
    })) as MealRecord[];
  };

  // Fetch activities
  const fetchActivities = async (userId: string) => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
    return data as ActivityRecord[];
  };

  // Load all user data
  const loadUserData = async (userId: string) => {
    const [profileData, mealsData, activitiesData] = await Promise.all([
      fetchProfile(userId),
      fetchMeals(userId),
      fetchActivities(userId),
    ]);

    setProfile(profileData);
    setMeals(mealsData);
    setActivities(activitiesData);
  };

  // Set up auth listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid potential race conditions
          setTimeout(() => loadUserData(session.user.id), 0);
        } else {
          setProfile(null);
          setMeals([]);
          setActivities([]);
        }
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: 'student' | 'cafeteria'
  ): Promise<{ success: boolean; error?: string }> => {
    // Sign up user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (signUpError) {
      console.error('Signup error:', signUpError);
      return { success: false, error: signUpError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' };
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        full_name: fullName,
        role: role,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return { success: false, error: profileError.message };
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setMeals([]);
    setActivities([]);
  };

  const logMeal = async (meal: { foods: DetectedFood[]; totalCarbon: number; isPlantBased: boolean }) => {
    if (!user) return;

    // Insert meal - cast foods to JSON compatible type
    const { error: mealError } = await supabase
      .from('meals')
      .insert({
        user_id: user.id,
        foods: JSON.parse(JSON.stringify(meal.foods)),
        total_carbon: meal.totalCarbon,
        is_plant_based: meal.isPlantBased,
      });

    if (mealError) {
      console.error('Error logging meal:', mealError);
      return;
    }

    // Calculate carbon saved
    const carbonSaved = meal.isPlantBased ? meal.totalCarbon * 0.5 : meal.totalCarbon * 0.2;

    // Update profile stats
    if (profile) {
      const today = new Date().toDateString();
      const lastActivity = profile.last_activity_date 
        ? new Date(profile.last_activity_date).toDateString() 
        : '';
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let newStreak = profile.current_streak;
      if (lastActivity === yesterday) {
        newStreak += 1;
      } else if (lastActivity !== today) {
        newStreak = 1;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          carbon_saved: (profile.carbon_saved || 0) + carbonSaved,
          meals_tracked: (profile.meals_tracked || 0) + 1,
          impact_score: Math.min(100, (profile.impact_score || 0) + 3),
          current_streak: newStreak,
          last_activity_date: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
      }
    }

    // Add activity
    await addActivity(
      meal.isPlantBased ? 'Logged plant-based meal' : 'Logged eco-friendly meal',
      carbonSaved
    );

    // Refresh data
    await loadUserData(user.id);
  };

  const addActivity = async (action: string, carbonSaved: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        action,
        carbon_saved: carbonSaved,
      });

    if (error) {
      console.error('Error adding activity:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user.id);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        meals,
        activities,
        isLoading,
        login,
        register,
        logout,
        logMeal,
        addActivity,
        refreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
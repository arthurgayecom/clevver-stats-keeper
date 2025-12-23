import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  UserStats,
  MealRecord,
  ActivityRecord,
  getUserSession,
  saveUserSession,
  clearUserSession,
  getUserStats,
  saveUserStats,
  getMeals,
  saveMeals,
  getActivities,
  saveActivities,
  getRegisteredUsers,
  saveRegisteredUsers,
  generateId,
} from '@/lib/cookies';

interface UserContextType {
  user: UserProfile | null;
  stats: UserStats;
  meals: MealRecord[];
  activities: ActivityRecord[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, role: 'student' | 'cafeteria') => Promise<{ success: boolean; recoveryKey?: string }>;
  logout: () => void;
  logMeal: (meal: Omit<MealRecord, 'id' | 'date'>) => void;
  addActivity: (action: string, carbonSaved: number) => void;
  updateStats: (updates: Partial<UserStats>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    carbonSaved: 0,
    mealsTracked: 0,
    impactScore: 0,
    currentStreak: 0,
    lastActivityDate: '',
  });
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    const savedUser = getUserSession();
    if (savedUser) {
      setUser(savedUser);
      setStats(getUserStats());
      setMeals(getMeals());
      setActivities(getActivities());
    }
    setIsLoading(false);
  }, []);

  // Generate a recovery key
  const generateRecoveryKey = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) key += '-';
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getRegisteredUsers();
    const userEntry = users[email.toLowerCase()];
    
    if (userEntry && userEntry.password === password) {
      const { password: _, ...userProfile } = userEntry;
      setUser(userProfile);
      saveUserSession(userProfile);
      
      // Load user-specific data
      setStats(getUserStats());
      setMeals(getMeals());
      setActivities(getActivities());
      
      return true;
    }
    return false;
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: 'student' | 'cafeteria'
  ): Promise<{ success: boolean; recoveryKey?: string }> => {
    const users = getRegisteredUsers();
    const emailLower = email.toLowerCase();
    
    if (users[emailLower]) {
      return { success: false };
    }

    const recoveryKey = generateRecoveryKey();
    const newUser: UserProfile = {
      id: generateId(),
      email: emailLower,
      fullName,
      role,
      createdAt: new Date().toISOString(),
      recoveryKey,
    };

    users[emailLower] = { ...newUser, password };
    saveRegisteredUsers(users);

    // Initialize fresh stats for new user
    const freshStats: UserStats = {
      carbonSaved: 0,
      mealsTracked: 0,
      impactScore: 0,
      currentStreak: 0,
      lastActivityDate: '',
    };
    saveUserStats(freshStats);
    saveMeals([]);
    saveActivities([]);

    return { success: true, recoveryKey };
  };

  const logout = () => {
    setUser(null);
    setStats({
      carbonSaved: 0,
      mealsTracked: 0,
      impactScore: 0,
      currentStreak: 0,
      lastActivityDate: '',
    });
    setMeals([]);
    setActivities([]);
    clearUserSession();
  };

  const logMeal = (meal: Omit<MealRecord, 'id' | 'date'>) => {
    const newMeal: MealRecord = {
      ...meal,
      id: generateId(),
      date: new Date().toISOString(),
    };

    const updatedMeals = [newMeal, ...meals];
    setMeals(updatedMeals);
    saveMeals(updatedMeals);

    // Update stats
    const today = new Date().toDateString();
    const lastActivity = stats.lastActivityDate ? new Date(stats.lastActivityDate).toDateString() : '';
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    let newStreak = stats.currentStreak;
    if (lastActivity === yesterday) {
      newStreak += 1;
    } else if (lastActivity !== today) {
      newStreak = 1;
    }

    const carbonSaved = meal.isPlantBased ? meal.totalCarbon * 0.5 : meal.totalCarbon * 0.2;
    
    const newStats: UserStats = {
      carbonSaved: stats.carbonSaved + carbonSaved,
      mealsTracked: stats.mealsTracked + 1,
      impactScore: Math.min(100, stats.impactScore + 3),
      currentStreak: newStreak,
      lastActivityDate: new Date().toISOString(),
    };

    setStats(newStats);
    saveUserStats(newStats);

    // Add activity
    addActivity(
      meal.isPlantBased ? 'Logged plant-based meal' : 'Logged eco-friendly meal',
      carbonSaved
    );
  };

  const addActivity = (action: string, carbonSaved: number) => {
    const newActivity: ActivityRecord = {
      id: generateId(),
      action,
      carbonSaved,
      date: new Date().toISOString(),
    };

    const updatedActivities = [newActivity, ...activities].slice(0, 50); // Keep last 50
    setActivities(updatedActivities);
    saveActivities(updatedActivities);
  };

  const updateStats = (updates: Partial<UserStats>) => {
    const newStats = { ...stats, ...updates };
    setStats(newStats);
    saveUserStats(newStats);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        stats,
        meals,
        activities,
        isLoading,
        login,
        register,
        logout,
        logMeal,
        addActivity,
        updateStats,
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

// Cookie utility functions

export const COOKIE_CONSENT_KEY = 'ecotaste_cookie_consent';
export const USER_SESSION_KEY = 'ecotaste_user_session';
export const USER_DATA_KEY = 'ecotaste_user_data';
export const STATS_KEY = 'ecotaste_stats';
export const MEALS_KEY = 'ecotaste_meals';
export const ACTIVITIES_KEY = 'ecotaste_activities';

// Set a cookie with expiration
export function setCookie(name: string, value: string, days: number = 365): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

// Get a cookie value
export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

// Delete a cookie
export function deleteCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

// Check if cookies are consented
export function hasConsentedToCookies(): boolean {
  return getCookie(COOKIE_CONSENT_KEY) === 'true';
}

// Set cookie consent
export function setConsentCookie(consented: boolean): void {
  setCookie(COOKIE_CONSENT_KEY, consented ? 'true' : 'false', 365);
}

// User types
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'cafeteria';
  createdAt: string;
  recoveryKey?: string;
}

export interface UserStats {
  carbonSaved: number;
  mealsTracked: number;
  impactScore: number;
  currentStreak: number;
  lastActivityDate: string;
}

export interface MealRecord {
  id: string;
  date: string;
  foods: DetectedFood[];
  totalCarbon: number;
  isPlantBased: boolean;
}

export interface DetectedFood {
  name: string;
  category: string;
  carbonFootprint: number;
  isPlantBased: boolean;
}

export interface ActivityRecord {
  id: string;
  action: string;
  carbonSaved: number;
  date: string;
}

// Save user session
export function saveUserSession(user: UserProfile): void {
  if (hasConsentedToCookies()) {
    setCookie(USER_SESSION_KEY, JSON.stringify(user), 30);
  }
  // Always use localStorage as backup
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
}

// Get user session
export function getUserSession(): UserProfile | null {
  // Try cookies first
  const cookieData = getCookie(USER_SESSION_KEY);
  if (cookieData) {
    try {
      return JSON.parse(cookieData);
    } catch {
      // Fall through to localStorage
    }
  }
  // Try localStorage
  const localData = localStorage.getItem(USER_SESSION_KEY);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch {
      return null;
    }
  }
  return null;
}

// Clear user session
export function clearUserSession(): void {
  deleteCookie(USER_SESSION_KEY);
  localStorage.removeItem(USER_SESSION_KEY);
}

// Save user stats
export function saveUserStats(stats: UserStats): void {
  const data = JSON.stringify(stats);
  if (hasConsentedToCookies()) {
    setCookie(STATS_KEY, data, 365);
  }
  localStorage.setItem(STATS_KEY, data);
}

// Get user stats
export function getUserStats(): UserStats {
  const defaultStats: UserStats = {
    carbonSaved: 0,
    mealsTracked: 0,
    impactScore: 0,
    currentStreak: 0,
    lastActivityDate: '',
  };

  const cookieData = getCookie(STATS_KEY);
  if (cookieData) {
    try {
      return JSON.parse(cookieData);
    } catch {
      // Fall through
    }
  }

  const localData = localStorage.getItem(STATS_KEY);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch {
      return defaultStats;
    }
  }
  return defaultStats;
}

// Save meals
export function saveMeals(meals: MealRecord[]): void {
  const data = JSON.stringify(meals);
  if (hasConsentedToCookies()) {
    setCookie(MEALS_KEY, data, 365);
  }
  localStorage.setItem(MEALS_KEY, data);
}

// Get meals
export function getMeals(): MealRecord[] {
  const cookieData = getCookie(MEALS_KEY);
  if (cookieData) {
    try {
      return JSON.parse(cookieData);
    } catch {
      // Fall through
    }
  }

  const localData = localStorage.getItem(MEALS_KEY);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch {
      return [];
    }
  }
  return [];
}

// Save activities
export function saveActivities(activities: ActivityRecord[]): void {
  const data = JSON.stringify(activities);
  if (hasConsentedToCookies()) {
    setCookie(ACTIVITIES_KEY, data, 365);
  }
  localStorage.setItem(ACTIVITIES_KEY, data);
}

// Get activities
export function getActivities(): ActivityRecord[] {
  const cookieData = getCookie(ACTIVITIES_KEY);
  if (cookieData) {
    try {
      return JSON.parse(cookieData);
    } catch {
      // Fall through
    }
  }

  const localData = localStorage.getItem(ACTIVITIES_KEY);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch {
      return [];
    }
  }
  return [];
}

// Save registered users (for login verification)
export function saveRegisteredUsers(users: Record<string, UserProfile & { password: string }>): void {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(users));
}

// Get registered users
export function getRegisteredUsers(): Record<string, UserProfile & { password: string }> {
  const data = localStorage.getItem(USER_DATA_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return {};
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

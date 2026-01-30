
import { 
  generateId, 
  hasConsentedToCookies, 
  setCookie, 
  getCookie 
} from './cookies';

const MENU_KEY = 'ecotaste_menu';
const POPULARITY_KEY = 'ecotaste_popularity';
const WASTE_KEY = 'ecotaste_waste';

export interface MenuItem {
  id: string;
  name: string;
  category: 'protein' | 'vegetables' | 'grains' | 'dairy' | 'fruits' | 'beverages';
  carbonFootprint: number;
  isPlantBased: boolean;
  addedDate: string;
}

export interface PopularityRecord {
  itemId: string;
  itemName: string;
  selections: number;
  lastSelected: string;
}

export interface WasteRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: 'low' | 'medium' | 'high';
  date: string;
  notes?: string;
}

// Default menu items
const DEFAULT_MENU: MenuItem[] = [
  { id: '1', name: 'Grilled Chicken', category: 'protein', carbonFootprint: 2.5, isPlantBased: false, addedDate: new Date().toISOString() },
  { id: '2', name: 'Vegetable Stir Fry', category: 'vegetables', carbonFootprint: 0.5, isPlantBased: true, addedDate: new Date().toISOString() },
  { id: '3', name: 'Lentil Soup', category: 'protein', carbonFootprint: 0.4, isPlantBased: true, addedDate: new Date().toISOString() },
  { id: '4', name: 'Brown Rice', category: 'grains', carbonFootprint: 0.8, isPlantBased: true, addedDate: new Date().toISOString() },
  { id: '5', name: 'Garden Salad', category: 'vegetables', carbonFootprint: 0.2, isPlantBased: true, addedDate: new Date().toISOString() },
  { id: '6', name: 'Beef Burger', category: 'protein', carbonFootprint: 4.5, isPlantBased: false, addedDate: new Date().toISOString() },
  { id: '7', name: 'Mashed Potatoes', category: 'vegetables', carbonFootprint: 0.3, isPlantBased: true, addedDate: new Date().toISOString() },
  { id: '8', name: 'Apple Slices', category: 'fruits', carbonFootprint: 0.1, isPlantBased: true, addedDate: new Date().toISOString() },
];

// Save helper
const saveData = (key: string, data: any) => {
  const json = JSON.stringify(data);
  if (hasConsentedToCookies()) {
    setCookie(key, json, 365);
  }
  localStorage.setItem(key, json);
};

// Load helper
const loadData = <T>(key: string, defaultValue: T): T => {
  const cookieData = getCookie(key);
  if (cookieData) {
    try { return JSON.parse(cookieData); } catch {}
  }
  const localData = localStorage.getItem(key);
  if (localData) {
    try { return JSON.parse(localData); } catch {}
  }
  return defaultValue;
};

// Menu functions
export const getMenu = (): MenuItem[] => loadData(MENU_KEY, DEFAULT_MENU);

export const saveMenu = (menu: MenuItem[]) => saveData(MENU_KEY, menu);

export const addMenuItem = (item: Omit<MenuItem, 'id' | 'addedDate'>): MenuItem => {
  const menu = getMenu();
  const newItem: MenuItem = {
    ...item,
    id: generateId(),
    addedDate: new Date().toISOString(),
  };
  saveMenu([...menu, newItem]);
  return newItem;
};

export const removeMenuItem = (id: string) => {
  const menu = getMenu();
  saveMenu(menu.filter(item => item.id !== id));
};

export const clearTodayMenu = () => {
  saveMenu([]);
};

// Popularity functions
export const getPopularity = (): PopularityRecord[] => loadData(POPULARITY_KEY, []);

export const recordSelection = (itemId: string, itemName: string) => {
  const popularity = getPopularity();
  const existing = popularity.find(p => p.itemId === itemId);
  
  if (existing) {
    existing.selections += 1;
    existing.lastSelected = new Date().toISOString();
  } else {
    popularity.push({
      itemId,
      itemName,
      selections: 1,
      lastSelected: new Date().toISOString(),
    });
  }
  
  saveData(POPULARITY_KEY, popularity);
};

export const getTopItems = (limit = 5): PopularityRecord[] => {
  return getPopularity()
    .sort((a, b) => b.selections - a.selections)
    .slice(0, limit);
};

// Waste functions
export const getWasteRecords = (): WasteRecord[] => loadData(WASTE_KEY, []);

export const logWaste = (itemId: string, itemName: string, quantity: 'low' | 'medium' | 'high', notes?: string): WasteRecord => {
  const records = getWasteRecords();
  const newRecord: WasteRecord = {
    id: generateId(),
    itemId,
    itemName,
    quantity,
    date: new Date().toISOString(),
    notes,
  };
  saveData(WASTE_KEY, [...records, newRecord]);
  return newRecord;
};

export const getMostWastedItems = (limit = 5): { itemName: string; wasteScore: number }[] => {
  const records = getWasteRecords();
  const wasteMap: Record<string, number> = {};
  
  records.forEach(record => {
    const score = record.quantity === 'high' ? 3 : record.quantity === 'medium' ? 2 : 1;
    wasteMap[record.itemName] = (wasteMap[record.itemName] || 0) + score;
  });
  
  return Object.entries(wasteMap)
    .map(([itemName, wasteScore]) => ({ itemName, wasteScore }))
    .sort((a, b) => b.wasteScore - a.wasteScore)
    .slice(0, limit);
};

// AI Recommendations
export const getRecommendations = (): { type: 'carbon' | 'popular' | 'waste'; message: string; priority: 'high' | 'medium' | 'low' }[] => {
  const menu = getMenu();
  const popularity = getPopularity();
  const wastedItems = getMostWastedItems();
  const recommendations: { type: 'carbon' | 'popular' | 'waste'; message: string; priority: 'high' | 'medium' | 'low' }[] = [];

  // Carbon recommendations
  const highCarbonItems = menu.filter(item => item.carbonFootprint > 3);
  if (highCarbonItems.length > 0) {
    recommendations.push({
      type: 'carbon',
      message: `Consider replacing ${highCarbonItems[0].name} (${highCarbonItems[0].carbonFootprint}kg CO₂) with plant-based alternatives to reduce carbon footprint by up to 80%`,
      priority: 'high',
    });
  }

  const plantBasedCount = menu.filter(item => item.isPlantBased).length;
  const plantBasedRatio = plantBasedCount / (menu.length || 1);
  if (plantBasedRatio < 0.5) {
    recommendations.push({
      type: 'carbon',
      message: `Only ${Math.round(plantBasedRatio * 100)}% of today's menu is plant-based. Adding more vegetable options can significantly reduce carbon footprint.`,
      priority: 'medium',
    });
  }

  // Popularity recommendations
  const topItems = getTopItems(3);
  if (topItems.length > 0) {
    recommendations.push({
      type: 'popular',
      message: `"${topItems[0].itemName}" is a student favorite with ${topItems[0].selections} selections! Consider keeping it on the menu regularly.`,
      priority: 'low',
    });
  }

  // Waste recommendations
  if (wastedItems.length > 0 && wastedItems[0].wasteScore > 3) {
    recommendations.push({
      type: 'waste',
      message: `"${wastedItems[0].itemName}" has high waste. Consider reducing portion sizes or offering it less frequently.`,
      priority: 'high',
    });
  }

  // General recommendations
  const avgCarbon = menu.reduce((sum, item) => sum + item.carbonFootprint, 0) / (menu.length || 1);
  if (avgCarbon > 1.5) {
    recommendations.push({
      type: 'carbon',
      message: `Today's menu averages ${avgCarbon.toFixed(1)}kg CO₂ per item. Target under 1kg for a sustainable menu!`,
      priority: 'medium',
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};

// Carbon footprint reference data for quick add
export const COMMON_FOODS: Omit<MenuItem, 'id' | 'addedDate'>[] = [
  { name: 'Grilled Chicken', category: 'protein', carbonFootprint: 2.5, isPlantBased: false },
  { name: 'Beef Burger', category: 'protein', carbonFootprint: 4.5, isPlantBased: false },
  { name: 'Fish Fillet', category: 'protein', carbonFootprint: 1.8, isPlantBased: false },
  { name: 'Lentil Soup', category: 'protein', carbonFootprint: 0.4, isPlantBased: true },
  { name: 'Bean Burrito', category: 'protein', carbonFootprint: 0.5, isPlantBased: true },
  { name: 'Tofu Stir Fry', category: 'protein', carbonFootprint: 0.6, isPlantBased: true },
  { name: 'Scrambled Eggs', category: 'protein', carbonFootprint: 1.5, isPlantBased: false },
  { name: 'Garden Salad', category: 'vegetables', carbonFootprint: 0.2, isPlantBased: true },
  { name: 'Steamed Broccoli', category: 'vegetables', carbonFootprint: 0.3, isPlantBased: true },
  { name: 'Roasted Carrots', category: 'vegetables', carbonFootprint: 0.2, isPlantBased: true },
  { name: 'Mashed Potatoes', category: 'vegetables', carbonFootprint: 0.3, isPlantBased: true },
  { name: 'Corn on the Cob', category: 'vegetables', carbonFootprint: 0.3, isPlantBased: true },
  { name: 'Brown Rice', category: 'grains', carbonFootprint: 0.8, isPlantBased: true },
  { name: 'Pasta', category: 'grains', carbonFootprint: 0.6, isPlantBased: true },
  { name: 'Whole Wheat Bread', category: 'grains', carbonFootprint: 0.3, isPlantBased: true },
  { name: 'Quinoa', category: 'grains', carbonFootprint: 0.5, isPlantBased: true },
  { name: 'Mac & Cheese', category: 'dairy', carbonFootprint: 1.8, isPlantBased: false },
  { name: 'Cheese Pizza', category: 'dairy', carbonFootprint: 2.2, isPlantBased: false },
  { name: 'Yogurt Parfait', category: 'dairy', carbonFootprint: 1.2, isPlantBased: false },
  { name: 'Apple Slices', category: 'fruits', carbonFootprint: 0.1, isPlantBased: true },
  { name: 'Orange Wedges', category: 'fruits', carbonFootprint: 0.1, isPlantBased: true },
  { name: 'Banana', category: 'fruits', carbonFootprint: 0.1, isPlantBased: true },
  { name: 'Fruit Cup', category: 'fruits', carbonFootprint: 0.2, isPlantBased: true },
  { name: 'Milk', category: 'beverages', carbonFootprint: 0.8, isPlantBased: false },
  { name: 'Orange Juice', category: 'beverages', carbonFootprint: 0.3, isPlantBased: true },
  { name: 'Water', category: 'beverages', carbonFootprint: 0.01, isPlantBased: true },
];

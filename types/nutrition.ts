export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  quantity: string;
  macros: MacroNutrients;
  healthScore: number;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ScanResult {
  food: FoodItem;
  imageUri: string;
  isHealthy: boolean;
  gamificationMessage: GamificationMessage;
}

export interface GamificationMessage {
  type: 'level_up' | 'cheat_meal' | 'neutral';
  title: string;
  description: string;
  color: string;
}

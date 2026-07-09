export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface DishNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SuggestedDish {
  name: string;
  description?: string;
  ingredients: Ingredient[];
  shoppingList: Ingredient[];
  estimatedMinutes?: number;
  instructions: string[];
  nutrition: DishNutrition;
}

export interface MealSuggestion {
  mealType: string;
  dishes: SuggestedDish[];
}

export interface MealSuggestionInput {
  pantry: Ingredient[];
  mealTypes: string[];
  dishesPerMeal: number;
  dietary?: string[];
  goal: 'gain' | 'lose' | null;
  height: number | null;
  weight: number | null;
}

export interface IMealSuggestionProvider {
  suggest(input: MealSuggestionInput): Promise<MealSuggestion[]>;
}

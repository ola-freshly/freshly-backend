export interface SuggestedDish{
  name: string;
  ingredients: string[];
  description?: string;
  estimatedMinutes?: number;
}

export interface MealSuggestion{
  mealType: string;
  dishes: SuggestedDish[];
}

export interface MealSuggestionInput {
  ingredients: string[];
  mealTypes: string[];
  dishesPerMeal: number;
  dietary?: string[];
  goal: 'gain' | 'lose' | null;
  height: number | null;
  weight: number | null;
}

export interface IMealSuggestionProvider{
  suggest(input:MealSuggestionInput):Promise<MealSuggestion[]>;
}
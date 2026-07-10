export const RECIPE_GENERATION_PROVIDER = 'RECIPE_GENERATION_PROVIDER';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  cuisine?: string | null;
  servings: number;
  estimatedMinutes: number;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: RecipeNutrition;
  missingIngredients: Ingredient[];
}

export interface RecipeGenerationInput {
  pantry: Ingredient[];
  mealType?: string;
  cuisine?: string;
  servings: number;
  goal: 'gain' | 'lose' | null;
  height: number | null;
  weight: number | null;
}

export interface IRecipeGenerationProvider {
  generate(input: RecipeGenerationInput): Promise<GeneratedRecipe>;
}

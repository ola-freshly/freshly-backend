export class CreateRecipeDto {
  title!: string;
  description?: string;
  cuisine?: string;
  servings?: number;
  cookTime?: number;
  instructions!: string;
  ingredients?: {
    ingredientName: string;
    quantity?: number;
    unit?: string;
  }[];
}

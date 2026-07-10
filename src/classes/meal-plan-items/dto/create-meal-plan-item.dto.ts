import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMealPlanItemDto {
  @IsUUID()
  mealPlanId!: string;

  @IsUUID()
  recipeId!: string;

  @IsDateString()
  mealDate!: string;

  @IsString()
  @IsNotEmpty()
  mealType!: string;
}

import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class IngredientDto {
  @IsString()
  @IsNotEmpty()
  ingredientName!: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  cuisine?: string;

  @IsOptional()
  @IsNumber()
  servings?: number;

  @IsOptional()
  @IsNumber()
  cookTime?: number;

  @IsOptional()
  @IsNumber()
  calories?: number;

  @IsOptional()
  @IsNumber()
  protein?: number;

  @IsOptional()
  @IsNumber()
  carbs?: number;

  @IsOptional()
  @IsNumber()
  fat?: number;

  @IsString()
  @IsNotEmpty()
  instructions!: string;

  @IsOptional()
  @IsIn(['breakfast', 'lunch', 'dinner', 'snack'])
  mealType?: string;

  @IsOptional()
  @IsIn(['library', 'plan'])
  source?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients?: IngredientDto[];
}

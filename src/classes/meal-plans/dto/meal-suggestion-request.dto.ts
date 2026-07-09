import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { MealType } from '../entities/meal-plan.entity';

export class MealSuggestionRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(MealType, { each: true })
  mealTypes!: MealType[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  dishesPerMeal?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietary?: string[];
}
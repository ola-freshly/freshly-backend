import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { MealType } from '../entities/meal-plan.entity';

export class QueryMealPlansDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;
}
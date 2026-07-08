import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { MealType } from '../entities/meal-plan.entity';
import { DishDto } from './dish.dto';

export class CreateMealPlanDto {
  @IsDateString()
  date!: string;

  @IsEnum(MealType)
  mealType!: MealType;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DishDto)
  dishes!: DishDto[];
}
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class WeeklyRecommendationDto {
  @IsDateString()
  startDate!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  mealTypes!: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  dishesPerMeal?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  days?: number;
}

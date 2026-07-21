import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class RefreshRecommendationDto {
  @IsDateString()
  mealDate!: string;

  @IsString()
  mealType!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  dishesPerMeal?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeTitles?: string[];
}

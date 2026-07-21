import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GenerateRecipeDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  servings?: number;

  @IsOptional()
  @IsString()
  cuisine?: string;

  @IsOptional()
  @IsString()
  mealType?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

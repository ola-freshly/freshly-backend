import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsObject,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import type { GeneratedRecipe } from '../../../ai/interfaces/recipe-generation-provider.interface';

export class AcceptSuggestionItemDto {
  @IsDateString()
  mealDate!: string;

  @IsString()
  mealType!: string;

  @IsObject()
  recipe!: GeneratedRecipe;
}

export class AcceptRecommendationDto {
  @IsUUID()
  mealPlanId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AcceptSuggestionItemDto)
  suggestions!: AcceptSuggestionItemDto[];
}

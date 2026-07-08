import { Inject, Injectable } from '@nestjs/common';
import {
  IMealSuggestionProvider,
  MealSuggestion,
  MealSuggestionInput,
} from './interfaces/meal-suggestion-provider.interface';

export const MEAL_SUGGESTION_PROVIDER = 'MEAL_SUGGESTION_PROVIDER';
@Injectable()
export class MealSuggestionService {
  constructor(
    @Inject(MEAL_SUGGESTION_PROVIDER)
    private readonly provider : IMealSuggestionProvider,
  ) {}
  
  suggest(input: MealSuggestionInput): Promise<MealSuggestion[]>{
    return this.provider.suggest(input);
  }
}
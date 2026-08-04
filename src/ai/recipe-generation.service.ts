import { Inject, Injectable } from '@nestjs/common';
import { RECIPE_GENERATION_PROVIDER } from './interfaces/recipe-generation-provider.interface';
import type {
  IRecipeGenerationProvider,
  GeneratedRecipe,
  RecipeGenerationInput,
} from './interfaces/recipe-generation-provider.interface';

@Injectable()
export class RecipeGenerationService {
  constructor(
    @Inject(RECIPE_GENERATION_PROVIDER)
    private readonly provider: IRecipeGenerationProvider,
  ) {}

  generate(input: RecipeGenerationInput): Promise<GeneratedRecipe> {
    return this.provider.generate(input);
  }
}

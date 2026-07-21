import { PartialType } from '@nestjs/mapped-types';
import { CreateFavoriteRecipeDto } from './create-favorite-recipe.dto';

export class UpdateFavoriteRecipeDto extends PartialType(
  CreateFavoriteRecipeDto,
) {}

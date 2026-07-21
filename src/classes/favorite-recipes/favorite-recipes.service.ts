import { Injectable } from '@nestjs/common';
import { CreateFavoriteRecipeDto } from './dto/create-favorite-recipe.dto';
import { UpdateFavoriteRecipeDto } from './dto/update-favorite-recipe.dto';

@Injectable()
export class FavoriteRecipesService {
  create(createFavoriteRecipeDto: CreateFavoriteRecipeDto) {
    return createFavoriteRecipeDto;
  }

  findAll() {
    return `This action returns all favoriteRecipes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} favoriteRecipe`;
  }

  update(id: number, updateFavoriteRecipeDto: UpdateFavoriteRecipeDto) {
    return { id, ...updateFavoriteRecipeDto };
  }

  remove(id: number) {
    return `This action removes a #${id} favoriteRecipe`;
  }
}

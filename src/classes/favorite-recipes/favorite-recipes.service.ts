import { Injectable } from '@nestjs/common';
import { CreateFavoriteRecipeDto } from './dto/create-favorite-recipe.dto';
import { UpdateFavoriteRecipeDto } from './dto/update-favorite-recipe.dto';

@Injectable()
export class FavoriteRecipesService {
  create(createFavoriteRecipeDto: CreateFavoriteRecipeDto) {
    return 'This action adds a new favoriteRecipe';
  }

  findAll() {
    return `This action returns all favoriteRecipes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} favoriteRecipe`;
  }

  update(id: number, updateFavoriteRecipeDto: UpdateFavoriteRecipeDto) {
    return `This action updates a #${id} favoriteRecipe`;
  }

  remove(id: number) {
    return `This action removes a #${id} favoriteRecipe`;
  }
}

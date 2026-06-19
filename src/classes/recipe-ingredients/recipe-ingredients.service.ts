import { Injectable } from '@nestjs/common';
import { CreateRecipeIngredientDto } from './dto/create-recipe-ingredient.dto';
import { UpdateRecipeIngredientDto } from './dto/update-recipe-ingredient.dto';

@Injectable()
export class RecipeIngredientsService {
  create(createRecipeIngredientDto: CreateRecipeIngredientDto) {
    return createRecipeIngredientDto;
  }

  findAll() {
    return `This action returns all recipeIngredients`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recipeIngredient`;
  }

  update(id: number, updateRecipeIngredientDto: UpdateRecipeIngredientDto) {
    return { id, ...updateRecipeIngredientDto };
  }

  remove(id: number) {
    return `This action removes a #${id} recipeIngredient`;
  }
}

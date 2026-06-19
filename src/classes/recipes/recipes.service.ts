import { Injectable } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
  create(createRecipeDto: CreateRecipeDto) {
    return createRecipeDto;
  }

  findAll() {
    return `This action returns all recipes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recipe`;
  }

  update(id: number, updateRecipeDto: UpdateRecipeDto) {
    return { id, ...updateRecipeDto };
  }

  remove(id: number) {
    return `This action removes a #${id} recipe`;
  }
}

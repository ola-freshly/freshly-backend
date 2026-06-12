import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecipeIngredientsService } from './recipe-ingredients.service';
import { CreateRecipeIngredientDto } from './dto/create-recipe-ingredient.dto';
import { UpdateRecipeIngredientDto } from './dto/update-recipe-ingredient.dto';

@Controller('recipe-ingredients')
export class RecipeIngredientsController {
  constructor(private readonly recipeIngredientsService: RecipeIngredientsService) {}

  @Post()
  create(@Body() createRecipeIngredientDto: CreateRecipeIngredientDto) {
    return this.recipeIngredientsService.create(createRecipeIngredientDto);
  }

  @Get()
  findAll() {
    return this.recipeIngredientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipeIngredientsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecipeIngredientDto: UpdateRecipeIngredientDto) {
    return this.recipeIngredientsService.update(+id, updateRecipeIngredientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recipeIngredientsService.remove(+id);
  }
}

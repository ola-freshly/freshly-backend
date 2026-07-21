import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FavoriteRecipesService } from './favorite-recipes.service';
import { CreateFavoriteRecipeDto } from './dto/create-favorite-recipe.dto';
import { UpdateFavoriteRecipeDto } from './dto/update-favorite-recipe.dto';

@Controller('favorite-recipes')
export class FavoriteRecipesController {
  constructor(
    private readonly favoriteRecipesService: FavoriteRecipesService,
  ) {}

  @Post()
  create(@Body() createFavoriteRecipeDto: CreateFavoriteRecipeDto) {
    return this.favoriteRecipesService.create(createFavoriteRecipeDto);
  }

  @Get()
  findAll() {
    return this.favoriteRecipesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.favoriteRecipesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFavoriteRecipeDto: UpdateFavoriteRecipeDto,
  ) {
    return this.favoriteRecipesService.update(+id, updateFavoriteRecipeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favoriteRecipesService.remove(+id);
  }
}

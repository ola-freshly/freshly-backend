import { Module } from '@nestjs/common';
import { FavoriteRecipesService } from './favorite-recipes.service';
import { FavoriteRecipesController } from './favorite-recipes.controller';

@Module({
  controllers: [FavoriteRecipesController],
  providers: [FavoriteRecipesService],
})
export class FavoriteRecipesModule {}

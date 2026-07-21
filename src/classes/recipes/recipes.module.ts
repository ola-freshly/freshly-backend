import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from '../recipe-ingredients/entities/recipe-ingredient.entity';
import { MealPlanItem } from '../meal-plan-items/entities/meal-plan-item.entity';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity';
import { User } from '../users/entities/user.entity';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { AiModule } from '../../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recipe,
      RecipeIngredient,
      MealPlanItem,
      PantryItem,
      User,
    ]),
    AiModule,
  ],
  controllers: [RecipesController],
  providers: [RecipesService],
})
export class RecipesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingItem } from './entities/shopping-item.entity';
import { MealPlanItem } from '../meal-plan-items/entities/meal-plan-item.entity';
import { RecipeIngredient } from '../recipe-ingredients/entities/recipe-ingredient.entity';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity';
import { ShoppingListController } from './shopping-list.controller';
import { ShoppingListService } from './shopping-list.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShoppingItem,
      MealPlanItem,
      RecipeIngredient,
      PantryItem,
    ]),
  ],
  controllers: [ShoppingListController],
  providers: [ShoppingListService],
  exports: [ShoppingListService],
})
export class ShoppingListModule {}

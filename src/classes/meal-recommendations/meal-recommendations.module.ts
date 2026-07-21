import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../../ai/ai.module';
import { User } from '../users/entities/user.entity';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity';
import { MealPlan } from '../meal-plans/entities/meal-plan.entity';
import { MealPlanItem } from '../meal-plan-items/entities/meal-plan-item.entity';
import { ShoppingListModule } from '../shopping-list/shopping-list.module';
import { MealRecommendationsController } from './meal-recommendations.controller';
import { MealRecommendationsService } from './meal-recommendations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PantryItem, MealPlan, MealPlanItem]),
    AiModule,
    ShoppingListModule,
  ],
  controllers: [MealRecommendationsController],
  providers: [MealRecommendationsService],
  exports: [MealRecommendationsService],
})
export class MealRecommendationsModule {}

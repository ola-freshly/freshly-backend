import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlanItem } from './entities/meal-plan-item.entity';
import { MealPlan } from '../meal-plans/entities/meal-plan.entity';
import { MealPlanItemsService } from './meal-plan-items.service';
import { MealPlanItemsController } from './meal-plan-items.controller';
import { ShoppingListModule } from '../shopping-list/shopping-list.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MealPlanItem, MealPlan]),
    ShoppingListModule,
  ],
  providers: [MealPlanItemsService],
  controllers: [MealPlanItemsController],
})
export class MealPlanItemsModule {}

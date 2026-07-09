import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { User } from '../users/entities/user.entity';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity';
import { MealPlansService } from './meal-plans.service';
import { MealPlansController } from './meal-plans.controller';
import { AiModule } from '../../ai/ai.module';
import { ShoppingListModule } from '../shopping-list/shopping-list.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MealPlan, User, PantryItem]),
    AiModule,
    ShoppingListModule,
  ],
  providers: [MealPlansService],
  controllers: [MealPlansController],
  exports: [MealPlansService],
})
export class MealPlansModule {}

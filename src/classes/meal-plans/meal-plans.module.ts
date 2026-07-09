import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { User } from '../users/entities/user.entity';
import { MealPlansController } from './meal-plans.controller';
import { MealPlansService } from './meal-plans.service';
import { AiModule } from '../../ai/ai.module';
import { ShoppingListModule } from '../shopping-list/shopping-list.module';

@Module({
  imports: [TypeOrmModule.forFeature([MealPlan, User]), AiModule, ShoppingListModule],
  controllers: [MealPlansController],
  providers: [MealPlansService],
})
export class MealPlansModule {}

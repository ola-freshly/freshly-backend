import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlanItem } from './entities/meal-plan-item.entity';
import { MealPlanItemsService } from './meal-plan-items.service';
import { MealPlanItemsController } from './meal-plan-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MealPlanItem])],
  providers: [MealPlanItemsService],
  controllers: [MealPlanItemsController],
})
export class MealPlanItemsModule {}

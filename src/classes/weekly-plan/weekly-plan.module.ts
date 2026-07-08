import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { User } from '../users/entities/user.entity';
import { WeeklyPlanController } from './weekly-plan.controller';
import { WeeklyPlanService } from './weekly-plan.service';
import { AiModule } from '../../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([MealPlan, User]), AiModule],
  controllers: [WeeklyPlanController],
  providers: [WeeklyPlanService],
})
export class WeeklyPlanModule {}

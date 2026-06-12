import { Module } from '@nestjs/common';
import { NutritionLogService } from './nutrition-log.service';
import { NutritionLogController } from './nutrition-log.controller';

@Module({
  controllers: [NutritionLogController],
  providers: [NutritionLogService],
})
export class NutritionLogModule {}

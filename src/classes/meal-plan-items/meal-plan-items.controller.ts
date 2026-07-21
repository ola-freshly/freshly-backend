import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { MealPlanItemsService } from './meal-plan-items.service';
import { CreateMealPlanItemDto } from './dto/create-meal-plan-item.dto';
import { CurrentUser } from '../users/decorators/current-user.decorator';

@Controller('meal-plan-items')
export class MealPlanItemsController {
  constructor(private readonly mealPlanItemsService: MealPlanItemsService) {}

  @Get()
  findByPlan(
    @CurrentUser() user: { id: string },
    @Query('mealPlanId', ParseUUIDPipe) mealPlanId: string,
  ) {
    return this.mealPlanItemsService.findByPlan(user.id, mealPlanId);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateMealPlanItemDto,
  ) {
    return this.mealPlanItemsService.create(user.id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.mealPlanItemsService.remove(user.id, id);
  }
}

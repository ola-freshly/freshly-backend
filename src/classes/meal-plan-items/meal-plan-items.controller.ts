import {
  BadRequestException,
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

  // Two query modes:
  //   ?mealPlanId=<uuid>      -> items for a single plan
  //   ?from=<date>&to=<date>  -> items across all plans within a date range
  @Get()
  find(
    @CurrentUser() user: { id: string },
    @Query('mealPlanId', new ParseUUIDPipe({ optional: true }))
    mealPlanId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    if (from && to) {
      return this.mealPlanItemsService.findByDateRange(user.id, from, to);
    }

    if (!mealPlanId) {
      throw new BadRequestException(
        'Provide either mealPlanId, or both from and to.',
      );
    }

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

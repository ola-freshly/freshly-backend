import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { QueryMealPlansDto } from './dto/query-meal-plans.dto';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { MealSuggestionRequestDto } from './dto/meal-suggestion-request.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';

@Controller('meal-plans')
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query() query: QueryMealPlansDto,
  ) {
    return this.mealPlansService.findAll(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateMealPlanDto) {
    return this.mealPlansService.create(user.id, dto);
  }

  @Post('suggestions')
  suggest(
    @CurrentUser() user: { id: string },
    @Body() dto: MealSuggestionRequestDto,
  ) {
    return this.mealPlansService.suggest(user.id, dto);
  }

  @Put(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMealPlanDto,
  ) {
    return this.mealPlansService.update(user.id,id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.mealPlansService.remove(user.id, id);
  }
}
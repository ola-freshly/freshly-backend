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
import { WeeklyPlanService } from './weekly-plan.service';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { QueryMealPlansDto } from './dto/query-meal-plans.dto';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { MealSuggestionRequestDto } from './dto/meal-suggestion-request.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';

@Controller('meal-plans')
export class WeeklyPlanController {
  constructor(private readonly weeklyPlanService: WeeklyPlanService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query() query: QueryMealPlansDto,
  ) {
    return this.weeklyPlanService.findAll(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateMealPlanDto) {
    return this.weeklyPlanService.create(user.id, dto);
  }

  @Post('suggestions')
  suggest(
    @CurrentUser() user: { id: string },
    @Body() dto: MealSuggestionRequestDto,
  ) {
    return this.weeklyPlanService.suggest(user.id, dto);
  }

  @Put(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMealPlanDto,
  ) {
    return this.weeklyPlanService.update(user.id,id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.weeklyPlanService.remove(user.id, id);
  }
}
import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { MealRecommendationsService } from './meal-recommendations.service';
import { DailyRecommendationDto } from './dto/daily-recommendation.dto';
import { WeeklyRecommendationDto } from './dto/weekly-recommendation.dto';
import { RefreshRecommendationDto } from './dto/refresh-recommendation.dto';
import { AcceptRecommendationDto } from './dto/accept-recommendation.dto';

@Controller('meal-recommendations')
export class MealRecommendationsController {
  constructor(
    private readonly mealRecommendationsService: MealRecommendationsService,
  ) {}

  @Post('daily')
  daily(
    @CurrentUser() user: { id: string },
    @Body() dto: DailyRecommendationDto,
  ) {
    return this.mealRecommendationsService.daily(user.id, dto);
  }

  @Post('weekly')
  weekly(
    @CurrentUser() user: { id: string },
    @Body() dto: WeeklyRecommendationDto,
  ) {
    return this.mealRecommendationsService.weekly(user.id, dto);
  }

  @Post('refresh')
  refresh(
    @CurrentUser() user: { id: string },
    @Body() dto: RefreshRecommendationDto,
  ) {
    return this.mealRecommendationsService.refresh(user.id, dto);
  }

  @Post('accept')
  accept(
    @CurrentUser() user: { id: string },
    @Body() dto: AcceptRecommendationDto,
  ) {
    return this.mealRecommendationsService.accept(user.id, dto);
  }
}

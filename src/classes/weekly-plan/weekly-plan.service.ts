import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { User } from '../users/entities/user.entity';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { MealSuggestionRequestDto } from './dto/meal-suggestion-request.dto';
import { QueryMealPlansDto } from './dto/query-meal-plans.dto';
import { getSeedPantry } from './seed/seed-pantry';
import { MealSuggestionService } from '../../ai/meal-suggestion.service';

@Injectable()
export class WeeklyPlanService {}

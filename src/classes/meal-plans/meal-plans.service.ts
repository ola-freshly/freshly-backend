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
import { MealSuggestionService } from '../../ai/meal-suggestion.service';
import { ShoppingListService } from '../shopping-list/shopping-list.service';
import type { Ingredient } from '../../ai/interfaces/meal-suggestion-provider.interface';

// Hardcoded pantry stand-in (with quantities). Swap for a real pantry_items query later.
const SEED_PANTRY: Ingredient[] = [
  { name: 'apple', quantity: 3, unit: 'pcs' },
  { name: 'eggs', quantity: 6, unit: 'pcs' },
  { name: 'rice', quantity: 500, unit: 'g' },
  { name: 'noodles', quantity: 250, unit: 'g' },
  { name: 'bread', quantity: 8, unit: 'slices' },
  { name: 'milk', quantity: 1, unit: 'l' },
  { name: 'spinach', quantity: 100, unit: 'g' },
  { name: 'olive oil', quantity: 250, unit: 'ml' },
];

@Injectable()
export class MealPlansService {
  constructor(
    @InjectRepository(MealPlan)
    private readonly mealRepository: Repository<MealPlan>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mealSuggestionService: MealSuggestionService,
    private readonly shoppingListService: ShoppingListService,
  ) {}

  async findAll(userId: string, query: QueryMealPlansDto): Promise<MealPlan[]> {
    const where: FindOptionsWhere<MealPlan>={user:{id:userId}};
    if(query.date){
      where.date=query.date;
    }else if(query.from&&query.to){
      where.date=Between(query.from,query.to);
    }
    if(query.mealType){
      where.mealType=query.mealType;
    }

    return this.mealRepository.find({where,order:{date:'ASC',mealType:'ASC'}});
  }

  async create(userId: string, dto: CreateMealPlanDto): Promise<MealPlan> {
    const existing=await this.mealRepository.findOne({
      where:{user:{id:userId},date:dto.date,mealType:dto.mealType}
    });

    if(existing){
      throw new ConflictException(
        `A ${dto.mealType} plan already exists for ${dto.date}. Use PUT to update it.`,
      );
    }

    const plan=this.mealRepository.create({
      user:{id:userId},
      date:dto.date,
      mealType:dto.mealType,
      dishes:dto.dishes,
    });
    const saved = await this.mealRepository.save(plan);
    await this.shoppingListService.syncFromPlan(userId, saved);
    return saved;
  }

  async suggest(userId:string, dto: MealSuggestionRequestDto){
    const user=await this.userRepository.findOne({where:{id:userId}});

    return this.mealSuggestionService.suggest({
      pantry: SEED_PANTRY,
      mealTypes: dto.mealTypes,
      dishesPerMeal: dto.dishesPerMeal ?? 3,
      dietary: dto.dietary,
      goal: user?.preferredPlan ?? null,
      height: user?.height ?? null,
      weight: user?.weight ?? null,
    });
  }

  async update(userId:string,id:string,dto:UpdateMealPlanDto):Promise<MealPlan> {
    const plan=await this.findOwned(userId,id);
    Object.assign(plan,dto);
    const saved = await this.mealRepository.save(plan);
    await this.shoppingListService.syncFromPlan(userId, saved);
    return saved;
  }

  async remove(userId:string,id:string):Promise<{id:string}> {
    const plan=await this.findOwned(userId,id);
    await this.mealRepository.remove(plan);
    return {id};
  }

  async findOwned(userId:string, id:string):Promise<MealPlan>{
    const plan=await this.mealRepository.findOne({
      where:{id,user:{id:userId}},
    });
    if(!plan){
      throw new NotFoundException('Meal plan not found');
    }
    return plan;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealPlanItem } from './entities/meal-plan-item.entity';
import { MealPlan } from '../meal-plans/entities/meal-plan.entity';
import { CreateMealPlanItemDto } from './dto/create-meal-plan-item.dto';
import { ShoppingListService } from '../shopping-list/shopping-list.service';

@Injectable()
export class MealPlanItemsService {
  constructor(
    @InjectRepository(MealPlanItem)
    private readonly mealPlanItemRepository: Repository<MealPlanItem>,
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
    private readonly shoppingListService: ShoppingListService,
  ) {}

  findByPlan(userId: string, mealPlanId: string): Promise<MealPlanItem[]> {
    return this.mealPlanItemRepository.find({
      where: { mealPlanId, mealPlan: { userId } },
      relations: { recipe: true },
      order: { mealDate: 'ASC' },
    });
  }

  async create(
    userId: string,
    dto: CreateMealPlanItemDto,
  ): Promise<MealPlanItem> {
    const plan = await this.mealPlanRepository.findOne({
      where: { id: dto.mealPlanId, userId },
    });
    if (!plan) {
      throw new NotFoundException('Meal plan not found');
    }

    const item = await this.mealPlanItemRepository.save(
      this.mealPlanItemRepository.create({
        mealPlanId: dto.mealPlanId,
        recipeId: dto.recipeId,
        mealDate: new Date(dto.mealDate),
        mealType: dto.mealType,
      }),
    );

    await this.shoppingListService.syncFromPlan(userId, dto.mealPlanId);
    return item;
  }

  async remove(userId: string, id: string): Promise<{ id: string }> {
    const item = await this.mealPlanItemRepository.findOne({
      where: { id },
      relations: { mealPlan: true },
    });
    if (!item || item.mealPlan.userId !== userId) {
      throw new NotFoundException('Meal plan item not found');
    }

    const planId = item.mealPlanId;
    await this.mealPlanItemRepository.remove(item);
    await this.shoppingListService.syncFromPlan(userId, planId);
    return { id };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';

@Injectable()
export class MealPlansService {
  constructor(
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
  ) {}

  findAll(userId: string): Promise<MealPlan[]> {
    return this.mealPlanRepository.find({
      where: { userId },
      order: { startDate: 'ASC' },
    });
  }

  create(userId: string, dto: CreateMealPlanDto): Promise<MealPlan> {
    const plan = this.mealPlanRepository.create({
      userId,
      name: dto.name,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
    return this.mealPlanRepository.save(plan);
  }

  async findOne(userId: string, id: string): Promise<MealPlan> {
    const plan = await this.mealPlanRepository.findOne({
      where: { id, userId },
    });
    if (!plan) {
      throw new NotFoundException('Meal plan not found');
    }
    return plan;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateMealPlanDto,
  ): Promise<MealPlan> {
    const plan = await this.findOne(userId, id);
    if (dto.name !== undefined) plan.name = dto.name;
    if (dto.startDate !== undefined) plan.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) plan.endDate = new Date(dto.endDate);
    return this.mealPlanRepository.save(plan);
  }

  async remove(userId: string, id: string): Promise<{ id: string }> {
    const plan = await this.findOne(userId, id);
    await this.mealPlanRepository.remove(plan);
    return { id };
  }
}

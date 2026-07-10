import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { MealPlanItem } from '../meal-plan-items/entities/meal-plan-item.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { RecipeIngredient } from '../recipe-ingredients/entities/recipe-ingredient.entity';
import { User, WeightGoal } from '../users/entities/user.entity';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { GenerateDayDto } from './dto/generate-day.dto';
import { RecipeGenerationService } from '../../ai/recipe-generation.service';
import { ShoppingListService } from '../shopping-list/shopping-list.service';

@Injectable()
export class MealPlansService {
  constructor(
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PantryItem)
    private readonly pantryItemRepository: Repository<PantryItem>,
    private readonly recipeGenerationService: RecipeGenerationService,
    private readonly shoppingListService: ShoppingListService,
    private readonly dataSource: DataSource,
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

  /**
   * One-call day generation: for each meal type, AI-generate a recipe, persist
   * it, and link it into the plan on the given date (replacing any existing item
   * in that slot). Recipes + items are written in a single transaction; the
   * shopping list is rebuilt once afterwards. Returns the created items (with
   * their recipes) and the refreshed shopping list.
   */
  async generateForDay(userId: string, planId: string, dto: GenerateDayDto) {
    const plan = await this.mealPlanRepository.findOne({
      where: { id: planId, userId },
    });
    if (!plan) {
      throw new NotFoundException('Meal plan not found');
    }

    // Generation context (loaded once, reused for every meal).
    const [user, pantryItems] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.pantryItemRepository.find({ where: { user: { id: userId } } }),
    ]);
    const pantry = pantryItems.map((p) => ({
      name: p.name,
      quantity: Number(p.quantity),
      unit: p.unit,
    }));
    const goal: 'gain' | 'lose' | null =
      user?.preferredPlan === WeightGoal.GAIN
        ? 'gain'
        : user?.preferredPlan === WeightGoal.LOSE
          ? 'lose'
          : null;

    // 1. External Groq calls first — done OUTSIDE the DB transaction so we don't
    //    hold a transaction open across slow network calls.
    const generated = await Promise.all(
      dto.mealTypes.map(async (mealType) => ({
        mealType,
        recipe: await this.recipeGenerationService.generate({
          pantry,
          mealType,
          servings: 2,
          goal,
          height: user?.height ?? null,
          weight: user?.weight ?? null,
        }),
      })),
    );

    // 2. Persist recipes + items atomically; replace any existing slot item.
    const mealDate = new Date(dto.mealDate);
    const items = await this.dataSource.transaction(async (manager) => {
      const created: MealPlanItem[] = [];
      for (const { mealType, recipe } of generated) {
        await manager.delete(MealPlanItem, {
          mealPlanId: planId,
          mealDate,
          mealType,
        });

        const savedRecipe = await manager.save(
          manager.create(Recipe, {
            title: recipe.title,
            description: recipe.description,
            cuisine: recipe.cuisine ?? undefined,
            servings: recipe.servings,
            cookTime: recipe.estimatedMinutes,
            instructions: recipe.instructions.join('\n'),
            calories: recipe.nutrition?.calories,
            protein: recipe.nutrition?.protein,
            carbs: recipe.nutrition?.carbs,
            fat: recipe.nutrition?.fat,
          }),
        );

        if (recipe.ingredients?.length) {
          await manager.save(
            recipe.ingredients.map((i) =>
              manager.create(RecipeIngredient, {
                recipeId: savedRecipe.id,
                ingredientName: i.name,
                quantity: i.quantity,
                unit: i.unit,
              }),
            ),
          );
        }

        const item = await manager.save(
          manager.create(MealPlanItem, {
            mealPlanId: planId,
            recipeId: savedRecipe.id,
            mealDate,
            mealType,
          }),
        );
        item.recipe = savedRecipe;
        created.push(item);
      }
      return created;
    });

    // 3. Rebuild the shopping list once, after the transaction commits.
    await this.shoppingListService.syncFromPlan(userId, planId);
    const shoppingList = await this.shoppingListService.findAll(userId);

    return { items, shoppingList };
  }
}

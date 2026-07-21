import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RecipeGenerationService } from '../../ai/recipe-generation.service';
import type {
  GeneratedRecipe,
  Ingredient,
} from '../../ai/interfaces/recipe-generation-provider.interface';
import { User, WeightGoal } from '../users/entities/user.entity';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity';
import { MealPlan } from '../meal-plans/entities/meal-plan.entity';
import { MealPlanItem } from '../meal-plan-items/entities/meal-plan-item.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { RecipeIngredient } from '../recipe-ingredients/entities/recipe-ingredient.entity';
import { ShoppingListService } from '../shopping-list/shopping-list.service';
import { DailyRecommendationDto } from './dto/daily-recommendation.dto';
import { WeeklyRecommendationDto } from './dto/weekly-recommendation.dto';
import { RefreshRecommendationDto } from './dto/refresh-recommendation.dto';
import {
  AcceptRecommendationDto,
  AcceptSuggestionItemDto,
} from './dto/accept-recommendation.dto';

type GenerationContext = {
  pantry: Ingredient[];
  goal: 'gain' | 'lose' | null;
  height: number | null;
  weight: number | null;
};

type NutritionSummary = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type RecommendationMeal = {
  mealType: string;
  recipes: GeneratedRecipe[];
  nutritionSummary: NutritionSummary;
};

type RecommendationDay = {
  mealDate: string;
  meals: RecommendationMeal[];
  nutritionSummary: NutritionSummary;
};

@Injectable()
export class MealRecommendationsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PantryItem)
    private readonly pantryItemRepository: Repository<PantryItem>,
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(MealPlanItem)
    private readonly mealPlanItemRepository: Repository<MealPlanItem>,
    private readonly recipeGenerationService: RecipeGenerationService,
    private readonly shoppingListService: ShoppingListService,
    private readonly dataSource: DataSource,
  ) {}

  async daily(userId: string, dto: DailyRecommendationDto) {
    const context = await this.loadContext(userId);
    const dishesPerMeal = dto.dishesPerMeal ?? 1;
    const usedTitles = new Set<string>();

    const meals: RecommendationMeal[] = [];

    for (const rawMealType of dto.mealTypes) {
      const mealType = this.normaliseMealType(rawMealType);

      const recipes = await this.generateUniqueRecipes(
        context,
        mealType,
        dishesPerMeal,
        usedTitles,
      );

      meals.push({
        mealType,
        recipes,
        nutritionSummary: this.getNutritionSummary(recipes),
      });
    }

    return {
      type: 'daily',
      mealDate: dto.mealDate,
      meals,
      nutritionSummary: this.getNutritionSummary(
        meals.flatMap((meal) => meal.recipes),
      ),
    };
  }

  async weekly(userId: string, dto: WeeklyRecommendationDto) {
    const context = await this.loadContext(userId);
    const dishesPerMeal = dto.dishesPerMeal ?? 1;
    const numberOfDays = dto.days ?? 7;
    const usedTitles = new Set<string>();
    const days: RecommendationDay[] = [];

    for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex += 1) {
      const mealDate = this.addDays(dto.startDate, dayIndex);
      const meals: RecommendationMeal[] = [];

      for (const rawMealType of dto.mealTypes) {
        const mealType = this.normaliseMealType(rawMealType);

        const recipes = await this.generateUniqueRecipes(
          context,
          mealType,
          dishesPerMeal,
          usedTitles,
        );

        meals.push({
          mealType,
          recipes,
          nutritionSummary: this.getNutritionSummary(recipes),
        });
      }

      days.push({
        mealDate,
        meals,
        nutritionSummary: this.getNutritionSummary(
          meals.flatMap((meal) => meal.recipes),
        ),
      });
    }

    return {
      type: 'weekly',
      startDate: dto.startDate,
      endDate: this.addDays(dto.startDate, numberOfDays - 1),
      days,
      nutritionSummary: this.getNutritionSummary(
        days.flatMap((day) => day.meals.flatMap((meal) => meal.recipes)),
      ),
    };
  }

  async refresh(userId: string, dto: RefreshRecommendationDto) {
    const context = await this.loadContext(userId);
    const mealType = this.normaliseMealType(dto.mealType);

    const excludedTitles = new Set(
      (dto.excludeTitles ?? []).map((title) => this.normaliseTitle(title)),
    );

    const recipes = await this.generateUniqueRecipes(
      context,
      mealType,
      dto.dishesPerMeal ?? 1,
      excludedTitles,
    );

    return {
      type: 'refresh',
      mealDate: dto.mealDate,
      mealType,
      recipes,
      nutritionSummary: this.getNutritionSummary(recipes),
    };
  }

  async accept(userId: string, dto: AcceptRecommendationDto) {
    const plan = await this.mealPlanRepository.findOne({
      where: {
        id: dto.mealPlanId,
        userId,
      },
    });

    if (!plan) {
      throw new NotFoundException('Meal plan not found');
    }

    const existingRows = await this.dataSource.query<
      Array<{
        mealDate: string;
        mealType: string;
        title: string;
      }>
    >(
      `
        SELECT
          mpi.meal_date::text AS "mealDate",
          mpi.meal_type AS "mealType",
          recipe.title AS "title"
        FROM meal_plan_items AS mpi
        INNER JOIN recipes AS recipe
          ON recipe.id = mpi.recipe_id
        WHERE mpi.meal_plan_id = $1
      `,
      [dto.mealPlanId],
    );

    const existingKeys = new Set(
      existingRows.map((row) =>
        this.getDuplicateKey(
          String(row.mealDate).slice(0, 10),
          row.mealType,
          row.title,
        ),
      ),
    );

    const acceptedSuggestions: AcceptSuggestionItemDto[] = [];
    const skippedDuplicates: string[] = [];

    for (const suggestion of dto.suggestions) {
      this.validateGeneratedRecipe(suggestion.recipe);

      const duplicateKey = this.getDuplicateKey(
        suggestion.mealDate,
        suggestion.mealType,
        suggestion.recipe.title,
      );

      if (existingKeys.has(duplicateKey)) {
        skippedDuplicates.push(suggestion.recipe.title.trim());
        continue;
      }

      existingKeys.add(duplicateKey);
      acceptedSuggestions.push(suggestion);
    }

    const items = await this.dataSource.transaction(async (manager) => {
      const createdItems: MealPlanItem[] = [];

      for (const suggestion of acceptedSuggestions) {
        const recipe = suggestion.recipe;

        const savedRecipe = await manager.save(
          manager.create(Recipe, {
            title: recipe.title.trim(),
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
            recipe.ingredients.map((ingredient) =>
              manager.create(RecipeIngredient, {
                recipeId: savedRecipe.id,
                ingredientName: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
              }),
            ),
          );
        }

        const mealPlanItem = await manager.save(
          manager.create(MealPlanItem, {
            mealPlanId: dto.mealPlanId,
            recipeId: savedRecipe.id,
            mealDate: suggestion.mealDate.slice(0, 10) as unknown as Date,
            mealType: this.normaliseMealType(suggestion.mealType),
          }),
        );

        mealPlanItem.recipe = savedRecipe;
        createdItems.push(mealPlanItem);
      }

      return createdItems;
    });

    if (items.length > 0) {
      await this.shoppingListService.syncFromPlan(userId, dto.mealPlanId);
    }

    const shoppingList = await this.shoppingListService.findAll(userId);

    return {
      acceptedCount: items.length,
      skippedDuplicateCount: skippedDuplicates.length,
      skippedDuplicates,
      items,
      shoppingList,
    };
  }

  private async loadContext(userId: string): Promise<GenerationContext> {
    const [user, pantryItems] = await Promise.all([
      this.userRepository.findOne({
        where: {
          id: userId,
        },
      }),
      this.pantryItemRepository.find({
        where: {
          user: {
            id: userId,
          },
        },
      }),
    ]);

    const pantry: Ingredient[] = pantryItems.map((item) => ({
      name: item.name,
      quantity: Number(item.quantity),
      unit: item.unit,
    }));

    const goal: 'gain' | 'lose' | null =
      user?.preferredPlan === WeightGoal.GAIN
        ? 'gain'
        : user?.preferredPlan === WeightGoal.LOSE
          ? 'lose'
          : null;

    return {
      pantry,
      goal,
      height: user?.height ?? null,
      weight: user?.weight ?? null,
    };
  }

  private async generateUniqueRecipes(
    context: GenerationContext,
    mealType: string,
    requestedCount: number,
    usedTitles: Set<string>,
  ): Promise<GeneratedRecipe[]> {
    const generatedRecipes: GeneratedRecipe[] = [];
    const maximumAttempts = requestedCount * 4;
    let attempts = 0;

    while (
      generatedRecipes.length < requestedCount &&
      attempts < maximumAttempts
    ) {
      attempts += 1;

      const recipe = await this.recipeGenerationService.generate({
        pantry: context.pantry,
        mealType,
        servings: 2,
        goal: context.goal,
        height: context.height,
        weight: context.weight,
      });

      const normalisedTitle = this.normaliseTitle(recipe.title);

      if (!normalisedTitle || usedTitles.has(normalisedTitle)) {
        continue;
      }

      usedTitles.add(normalisedTitle);
      generatedRecipes.push(recipe);
    }

    return generatedRecipes;
  }

  private getNutritionSummary(recipes: GeneratedRecipe[]) {
    return recipes.reduce(
      (total, recipe) => ({
        calories: total.calories + Number(recipe.nutrition?.calories ?? 0),
        protein: total.protein + Number(recipe.nutrition?.protein ?? 0),
        carbs: total.carbs + Number(recipe.nutrition?.carbs ?? 0),
        fat: total.fat + Number(recipe.nutrition?.fat ?? 0),
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    );
  }

  private validateGeneratedRecipe(recipe: GeneratedRecipe) {
    if (!recipe?.title?.trim()) {
      throw new BadRequestException('Each accepted recipe must have a title');
    }

    if (
      !Array.isArray(recipe.instructions) ||
      recipe.instructions.length === 0
    ) {
      throw new BadRequestException(
        `Recipe "${recipe.title}" must have instructions`,
      );
    }
  }

  private getDuplicateKey(mealDate: string, mealType: string, title: string) {
    return [
      mealDate.slice(0, 10),
      this.normaliseMealType(mealType),
      this.normaliseTitle(title),
    ].join('|');
  }

  private normaliseTitle(title: string) {
    return title.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private normaliseMealType(mealType: string) {
    return mealType.trim().toLowerCase();
  }

  private parseDate(value: string) {
    return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  }

  private toDateString(date: Date | string) {
    if (typeof date === 'string') {
      return date.slice(0, 10);
    }

    return date.toISOString().slice(0, 10);
  }

  private addDays(dateString: string, amount: number) {
    const date = this.parseDate(dateString);
    date.setUTCDate(date.getUTCDate() + amount);
    return date.toISOString().slice(0, 10);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { GenerateRecipeDto } from './dto/generate-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from '../recipe-ingredients/entities/recipe-ingredient.entity';
import { MealPlanItem } from '../meal-plan-items/entities/meal-plan-item.entity';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity';
import { User, WeightGoal } from '../users/entities/user.entity';
import { RecipeGenerationService } from '../../ai/recipe-generation.service';
import { FindRecipesQueryDto } from './dto/find-recipes-query.dto';
import { Paginated } from '../../common/pagination/paginated';
import { DEFAULT_PAGE_LIMIT } from '../../common/pagination/pagination-query.dto';
import { decodeCursor, encodeCursor } from '../../common/pagination/cursor';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientRepository: Repository<RecipeIngredient>,
    @InjectRepository(MealPlanItem)
    private readonly mealPlanItemRepository: Repository<MealPlanItem>,
    @InjectRepository(PantryItem)
    private readonly pantryItemRepository: Repository<PantryItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly recipeGenerationService: RecipeGenerationService,
  ) {}

  async create(createRecipeDto: CreateRecipeDto) {
    const { ingredients, ...recipeData } = createRecipeDto;

    const recipe = await this.recipeRepository.save(recipeData);

    if (ingredients?.length) {
      const recipeIngredients = ingredients.map((ingredient) =>
        this.recipeIngredientRepository.create({
          recipeId: recipe.id,
          ingredientName: ingredient.ingredientName,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
        }),
      );

      await this.recipeIngredientRepository.save(recipeIngredients);
    }

    return this.findOne(recipe.id);
  }

  // Generation is a stateless AI *preview*: it never writes to the DB, so the
  // client can freely "generate another" (with refinement notes) and only
  // persist via POST /recipes once the user chooses to save.
  async generate(userId: string, dto: GenerateRecipeDto) {
    const [user, pantryItems] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.pantryItemRepository.find({ where: { user: { id: userId } } }),
    ]);

    return this.recipeGenerationService.generate({
      pantry: pantryItems.map((p) => ({
        name: p.name,
        quantity: Number(p.quantity),
        unit: p.unit,
      })),
      mealType: dto.mealType,
      cuisine: dto.cuisine,
      notes: dto.notes,
      servings: dto.servings ?? 2,
      goal:
        user?.preferredPlan === WeightGoal.GAIN
          ? 'gain'
          : user?.preferredPlan === WeightGoal.LOSE
            ? 'lose'
            : null,
      height: user?.height ?? null,
      weight: user?.weight ?? null,
    });
  }

  // Lists library recipes only ('plan'-sourced recipes are attached to a meal
  // plan and stay out of the library). An optional mealType narrows by category,
  // filtered in the database rather than in memory.
  async findAll(query: FindRecipesQueryDto): Promise<Paginated<Recipe>> {
    const limit = query.limit ?? DEFAULT_PAGE_LIMIT;

    const qb = this.recipeRepository
      .createQueryBuilder('recipe')
      .where('recipe.source = :source', { source: 'library' })
      .orderBy('recipe.createdAt', 'DESC')
      .addOrderBy('recipe.id', 'DESC')
      // One extra row tells us whether another page exists, without a COUNT.
      .take(limit + 1);

    if (query.mealType) {
      qb.andWhere('recipe.mealType = :mealType', { mealType: query.mealType });
    }

    if (query.cursor) {
      const { createdAt, id } = decodeCursor(query.cursor);
      qb.andWhere(
        '(recipe.createdAt, recipe.id) < (:cursorCreatedAt, :cursorId)',
        {
          cursorCreatedAt: createdAt,
          cursorId: id,
        },
      );
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];

    return {
      items,
      hasMore,
      nextCursor: hasMore && last ? encodeCursor(last) : null,
    };
  }

  async findOne(id: string) {
    const recipe = await this.recipeRepository.findOne({ where: { id } });

    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    const ingredients = await this.recipeIngredientRepository.find({
      where: { recipeId: id },
    });

    return { ...recipe, ingredients };
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto) {
    const recipe = await this.findOne(id);

    await this.recipeRepository.save({
      ...recipe,
      ...updateRecipeDto,
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    const recipe = await this.findOne(id);
    // Remove rows that reference this recipe before deleting it, otherwise the
    // foreign keys on recipe_ingredients / meal_plan_items block the delete.
    await this.mealPlanItemRepository.delete({ recipeId: id });
    await this.recipeIngredientRepository.delete({ recipeId: id });
    await this.recipeRepository.remove(recipe);

    return { deleted: true, id };
  }
}

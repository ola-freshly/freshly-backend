import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { GenerateRecipeDto } from './dto/generate-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from '../recipe-ingredients/entities/recipe-ingredient.entity';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity';
import { User, WeightGoal } from '../users/entities/user.entity';
import { RecipeGenerationService } from '../../ai/recipe-generation.service';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientRepository: Repository<RecipeIngredient>,
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

  async generate(userId: string, dto: GenerateRecipeDto) {
    const [user, pantryItems] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.pantryItemRepository.find({ where: { user: { id: userId } } }),
    ]);

    const generated = await this.recipeGenerationService.generate({
      pantry: pantryItems.map((p) => ({
        name: p.name,
        quantity: Number(p.quantity),
        unit: p.unit,
      })),
      mealType: dto.mealType,
      cuisine: dto.cuisine,
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

    const recipe = await this.recipeRepository.save(
      this.recipeRepository.create({
        title: generated.title,
        description: generated.description,
        cuisine: generated.cuisine ?? undefined,
        servings: generated.servings,
        cookTime: generated.estimatedMinutes,
        instructions: generated.instructions.join('\n'),
        calories: generated.nutrition?.calories,
        protein: generated.nutrition?.protein,
        carbs: generated.nutrition?.carbs,
        fat: generated.nutrition?.fat,
      }),
    );

    if (generated.ingredients?.length) {
      await this.recipeIngredientRepository.save(
        generated.ingredients.map((i) =>
          this.recipeIngredientRepository.create({
            recipeId: recipe.id,
            ingredientName: i.name,
            quantity: i.quantity,
            unit: i.unit,
          }),
        ),
      );
    }

    const saved = await this.findOne(recipe.id);
    return { ...saved, missingIngredients: generated.missingIngredients ?? [] };
  }

  findAll() {
    return this.recipeRepository.find();
  }

  async findOne(id: string) {
    const recipe = await this.recipeRepository.findOne({ where: { id } });

    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    return recipe;
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
    await this.recipeRepository.remove(recipe);

    return { deleted: true, id };
  }
}

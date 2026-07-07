import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { GenerateRecipeDto } from './dto/generate-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from '../recipe-ingredients/entities/recipe-ingredient.entity';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientRepository: Repository<RecipeIngredient>,
    @InjectRepository(PantryItem)
    private readonly pantryItemRepository: Repository<PantryItem>,
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

  async generate(generateRecipeDto: GenerateRecipeDto) {
    const pantryItems = await this.pantryItemRepository.find();

    const availableIngredients = pantryItems.map((item) => item.name);
    const missingIngredients =
      availableIngredients.length > 0
        ? []
        : ['Pantry ingredients are required'];

    return {
      title: generateRecipeDto.cuisine
        ? `${generateRecipeDto.cuisine} Pantry Recipe`
        : 'Pantry Recipe',
      description: 'AI-generated recipe based on available pantry ingredients.',
      ingredients: availableIngredients,
      instructions:
        availableIngredients.length > 0
          ? `Use ${availableIngredients.join(', ')} to prepare a simple meal.`
          : 'Add pantry ingredients before generating a recipe.',
      estimatedTime: 30,
      servings: generateRecipeDto.servings ?? 2,
      missingIngredients,
    };
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

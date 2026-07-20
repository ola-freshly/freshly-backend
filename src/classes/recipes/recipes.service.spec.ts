import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity';
import { RecipeIngredient } from '../recipe-ingredients/entities/recipe-ingredient.entity';
import { MealPlanItem } from '../meal-plan-items/entities/meal-plan-item.entity';
import { User } from '../users/entities/user.entity';
import { Recipe } from './entities/recipe.entity';
import { RecipesService } from './recipes.service';
import { RecipeGenerationService } from '../../ai/recipe-generation.service';

const mockRepository = {
  create: jest.fn((x) => x),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
};

const mockGenerationService = {
  generate: jest.fn(),
};

describe('RecipesService', () => {
  let service: RecipesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        { provide: getRepositoryToken(Recipe), useValue: mockRepository },
        {
          provide: getRepositoryToken(RecipeIngredient),
          useValue: mockRepository,
        },
        { provide: getRepositoryToken(MealPlanItem), useValue: mockRepository },
        { provide: getRepositoryToken(PantryItem), useValue: mockRepository },
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: RecipeGenerationService, useValue: mockGenerationService },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('generate returns an AI preview and forwards notes without persisting', async () => {
    const preview = {
      title: 'Egg Fried Rice',
      description: 'Quick fried rice.',
      cuisine: 'Asian',
      servings: 2,
      estimatedMinutes: 20,
      ingredients: [{ name: 'rice', quantity: 200, unit: 'g' }],
      instructions: ['Cook the rice', 'Fry everything'],
      nutrition: { calories: 500, protein: 20, carbs: 60, fat: 15 },
      missingIngredients: [],
    };

    mockRepository.findOne.mockResolvedValueOnce({ id: 'u1' }); // user lookup
    mockRepository.find.mockResolvedValueOnce([]); // pantry lookup
    mockGenerationService.generate.mockResolvedValueOnce(preview);

    const result = await service.generate('u1', {
      servings: 2,
      cuisine: 'Asian',
      mealType: 'dinner',
      notes: 'make it more like breakfast',
    });

    expect(mockGenerationService.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: 'make it more like breakfast',
        servings: 2,
        cuisine: 'Asian',
        mealType: 'dinner',
      }),
    );
    expect(mockRepository.save).not.toHaveBeenCalled();
    expect(result).toEqual(preview);
  });

  it('create persists nutrition fields when provided', async () => {
    mockRepository.save.mockResolvedValueOnce({ id: 'r1' });
    mockRepository.findOne.mockResolvedValueOnce({ id: 'r1' });
    mockRepository.find.mockResolvedValueOnce([]);

    await service.create({
      title: 'Egg Fried Rice',
      instructions: 'Cook and serve.',
      calories: 500,
      protein: 20,
      carbs: 60,
      fat: 15,
    });

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ calories: 500, protein: 20, carbs: 60, fat: 15 }),
    );
  });
});

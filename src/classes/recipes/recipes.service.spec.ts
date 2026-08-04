import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity';
import { RecipeIngredient } from '../recipe-ingredients/entities/recipe-ingredient.entity';
import { MealPlanItem } from '../meal-plan-items/entities/meal-plan-item.entity';
import { User } from '../users/entities/user.entity';
import { Recipe } from './entities/recipe.entity';
import { RecipesService } from './recipes.service';
import { RecipeGenerationService } from '../../ai/recipe-generation.service';
import { BadRequestException } from '@nestjs/common';
import { encodeCursor } from '../../common/pagination/cursor';

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

const mockRepository = {
  create: jest.fn((x: unknown) => x),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

const mockGenerationService = {
  generate: jest.fn(),
};

describe('RecipesService', () => {
  let service: RecipesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // clearAllMocks wipes the chaining set up at declaration, so re-arm it.
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.where.mockReturnThis();
    mockQueryBuilder.andWhere.mockReturnThis();
    mockQueryBuilder.orderBy.mockReturnThis();
    mockQueryBuilder.addOrderBy.mockReturnThis();
    mockQueryBuilder.take.mockReturnThis();

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
      expect.objectContaining({
        calories: 500,
        protein: 20,
        carbs: 60,
        fat: 15,
      }),
    );
  });

  describe('findAll pagination', () => {
    const rowAt = (n: number) => ({
      id: `id-${n}`,
      title: `Recipe ${n}`,
      createdAt: new Date(Date.UTC(2026, 0, 100 - n)),
    });

    it('returns an empty page when there are no recipes', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      const result = await service.findAll({ limit: 20 });

      expect(result).toEqual({ items: [], nextCursor: null, hasMore: false });
    });

    it('fetches limit + 1 rows and trims the extra one', async () => {
      const rows = Array.from({ length: 3 }, (_, i) => rowAt(i));
      mockQueryBuilder.getMany.mockResolvedValueOnce(rows);

      const result = await service.findAll({ limit: 2 });

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(3);
      expect(result.items).toHaveLength(2);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).not.toBeNull();
    });

    it('reports hasMore false when the page is exactly the limit', async () => {
      const rows = Array.from({ length: 2 }, (_, i) => rowAt(i));
      mockQueryBuilder.getMany.mockResolvedValueOnce(rows);

      const result = await service.findAll({ limit: 2 });

      expect(result.items).toHaveLength(2);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('anchors the next cursor to the last returned row', async () => {
      const rows = Array.from({ length: 3 }, (_, i) => rowAt(i));
      mockQueryBuilder.getMany.mockResolvedValueOnce(rows);

      const result = await service.findAll({ limit: 2 });

      expect(result.nextCursor).toBe(encodeCursor(rowAt(1)));
    });

    it('orders by created_at then id so ties cannot straddle a page boundary', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      await service.findAll({ limit: 20 });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'recipe.createdAt',
        'DESC',
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'recipe.id',
        'DESC',
      );
    });

    it('applies a balanced row-comparison predicate when given a cursor', async () => {
      const anchor = rowAt(0);
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      await service.findAll({ limit: 20, cursor: encodeCursor(anchor) });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(recipe.createdAt, recipe.id) < (:cursorCreatedAt, :cursorId)',
        { cursorCreatedAt: anchor.createdAt, cursorId: anchor.id },
      );
    });

    it('keeps the mealType filter', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      await service.findAll({ limit: 20, mealType: 'dinner' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'recipe.mealType = :mealType',
        { mealType: 'dinner' },
      );
    });

    it('filters by title when a search query is given', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      await service.findAll({ limit: 20, q: 'curry' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'recipe.title ILIKE :q',
        { q: '%curry%' },
      );
    });

    it('escapes LIKE metacharacters in the search query', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      await service.findAll({ limit: 20, q: '50% off_day' });

      // Without escaping, % and _ would act as wildcards and match far too much.
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'recipe.title ILIKE :q',
        { q: '%50\\% off\\_day%' },
      );
    });

    it('combines search with the mealType filter', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      await service.findAll({ limit: 20, q: 'rice', mealType: 'dinner' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'recipe.mealType = :mealType',
        { mealType: 'dinner' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'recipe.title ILIKE :q',
        { q: '%rice%' },
      );
    });

    it('ignores an empty search query', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      await service.findAll({ limit: 20, q: '' });

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(
        'recipe.title ILIKE :q',
        expect.anything(),
      );
    });

    it('rejects a malformed cursor', async () => {
      await expect(
        service.findAll({ limit: 20, cursor: 'garbage!!' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity';
import { RecipeIngredient } from '../recipe-ingredients/entities/recipe-ingredient.entity';
import { User } from '../users/entities/user.entity';
import { Recipe } from './entities/recipe.entity';
import { RecipesService } from './recipes.service';
import { RecipeGenerationService } from '../../ai/recipe-generation.service';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

describe('RecipesService', () => {
  let service: RecipesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: getRepositoryToken(Recipe),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(RecipeIngredient),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(PantryItem),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: RecipeGenerationService,
          useValue: { generate: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

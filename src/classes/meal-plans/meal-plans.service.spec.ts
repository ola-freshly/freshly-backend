import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MealPlansService } from './meal-plans.service';
import { MealPlan } from './entities/meal-plan.entity';
import { MealPlanItem } from '../meal-plan-items/entities/meal-plan-item.entity';
import { User } from '../users/entities/user.entity';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity';
import { RecipeGenerationService } from '../../ai/recipe-generation.service';
import { ShoppingListService } from '../shopping-list/shopping-list.service';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

describe('MealPlansService', () => {
  let service: MealPlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealPlansService,
        { provide: getRepositoryToken(MealPlan), useValue: mockRepository },
        { provide: getRepositoryToken(MealPlanItem), useValue: mockRepository },
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: getRepositoryToken(PantryItem), useValue: mockRepository },
        { provide: RecipeGenerationService, useValue: { generate: jest.fn() } },
        {
          provide: ShoppingListService,
          useValue: { syncFromPlan: jest.fn(), findAll: jest.fn() },
        },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
      ],
    }).compile();

    service = module.get<MealPlansService>(MealPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

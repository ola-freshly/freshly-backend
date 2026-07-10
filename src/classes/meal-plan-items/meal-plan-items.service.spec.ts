import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MealPlanItemsService } from './meal-plan-items.service';
import { MealPlanItem } from './entities/meal-plan-item.entity';
import { MealPlan } from '../meal-plans/entities/meal-plan.entity';
import { ShoppingListService } from '../shopping-list/shopping-list.service';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

describe('MealPlanItemsService', () => {
  let service: MealPlanItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealPlanItemsService,
        { provide: getRepositoryToken(MealPlanItem), useValue: mockRepository },
        { provide: getRepositoryToken(MealPlan), useValue: mockRepository },
        { provide: ShoppingListService, useValue: { syncFromPlan: jest.fn() } },
      ],
    }).compile();

    service = module.get<MealPlanItemsService>(MealPlanItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

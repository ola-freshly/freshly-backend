import { Test, TestingModule } from '@nestjs/testing';
import { MealPlanItemsService } from './meal-plan-items.service';

describe('MealPlanItemsService', () => {
  let service: MealPlanItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MealPlanItemsService],
    }).compile();

    service = module.get<MealPlanItemsService>(MealPlanItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

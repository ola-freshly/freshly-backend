import { Test, TestingModule } from '@nestjs/testing';
import { MealPlanItemsController } from './meal-plan-items.controller';

describe('MealPlanItemsController', () => {
  let controller: MealPlanItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealPlanItemsController],
    }).compile();

    controller = module.get<MealPlanItemsController>(MealPlanItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

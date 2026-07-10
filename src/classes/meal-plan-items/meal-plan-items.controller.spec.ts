import { Test, TestingModule } from '@nestjs/testing';
import { MealPlanItemsController } from './meal-plan-items.controller';
import { MealPlanItemsService } from './meal-plan-items.service';

describe('MealPlanItemsController', () => {
  let controller: MealPlanItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealPlanItemsController],
      providers: [{ provide: MealPlanItemsService, useValue: {} }],
    }).compile();

    controller = module.get<MealPlanItemsController>(MealPlanItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PantryItemsService } from './pantry-items.service';
import { PantryItem } from './entities/pantry-item.entity';
import { FoodCategory } from './entities/food-category.entity';
import { AiVisionService } from '../../ai/ai-vision.service';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

const mockFoodCategoryRepository = {
  findOne: jest.fn(),
};

const mockAiVisionService = {
  analyzeFood: jest.fn(),
};

describe('PantryItemsService', () => {
  let service: PantryItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PantryItemsService,
        { provide: getRepositoryToken(PantryItem), useValue: mockRepository },
        {
          provide: getRepositoryToken(FoodCategory),
          useValue: mockFoodCategoryRepository,
        },
        { provide: AiVisionService, useValue: mockAiVisionService },
      ],
    }).compile();

    service = module.get<PantryItemsService>(PantryItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

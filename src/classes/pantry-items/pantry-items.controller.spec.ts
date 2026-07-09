import { Test, TestingModule } from '@nestjs/testing';
import { PantryItemsController } from './pantry-items.controller';
import { PantryItemsService } from './pantry-items.service';

const mockPantryItemsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  scanImage: jest.fn(),
};

describe('PantryItemsController', () => {
  let controller: PantryItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PantryItemsController],
      providers: [
        { provide: PantryItemsService, useValue: mockPantryItemsService },
      ],
    }).compile();

    controller = module.get<PantryItemsController>(PantryItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

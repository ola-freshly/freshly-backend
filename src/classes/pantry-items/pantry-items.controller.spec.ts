import { Test, TestingModule } from '@nestjs/testing';
import { PantryItemsController } from './pantry-items.controller';
import { PantryItemsService } from './pantry-items.service';

describe('PantryItemsController', () => {
  let controller: PantryItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PantryItemsController],
      providers: [PantryItemsService],
    }).compile();

    controller = module.get<PantryItemsController>(PantryItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

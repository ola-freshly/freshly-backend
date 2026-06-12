import { Test, TestingModule } from '@nestjs/testing';
import { PantryItemsService } from './pantry-items.service';

describe('PantryItemsService', () => {
  let service: PantryItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PantryItemsService],
    }).compile();

    service = module.get<PantryItemsService>(PantryItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

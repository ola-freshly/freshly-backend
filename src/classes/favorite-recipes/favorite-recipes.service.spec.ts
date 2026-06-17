import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteRecipesService } from './favorite-recipes.service';

describe('FavoriteRecipesService', () => {
  let service: FavoriteRecipesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FavoriteRecipesService],
    }).compile();

    service = module.get<FavoriteRecipesService>(FavoriteRecipesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

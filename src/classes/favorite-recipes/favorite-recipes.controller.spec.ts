import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteRecipesController } from './favorite-recipes.controller';
import { FavoriteRecipesService } from './favorite-recipes.service';

describe('FavoriteRecipesController', () => {
  let controller: FavoriteRecipesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoriteRecipesController],
      providers: [FavoriteRecipesService],
    }).compile();

    controller = module.get<FavoriteRecipesController>(FavoriteRecipesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

const mockRecipesService = {
  create: jest.fn(),
  generate: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('RecipesController', () => {
  let controller: RecipesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [
        {
          provide: RecipesService,
          useValue: mockRecipesService,
        },
      ],
    }).compile();

    controller = module.get<RecipesController>(RecipesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes the whole query object through to the service', async () => {
    const page = { items: [], nextCursor: null, hasMore: false };
    mockRecipesService.findAll.mockResolvedValueOnce(page);

    // mealType shares the DTO with cursor/limit because the global
    // ValidationPipe runs forbidNonWhitelisted — a param missing from the
    // bound DTO would 400 rather than be ignored.
    const query = { mealType: 'dinner', cursor: 'abc', limit: 10 };
    const result = await controller.findAll(query);

    expect(mockRecipesService.findAll).toHaveBeenCalledWith(query);
    expect(result).toBe(page);
  });
});

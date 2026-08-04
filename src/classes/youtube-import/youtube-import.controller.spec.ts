import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeImportController } from './youtube-import.controller';
import { YoutubeImportService } from './youtube-import.service';

describe('YoutubeImportController', () => {
  let controller: YoutubeImportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YoutubeImportController],
      providers: [YoutubeImportService],
    }).compile();

    controller = module.get<YoutubeImportController>(YoutubeImportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

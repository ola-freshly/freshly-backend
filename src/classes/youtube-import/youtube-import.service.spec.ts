import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeImportService } from './youtube-import.service';

describe('YoutubeImportService', () => {
  let service: YoutubeImportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YoutubeImportService],
    }).compile();

    service = module.get<YoutubeImportService>(YoutubeImportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

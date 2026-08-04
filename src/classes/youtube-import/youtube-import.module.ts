import { Module } from '@nestjs/common';
import { YoutubeImportService } from './youtube-import.service';
import { YoutubeImportController } from './youtube-import.controller';

@Module({
  controllers: [YoutubeImportController],
  providers: [YoutubeImportService],
})
export class YoutubeImportModule {}

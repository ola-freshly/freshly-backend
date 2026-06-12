import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { YoutubeImportService } from './youtube-import.service';
import { CreateYoutubeImportDto } from './dto/create-youtube-import.dto';
import { UpdateYoutubeImportDto } from './dto/update-youtube-import.dto';

@Controller('youtube-import')
export class YoutubeImportController {
  constructor(private readonly youtubeImportService: YoutubeImportService) {}

  @Post()
  create(@Body() createYoutubeImportDto: CreateYoutubeImportDto) {
    return this.youtubeImportService.create(createYoutubeImportDto);
  }

  @Get()
  findAll() {
    return this.youtubeImportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.youtubeImportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateYoutubeImportDto: UpdateYoutubeImportDto) {
    return this.youtubeImportService.update(+id, updateYoutubeImportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.youtubeImportService.remove(+id);
  }
}

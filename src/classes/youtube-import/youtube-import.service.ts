import { Injectable } from '@nestjs/common';
import { CreateYoutubeImportDto } from './dto/create-youtube-import.dto';
import { UpdateYoutubeImportDto } from './dto/update-youtube-import.dto';

@Injectable()
export class YoutubeImportService {
  create(createYoutubeImportDto: CreateYoutubeImportDto) {
    return 'This action adds a new youtubeImport';
  }

  findAll() {
    return `This action returns all youtubeImport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} youtubeImport`;
  }

  update(id: number, updateYoutubeImportDto: UpdateYoutubeImportDto) {
    return `This action updates a #${id} youtubeImport`;
  }

  remove(id: number) {
    return `This action removes a #${id} youtubeImport`;
  }
}

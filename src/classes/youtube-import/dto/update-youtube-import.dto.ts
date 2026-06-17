import { PartialType } from '@nestjs/mapped-types';
import { CreateYoutubeImportDto } from './create-youtube-import.dto';

export class UpdateYoutubeImportDto extends PartialType(CreateYoutubeImportDto) {}

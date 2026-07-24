import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PantryItemsService } from './pantry-items.service';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';
import { MergePantryItemsDto } from './dto/merge-pantry-items.dto';
import { ScanBarcodeDto } from './dto/scan-barcode.dto';
import { CurrentUser } from '../users/decorators/current-user.decorator';

@Controller('pantry-items')
export class PantryItemsController {
  constructor(private readonly pantryItemsService: PantryItemsService) {}

  @Post()
  create(
    @Body() createPantryItemDto: CreatePantryItemDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.pantryItemsService.create(user.id, createPantryItemDto);
  }

  @Post('scan-image')
  @UseInterceptors(FileInterceptor('image'))
  scanImage(@UploadedFile() uploadedFile: Express.Multer.File) {
    return this.pantryItemsService.scanImage(uploadedFile);
  }

  @Post('scan-barcode')
  scanBarcode(@Body() scanBarcodeDto: ScanBarcodeDto) {
    return this.pantryItemsService.scanBarcode(scanBarcodeDto);
  }

  @Post('merge')
  merge(
    @Body() mergePantryItemsDto: MergePantryItemsDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.pantryItemsService.merge(user.id, mergePantryItemsDto);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.pantryItemsService.findAll(user.id);
  }

  // Declared before `:id` so "categories" isn't captured as an item id.
  @Get('categories')
  getCategories() {
    return this.pantryItemsService.listCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.pantryItemsService.findOne(user.id, id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePantryItemDto: UpdatePantryItemDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.pantryItemsService.update(user.id, id, updatePantryItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.pantryItemsService.remove(user.id, id);
  }
}

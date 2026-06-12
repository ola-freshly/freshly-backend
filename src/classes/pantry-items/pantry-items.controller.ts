import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PantryItemsService } from './pantry-items.service';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';

@Controller('pantry-items')
export class PantryItemsController {
  constructor(private readonly pantryItemsService: PantryItemsService) {}

  @Post()
  create(@Body() createPantryItemDto: CreatePantryItemDto) {
    return this.pantryItemsService.create(createPantryItemDto);
  }

  @Get()
  findAll() {
    return this.pantryItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pantryItemsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePantryItemDto: UpdatePantryItemDto) {
    return this.pantryItemsService.update(+id, updatePantryItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pantryItemsService.remove(+id);
  }
}

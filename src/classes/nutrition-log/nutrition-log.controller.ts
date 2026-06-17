import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NutritionLogService } from './nutrition-log.service';
import { CreateNutritionLogDto } from './dto/create-nutrition-log.dto';
import { UpdateNutritionLogDto } from './dto/update-nutrition-log.dto';

@Controller('nutrition-log')
export class NutritionLogController {
  constructor(private readonly nutritionLogService: NutritionLogService) {}

  @Post()
  create(@Body() createNutritionLogDto: CreateNutritionLogDto) {
    return this.nutritionLogService.create(createNutritionLogDto);
  }

  @Get()
  findAll() {
    return this.nutritionLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nutritionLogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNutritionLogDto: UpdateNutritionLogDto) {
    return this.nutritionLogService.update(+id, updateNutritionLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nutritionLogService.remove(+id);
  }
}

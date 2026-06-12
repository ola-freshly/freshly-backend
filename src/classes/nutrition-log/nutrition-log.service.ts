import { Injectable } from '@nestjs/common';
import { CreateNutritionLogDto } from './dto/create-nutrition-log.dto';
import { UpdateNutritionLogDto } from './dto/update-nutrition-log.dto';

@Injectable()
export class NutritionLogService {
  create(createNutritionLogDto: CreateNutritionLogDto) {
    return 'This action adds a new nutritionLog';
  }

  findAll() {
    return `This action returns all nutritionLog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nutritionLog`;
  }

  update(id: number, updateNutritionLogDto: UpdateNutritionLogDto) {
    return `This action updates a #${id} nutritionLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} nutritionLog`;
  }
}

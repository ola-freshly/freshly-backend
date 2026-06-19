import { Injectable } from '@nestjs/common';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';

@Injectable()
export class PantryItemsService {
  create(createPantryItemDto: CreatePantryItemDto) {
    return createPantryItemDto;
  }

  findAll() {
    return `This action returns all pantryItems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pantryItem`;
  }

  update(id: number, updatePantryItemDto: UpdatePantryItemDto) {
    return { id, ...updatePantryItemDto };
  }

  remove(id: number) {
    return `This action removes a #${id} pantryItem`;
  }
}

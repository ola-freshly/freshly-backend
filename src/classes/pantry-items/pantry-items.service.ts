import { Injectable } from '@nestjs/common';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';

@Injectable()
export class PantryItemsService {
  create(createPantryItemDto: CreatePantryItemDto) {
    return 'This action adds a new pantryItem';
  }

  findAll() {
    return `This action returns all pantryItems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pantryItem`;
  }

  update(id: number, updatePantryItemDto: UpdatePantryItemDto) {
    return `This action updates a #${id} pantryItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} pantryItem`;
  }
}

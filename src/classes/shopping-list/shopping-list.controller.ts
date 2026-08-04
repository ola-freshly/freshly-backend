import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';
import { CreateShoppingItemDto } from './dto/create-shopping-item.dto';
import { UpdateShoppingItemDto } from './dto/update-shopping-item.dto';
import { CurrentUser } from '../users/decorators/current-user.decorator';

@Controller('shopping-list')
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.shoppingListService.findAll(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateShoppingItemDto,
  ) {
    return this.shoppingListService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShoppingItemDto,
  ) {
    return this.shoppingListService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.shoppingListService.remove(user.id, id);
  }
}

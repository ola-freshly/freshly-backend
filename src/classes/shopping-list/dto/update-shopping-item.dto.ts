import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateShoppingItemDto } from './create-shopping-item.dto';

export class UpdateShoppingItemDto extends PartialType(CreateShoppingItemDto) {
  @IsOptional()
  @IsBoolean()
  purchased?: boolean;
}

import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  Min,
} from 'class-validator';
import { FoodCategory, PantryItemSource } from '../entities/pantry-item.entity';

export class CreatePantryItemDto {
  @IsString()
  name!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsString()
  unit!: string;

  @IsOptional()
  @IsEnum(FoodCategory)
  category?: FoodCategory;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  usageInstruction?: string;

  @IsOptional()
  @IsEnum(PantryItemSource)
  source?: PantryItemSource;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

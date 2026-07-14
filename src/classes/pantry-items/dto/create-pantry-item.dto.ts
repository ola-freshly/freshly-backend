import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  IsIn,
  Min,
} from 'class-validator';
import { PantryItemSource } from '../entities/pantry-item.entity';

const FOOD_CATEGORY_SLUGS = [
  'dairy',
  'vegetable',
  'fruit',
  'meat',
  'seafood',
  'grain',
  'spice',
  'beverage',
  'snack',
  'condiment',
  'other',
] as const;

export class CreatePantryItemDto {
  @IsString()
  name!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsString()
  unit!: string;

  @IsOptional()
  @IsString()
  @IsIn(FOOD_CATEGORY_SLUGS)
  category?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

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

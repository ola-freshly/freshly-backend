import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class MergePantryItemsDto {
  // The items to merge (>= 2). All must belong to the requesting user.
  @IsArray()
  @ArrayMinSize(2)
  @IsUUID('4', { each: true })
  itemIds!: string[];

  // The surviving row — its category/metadata is kept.
  @IsUUID()
  primaryId!: string;

  // The name to keep. Omit when the items share a name (case-insensitively);
  // send one of the existing names to resolve a conflict.
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  // The expiry to keep. Omit when all items share one; send a date to resolve a
  // conflict, or explicit null for "no expiry". @IsOptional() also permits null.
  @IsOptional()
  @IsDateString()
  expiryDate?: string | null;
}

import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateShoppingItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  unit!: string;
}

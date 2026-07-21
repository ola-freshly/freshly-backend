import { ArrayMinSize, IsArray, IsDateString, IsString } from 'class-validator';

export class GenerateDayDto {
  @IsDateString()
  mealDate!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  mealTypes!: string[];
}

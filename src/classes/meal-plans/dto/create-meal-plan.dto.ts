import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateMealPlanDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}

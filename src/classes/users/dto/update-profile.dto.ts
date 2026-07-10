import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { WeightGoal } from '../entities/user.entity';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(500)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(500)
  height?: number;

  @IsOptional()
  @IsEnum(WeightGoal)
  preferredPlan?: WeightGoal;
}

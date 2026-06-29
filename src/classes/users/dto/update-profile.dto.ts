import { IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @ValidateIf((o) => o.avatarUrl !== null)
  @IsUrl()
  avatarUrl?: string | null;
}

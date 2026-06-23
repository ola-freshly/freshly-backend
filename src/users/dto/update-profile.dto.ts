import {
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'full_name must be at most 100 characters' })
  full_name?: string;

  @IsOptional()
  @IsString()
  @Length(3, 30, {
    message: 'username must be between 3 and 30 characters',
  })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message:
      'username may only contain letters, numbers, underscores, dots, and hyphens',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'bio must be at most 300 characters' })
  bio?: string | null;

  @IsOptional()
  @IsUrl({}, { message: 'avatar_url must be a valid URL' })
  avatar_url?: string | null;

  @IsOptional()
  @IsArray({ message: 'dietary_preferences must be an array' })
  @IsString({ each: true })
  dietary_preferences?: string[] | null;
}

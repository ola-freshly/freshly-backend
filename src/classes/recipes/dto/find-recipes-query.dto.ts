import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto';

export class FindRecipesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  mealType?: string;

  // Free-text title search. Trimmed here so a whitespace-only query behaves the
  // same as no query at all, and capped so it can't be used to push huge
  // patterns into the LIKE.
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  q?: string;
}

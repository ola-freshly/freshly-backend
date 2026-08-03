import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 50;

export class PaginationQueryDto {
  @IsOptional()
  @IsString()
  cursor?:string;

  @IsOptional()
  @Type(()=>Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_LIMIT)
  limit:number=DEFAULT_PAGE_LIMIT;

}

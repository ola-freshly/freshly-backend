import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto';
import { IsOptional, IsString } from 'class-validator';

export class FindRecipesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  mealType?: string;
}

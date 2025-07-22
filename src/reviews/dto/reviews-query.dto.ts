import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ReviewsQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

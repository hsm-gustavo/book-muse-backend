import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class FollowQueryDto {
  @IsOptional()
  @IsString()
  cursor?: { followerId: string; followedId: string };

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

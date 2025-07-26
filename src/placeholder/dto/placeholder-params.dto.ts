import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class PlaceholderParamsDto {
  @ApiProperty({ example: 300, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  width: number;

  @ApiProperty({ example: 200, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  height: number;
}

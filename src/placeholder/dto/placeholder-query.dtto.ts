import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class PlaceholderQueryDto {
  @ApiPropertyOptional({
    description: 'Custom text to display in the image',
    example: 'Hello World',
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({
    description: 'Image format',
    example: 'png',
    enum: ['png', 'jpeg'],
  })
  @IsOptional()
  @IsIn(['png', 'jpeg'])
  format?: 'png' | 'jpeg';
}

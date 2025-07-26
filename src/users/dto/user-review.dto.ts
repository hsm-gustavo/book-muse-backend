import { ApiProperty } from '@nestjs/swagger';

export class UserReviewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;
}

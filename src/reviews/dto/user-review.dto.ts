import { ApiProperty } from '@nestjs/swagger';

class ReviewLikeDto {
  @ApiProperty()
  userId: string;
}

export class UserReviewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  openLibraryId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  userId: string | null;

  @ApiProperty({ type: () => [ReviewLikeDto] })
  likes: ReviewLikeDto[];

  constructor(data: UserReviewDto) {
    Object.assign(this, data);
  }
}

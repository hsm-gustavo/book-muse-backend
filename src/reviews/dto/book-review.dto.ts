import { ApiProperty } from '@nestjs/swagger';

class SlimUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  profilePicture: string | null;
}

class ReviewLikeDto {
  @ApiProperty()
  userId: string;
}

export class RawReviewDto {
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

  @ApiProperty({ type: () => SlimUserDto, nullable: true })
  user: SlimUserDto | null;

  @ApiProperty({ type: () => [ReviewLikeDto] })
  likes: ReviewLikeDto[];

  constructor(data: RawReviewDto) {
    Object.assign(this, data);
  }
}

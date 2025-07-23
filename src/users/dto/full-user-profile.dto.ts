import { ApiProperty } from '@nestjs/swagger';
import { UserReviewDto } from './user-review.dto';

export class FullUserProfileDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty({ required: false })
  profilePicture?: string | null;
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  followersCount: number;
  @ApiProperty()
  followingCount: number;
  @ApiProperty()
  readBooksCount: number;

  @ApiProperty({ required: false })
  isFollowing?: boolean; // depends on viewerId

  @ApiProperty({ type: [UserReviewDto], required: false })
  recentReviews?: UserReviewDto[];
}

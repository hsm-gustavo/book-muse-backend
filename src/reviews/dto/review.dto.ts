import { ApiProperty } from '@nestjs/swagger';
import { Review, User } from 'generated/prisma';

class AuthorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  profilePicture?: string | null;
}

export class ReviewDto {
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

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  likedByMe: boolean;

  @ApiProperty({
    nullable: true,
    type: () => AuthorDto,
  })
  author: AuthorDto | null;

  constructor(input: {
    review: Omit<Review, 'user'> & {
      user: Pick<User, 'id' | 'name' | 'profilePicture'> | null;
    };
    likeCount: number;
    likedByMe: boolean;
  }) {
    const { review, likeCount, likedByMe } = input;

    this.id = review.id;
    this.title = review.title;
    this.description = review.description;
    this.rating = review.rating;
    this.openLibraryId = review.openLibraryId;
    this.createdAt = review.createdAt;
    this.updatedAt = review.updatedAt;
    this.likeCount = likeCount;
    this.likedByMe = likedByMe;

    this.author = review.user
      ? {
          id: review.user.id,
          name: review.user.name,
          profilePicture: review.user.profilePicture,
        }
      : null;
  }
}

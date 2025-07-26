import { ApiProperty } from '@nestjs/swagger';
import { UserReviewDto } from './user-review.dto';

export class PaginatedUserReviewsDto {
  @ApiProperty({ type: [UserReviewDto] })
  data: UserReviewDto[];

  @ApiProperty({ type: String, nullable: true })
  nextCursor?: string;

  @ApiProperty()
  hasNextPage: boolean;

  constructor(input: {
    data: UserReviewDto[];
    nextCursor?: string;
    hasNextPage: boolean;
  }) {
    this.data = input.data;
    this.nextCursor = input.nextCursor;
    this.hasNextPage = input.hasNextPage;
  }
}

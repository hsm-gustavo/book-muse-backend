import { ApiProperty } from '@nestjs/swagger';
import { RawReviewDto } from './book-review.dto';

export class PaginatedReviewsDto {
  @ApiProperty({ type: [RawReviewDto] })
  data: RawReviewDto[];

  @ApiProperty({ type: String, nullable: true })
  nextCursor?: string;

  @ApiProperty()
  hasNextPage: boolean;

  constructor(input: {
    data: RawReviewDto[];
    nextCursor?: string;
    hasNextPage: boolean;
  }) {
    this.data = input.data;
    this.nextCursor = input.nextCursor;
    this.hasNextPage = input.hasNextPage;
  }
}

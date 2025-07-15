import { ApiProperty } from '@nestjs/swagger';
import { BookSearchResultSwagger } from './book-search-result.swagger';

export class BookSearchResponseSwagger {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  perPage: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty({ type: [BookSearchResultSwagger] })
  results: BookSearchResultSwagger[];
}

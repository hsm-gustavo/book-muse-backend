import { OpenLibrarySearchInterface } from '../interfaces/open-library-search.interface';
import { BookSearchResultDto } from './book-search-result.dto';

export class BookSearchResponseDto {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  results: BookSearchResultDto[];

  constructor(data: OpenLibrarySearchInterface, page: number) {
    this.total = data.numFound;
    this.page = page;
    this.perPage = 100; // Open Library API returns 100 results per page by default
    this.totalPages = Math.ceil(this.total / 100);
    this.results = data.docs.map((doc) => new BookSearchResultDto(doc));
  }
}

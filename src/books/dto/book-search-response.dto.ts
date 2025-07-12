import { HttpService } from '@nestjs/axios';
import { OpenLibrarySearchInterface } from '../interfaces/open-library-search.interface';
import { BookSearchResultDto } from './book-search-result.dto';
import { Cache } from 'cache-manager';

export class BookSearchResponseDto {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  results: BookSearchResultDto[];

  constructor(total: number, page: number, results: BookSearchResultDto[]) {
    this.total = total;
    this.page = page;
    this.perPage = 100; // Open Library API returns 100 results per page by default
    this.totalPages = Math.ceil(this.total / 100);
    this.results = results;
  }

  static async create(
    data: OpenLibrarySearchInterface,
    page: number,
    httpService: HttpService,
    cache: Cache,
  ): Promise<BookSearchResponseDto> {
    const results = await Promise.all(
      data.docs.map((doc) =>
        BookSearchResultDto.create(doc, httpService, cache),
      ),
    );

    return new BookSearchResponseDto(data.numFound, page, results);
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { BookDetailsDto } from './dto/book-details.dto';
import { OpenLibrarySearchInterface } from './interfaces/open-library-search.interface';
import { OpenLibraryIsbnInterface } from './interfaces/open-library-isbn.interface';
import { BookSearchResponseDto } from './dto/book-search-response.dto';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getBookByIsbn(isbn: string) {
    const cacheKey = `book:isbn:${isbn}`;
    const cachedBook = await this.cacheManager.get<BookDetailsDto>(cacheKey);

    if (cachedBook) {
      this.logger.debug(`Cache hit for ISBN: ${isbn}`);
      return cachedBook;
    }

    this.logger.debug(`Fetching ISBN ${isbn} from Open Library...`);

    try {
      const url = `https://openlibrary.org/isbn/${isbn}.json`;
      const response = await firstValueFrom(
        this.httpService.get<OpenLibraryIsbnInterface>(url),
      );
      const data = response.data;
      const dto = new BookDetailsDto(data);
      await this.cacheManager.set(cacheKey, dto);
      return dto;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to fetch book: ${error.message}`);
      }
      throw error;
    }
  }

  async searchBooks(query: string, page = 1) {
    const cacheKey = `book:search:${query}:page:${page}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for search "${query}" on page ${page}`);
      return cached;
    }

    this.logger.debug(
      `Fetching title '${query}' on page ${page} from Open Library...`,
    );

    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&page=${page}`;
      const response = await firstValueFrom(
        this.httpService.get<OpenLibrarySearchInterface>(url),
      );
      const data = response.data;

      const dto = new BookSearchResponseDto(data, page);

      await this.cacheManager.set(cacheKey, dto);
      return dto;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to search books: ${error.message}`);
      }
      throw error;
    }
  }
}

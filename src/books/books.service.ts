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

  async getAuthorNames(authorKeys: string[]): Promise<string[]> {
    const names: string[] = [];

    for (const key of authorKeys) {
      const authorId = key.split('/').pop();
      if (!authorId) continue;

      const cacheKey = `author:${authorId}`;
      const cached = await this.cacheManager.get<string>(cacheKey);
      if (cached) {
        names.push(cached);
        continue;
      }

      try {
        const res = await firstValueFrom(
          this.httpService.get<{ name: string }>(
            `https://openlibrary.org/authors/${authorId}.json`,
          ),
        );
        const name = res.data.name;
        await this.cacheManager.set(cacheKey, name, 60 * 60 * 24); // cache 24h
        names.push(name);
      } catch {
        this.logger.warn(`Failed to fetch author ${authorId}`);
      }
    }

    return names;
  }

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

      const authorKeys = data.authors?.map((a) => a.key) ?? [];
      const authorNames = await this.getAuthorNames(authorKeys);

      const dto = new BookDetailsDto(
        data,
        authorNames.length ? authorNames : undefined,
      );
      await this.cacheManager.set(cacheKey, dto);
      return dto;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to fetch book: ${error.message}`);
      }
      throw error;
    }
  }

  async getBookByOlid(olid: string) {
    const cacheKey = `book:olid:${olid}`;
    const cachedBook = await this.cacheManager.get<BookDetailsDto>(cacheKey);

    if (cachedBook) {
      this.logger.debug(`Cache hit for OLID: ${olid}`);
      return cachedBook;
    }

    this.logger.debug(`Fetching olid ${olid} from Open Library...`);

    try {
      const url = `https://openlibrary.org/books/${olid}.json`;
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

      const dto = await BookSearchResponseDto.create(
        data,
        page,
        this.httpService,
        this.cacheManager,
      );

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

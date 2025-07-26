import { OpenLibrarySearchInterface } from '../interfaces/open-library-search.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OpenLibraryEditionInterface } from '../interfaces/open-library-edition.interface';
import { Cache } from 'cache-manager';

export class BookSearchResultDto {
  title: string;
  authorNames: string[];
  coverId?: number;
  firstPublishYear?: number;
  editionCount: number;
  language: string[];
  openLibraryKey: string;
  editionKey?: string;
  isbn10?: string[];
  isbn13?: string[];

  constructor(data: OpenLibrarySearchInterface['docs'][number]) {
    this.title = data.title;
    this.authorNames = data.author_name;
    this.coverId = data.cover_i;
    this.firstPublishYear = data.first_publish_year;
    this.editionCount = data.edition_count;
    this.language = data.language;
    this.openLibraryKey = data.key;
    this.editionKey = data.cover_edition_key;
  }

  static async create(
    data: OpenLibrarySearchInterface['docs'][number],
    httpService: HttpService,
    cache: Cache,
  ): Promise<BookSearchResultDto> {
    const dto = new BookSearchResultDto(data);

    if (!dto.editionKey) return dto;
    const cacheKey = `book:edition:${dto.editionKey}`;
    const cached = await cache.get<OpenLibraryEditionInterface>(cacheKey);

    let edition: OpenLibraryEditionInterface | null = null;

    if (cached) {
      edition = cached;
    } else {
      try {
        const res = await firstValueFrom(
          httpService.get<OpenLibraryEditionInterface>(
            `https://openlibrary.org/books/${dto.editionKey}.json`,
          ),
        );
        edition = res.data;
        await cache.set(cacheKey, edition, 60 * 60); // 1h
      } catch {
        edition = null;
      }
    }

    dto.isbn10 = edition?.isbn_10 ?? [];
    dto.isbn13 = edition?.isbn_13 ?? [];

    return dto;
  }
}

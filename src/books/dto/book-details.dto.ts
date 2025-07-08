import { OpenLibraryIsbnInterface } from '../interfaces/open-library-isbn.interface';

export class BookDetailsDto {
  title: string;
  subtitle?: string;
  description?: string;
  authors?: string[];
  publishDate?: string;
  publishers?: string[];
  series?: string[];
  covers?: number[];
  coverUrl?: string;
  numberOfPages?: number;
  isbn10?: string[];
  isbn13?: string[];
  identifiers?: {
    librarything?: string[];
    goodreads?: string[];
  };
  workId?: string;

  constructor(data: OpenLibraryIsbnInterface) {
    this.title = data.title;
    this.subtitle = data.subtitle;
    this.publishDate = data.publish_date;
    this.publishers = data.publishers;
    this.series = data.series;
    this.covers = data.covers;
    this.coverUrl = data.covers?.length
      ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
      : undefined;
    this.numberOfPages = data.number_of_pages;
    this.isbn10 = data.isbn_10 ?? [];
    this.isbn13 = data.isbn_13 ?? [];
    this.identifiers = {
      goodreads: data.identifiers?.goodreads,
      librarything: data.identifiers?.librarything,
    };
    this.authors =
      data.authors?.flatMap((a) => {
        const id = a.key?.split('/').pop();
        return id ? [id] : [];
      }) ?? [];
    this.workId = data.works?.[0]?.key?.split('/').pop();
    this.description = this.extractDescription(data.description);
  }

  private extractDescription(input: any): string | undefined {
    if (!input) return undefined;
    if (typeof input === 'string') return input;
    //eslint-disable-next-line
    if (typeof input === 'object' && input.value) return input.value;
    return undefined;
  }
}

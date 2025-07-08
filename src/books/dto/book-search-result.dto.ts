import { OpenLibrarySearchInterface } from '../interfaces/open-library-search.interface';

export class BookSearchResultDto {
  title: string;
  authorNames: string[];
  coverId?: number;
  firstPublishYear?: number;
  editionCount: number;
  language: string[];
  openLibraryKey: string;

  constructor(data: OpenLibrarySearchInterface['docs'][number]) {
    this.title = data.title;
    this.authorNames = data.author_name;
    this.coverId = data.cover_i;
    this.firstPublishYear = data.first_publish_year;
    this.editionCount = data.edition_count;
    this.language = data.language;
    this.openLibraryKey = data.key;
  }
}

export interface OpenLibraryEditionInterface {
  title: string;
  key: string;
  isbn_10?: string[];
  isbn_13?: string[];
  publish_date?: string;
  covers?: number[];
  [key: string]: any;
}

export interface OpenLibraryIsbnInterface {
  description?: {
    value: string;
    type: string;
  };
  identifiers: {
    librarything: string[];
    goodreads: string[];
  };
  title: string;
  subtitle?: string;
  authors: {
    key: string;
  }[];
  publish_date: string;
  publishers: string[];
  series: string[];
  covers: number[];
  physical_format: string;
  lc_classifications: string[];
  ocaid: string;
  contributions: string[];
  isbn_10: string[];
  isbn_13: string[];
  source_records: string[];
  languages: {
    key: string;
  }[];
  oclc_numbers: string[];
  type: {
    key: string;
  };
  local_id: string[];
  key: string;
  number_of_pages: number;
  works: {
    key: string;
  }[];
  latest_revision: number;
  revision: number;
  created: {
    type: string;
    value: string;
  };
  last_modified: {
    type: string;
    value: string;
  };
}

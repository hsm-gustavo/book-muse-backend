import { ApiProperty } from '@nestjs/swagger';

export class BookSearchResultSwagger {
  @ApiProperty()
  title: string;

  @ApiProperty({ type: [String] })
  authorNames: string[];

  @ApiProperty({ required: false })
  coverId?: number;

  @ApiProperty({ required: false })
  firstPublishYear?: number;

  @ApiProperty()
  editionCount: number;

  @ApiProperty({ type: [String] })
  language: string[];

  @ApiProperty()
  openLibraryKey: string;

  @ApiProperty({ required: false })
  editionKey?: string;

  @ApiProperty({ type: [String], required: false })
  isbn10?: string[];

  @ApiProperty({ type: [String], required: false })
  isbn13?: string[];
}

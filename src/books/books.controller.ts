import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { ExecutionTimeInterceptor } from '../common/interceptors/exec-time.interceptor';
import { ApiExtraModels, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { BookSearchResponseSwagger } from './swagger/book-search-response.swagger';

@Controller('books')
@UseInterceptors(ExecutionTimeInterceptor)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('isbn/:isbn')
  async getBookByisbn(@Param('isbn') isbn: string) {
    return this.booksService.getBookByIsbn(isbn);
  }

  @Get('olid/:olid')
  async getBookByOlid(@Param('olid') isbn: string) {
    return this.booksService.getBookByOlid(isbn);
  }

  @ApiExtraModels(BookSearchResponseSwagger, BookSearchResponseSwagger)
  @Get('search')
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Book title or author name',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Search results from Open Library',
    type: BookSearchResponseSwagger,
  })
  async searchBooks(
    @Query('q') query: string,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.booksService.searchBooks(query, page);
  }
}

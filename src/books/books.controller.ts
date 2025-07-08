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

@Controller('books')
@UseInterceptors(ExecutionTimeInterceptor)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('isbn/:isbn')
  async getBookByisbn(@Param('isbn') isbn: string) {
    return this.booksService.getBookByIsbn(isbn);
  }

  @Get('search')
  async searchBooks(
    @Query('q') query: string,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.booksService.searchBooks(query, page);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateReviewDto } from './dto/update-review.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReviewDto } from './dto/review.dto';
import { ReviewsQueryDto } from './dto/reviews-query.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async createReview(@Body() dto: CreateReviewDto, @CurrentUser() user: User) {
    return this.reviewsService.createReview(user.id, dto);
  }

  @Get('book/:openLibraryId')
  async listReviewsByBook(
    @Param('openLibraryId') bookId: string,
    @Query() query: ReviewsQueryDto,
  ) {
    return this.reviewsService.getReviewsByBook(bookId, query);
  }

  @Get('user/:userId')
  async listUserReviews(
    @Param('userId') userId: string,
    @Query() query: ReviewsQueryDto,
  ) {
    return this.reviewsService.getReviewsByUser(userId, query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeReview(@Param('id') reviewId: string, @CurrentUser() user: User) {
    return this.reviewsService.likeReview(user.id, reviewId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlikeReview(@Param('id') reviewId: string, @CurrentUser() user: User) {
    return this.reviewsService.unlikeReview(reviewId, user.id);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Optional JWT' })
  @ApiOkResponse({
    description:
      'Returns review details with or without data depending on the user',
    type: ReviewDto,
  })
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getReviewById(
    @Param('id') reviewId: string,
    @CurrentUser() user?: User,
  ) {
    return this.reviewsService.getReviewById(reviewId, user?.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateReview(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.updateReview(user.id, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteReview(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.deleteReview(user.id, id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateReviewDto } from './dto/update-review.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createReview(@Body() dto: CreateReviewDto, @CurrentUser() user: User) {
    return this.reviewsService.createReview(user.id, dto);
  }

  @Get('book/:openLibraryId')
  async listReviewsByBook(@Param('openLibraryId') bookId: string) {
    return this.reviewsService.getReviewsByBook(bookId);
  }

  @Get('user/:userId')
  async listUserReviews(@Param('userId') userId: string) {
    return this.reviewsService.getReviewsByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async likeReview(@Param('id') reviewId: string, @CurrentUser() user: User) {
    return this.reviewsService.likeReview(user.id, reviewId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/like')
  async unlikeReview(@Param('id') reviewId: string, @CurrentUser() user: User) {
    return this.reviewsService.unlikeReview(reviewId, user.id);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getReviewById(
    @Param('id') reviewId: string,
    @CurrentUser() user?: User,
  ) {
    return this.reviewsService.getReviewById(reviewId, user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateReview(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.updateReview(user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteReview(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.deleteReview(user.id, id);
  }
}

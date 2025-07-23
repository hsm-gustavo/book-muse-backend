import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewDto } from './dto/review.dto';
import { RawReviewDto } from './dto/book-review.dto';
import { ReviewsQueryDto } from './dto/reviews-query.dto';
import { PaginatedReviewsDto } from './dto/paginated-book-reviews.dto';
import { UpdateReviewResponseDto } from './dto/update-review-response.dto';
import { DeleteReviewResponseDto } from './dto/delete-review-response.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    return this.prisma.review.create({
      data: {
        title: dto.title,
        description: dto.description,
        rating: dto.rating,
        openLibraryId: dto.openLibraryId,
        userId,
      },
    });
  }

  async getReviewsByBook(
    openLibraryId: string,
    query: ReviewsQueryDto,
  ): Promise<PaginatedReviewsDto> {
    const { cursor, limit = 10 } = query;

    const take = limit + 1;

    const reviews = await this.prisma.review.findMany({
      where: { openLibraryId },
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, profilePicture: true },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : undefined,
    });

    let nextCursor: string | undefined = undefined;
    const hasNextPage = reviews.length > limit;

    if (hasNextPage) {
      const next = reviews.pop()!;
      nextCursor = next.id;
    }

    const data = reviews.map((review) => new RawReviewDto(review));

    return { data, nextCursor, hasNextPage };
  }

  async getReviewsByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { likes: true },
    });
  }

  async getReviewById(reviewId: string, userId?: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { user: true },
    });

    if (!review) throw new NotFoundException('Review not found');

    const likeCount = await this.prisma.reviewLike.count({
      where: { reviewId },
    });

    const likedByMe = userId
      ? !!(await this.prisma.reviewLike.findUnique({
          where: {
            userId_reviewId: { userId, reviewId },
          },
        }))
      : false;

    return new ReviewDto({ review, likeCount, likedByMe });
  }

  async likeReview(userId: string, reviewId: string) {
    await this.prisma.reviewLike.create({
      data: {
        reviewId,
        userId,
      },
    });
  }

  async unlikeReview(reviewId: string, userId: string) {
    await this.prisma.reviewLike.delete({
      where: {
        userId_reviewId: { userId, reviewId },
      },
    });
  }

  async updateReview(
    userId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ): Promise<UpdateReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own review.');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: dto,
    });
  }

  async deleteReview(
    userId: string,
    reviewId: string,
  ): Promise<DeleteReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own review.');
    }

    return this.prisma.review.delete({ where: { id: reviewId } });
  }
}

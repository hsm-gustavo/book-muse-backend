import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

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

  async getReviewsByBook(openLibraryId: string) {
    return this.prisma.review.findMany({
      where: { openLibraryId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, profilePicture: true },
        },
        likes: true,
      },
    });
  }

  async getReviewsByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { likes: true },
    });
  }

  async likeReview(userId: string, reviewId: string) {
    const exists = await this.prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: { userId, reviewId },
      },
    });

    if (exists) {
      await this.prisma.reviewLike.delete({
        where: { userId_reviewId: { userId, reviewId } },
      });
      return { liked: false };
    }

    // Like
    await this.prisma.reviewLike.create({
      data: {
        userId,
        reviewId,
      },
    });
    return { liked: true };
  }

  async updateReview(userId: string, reviewId: string, dto: UpdateReviewDto) {
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

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own review.');
    }

    return this.prisma.review.delete({ where: { id: reviewId } });
  }
}

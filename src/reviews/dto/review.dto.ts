import { Review, User } from 'generated/prisma';

export class ReviewDto {
  id: string;
  title: string;
  description: string;
  rating: number;
  openLibraryId: string;
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  likedByMe: boolean;

  author: {
    id: string;
    name: string;
    profilePicture?: string | null;
  } | null;

  constructor(input: {
    review: Review & { user: User | null };
    likeCount: number;
    likedByMe: boolean;
  }) {
    const { review, likeCount, likedByMe } = input;

    this.id = review.id;
    this.title = review.title;
    this.description = review.description;
    this.rating = review.rating;
    this.openLibraryId = review.openLibraryId;
    this.createdAt = review.createdAt;
    this.updatedAt = review.updatedAt;
    this.likeCount = likeCount;
    this.likedByMe = likedByMe;

    this.author = review.user
      ? {
          id: review.user.id,
          name: review.user.name,
          profilePicture: review.user.profilePicture,
        }
      : null;
  }
}

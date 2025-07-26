export class UpdateReviewResponseDto {
  description: string;
  title: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  rating: number;
  openLibraryId: string;
  userId: string | null;
}

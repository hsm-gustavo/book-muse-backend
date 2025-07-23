export class DeleteReviewResponseDto {
  description: string;
  title: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  rating: number;
  openLibraryId: string;
  userId: string | null;
}

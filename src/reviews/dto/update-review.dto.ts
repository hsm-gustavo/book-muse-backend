import { IsNumber, IsString, Max, Min } from 'class-validator';

export class UpdateReviewDto {
  @IsString()
  title?: string;

  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;
}

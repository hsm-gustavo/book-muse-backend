import { UserResponseDto } from './user-response.dto';

export class FollowersPaginationDto {
  data: UserResponseDto[];
  nextCursor?: {
    followerId: string;
    followedId: string;
  };
  hasNextPage: boolean;
}

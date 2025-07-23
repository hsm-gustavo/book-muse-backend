import { UserResponseDto } from './user-response.dto';

export class FollowingPaginationDto {
  data: UserResponseDto[];
  nextCursor?: {
    followerId: string;
    followedId: string;
  };
  hasNextPage: boolean;
}

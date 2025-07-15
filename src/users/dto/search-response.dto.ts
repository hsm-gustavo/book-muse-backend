import { UserSearchResultDto } from './user-search-result.dto';

export class SearchResponseDto {
  data: UserSearchResultDto[];
  hasNextPage: boolean;
  nextCursor?: string;
}

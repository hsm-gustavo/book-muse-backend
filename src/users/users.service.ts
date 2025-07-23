import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { R2Service } from 'src/storage/r2.service';
import { Prisma, User } from 'generated/prisma';
import { SearchUsersDto } from './dto/search-users.dto';
import { UserSearchResultDto } from './dto/user-search-result.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { SearchResponseDto } from './dto/search-response.dto';
import { FollowResponseDto } from './dto/follow-response.dto';
import { FollowCountsResponse } from './dto/follow-counts-response.dto';
import { FollowQueryDto } from './dto/follow-query.dto';
import { FollowingPaginationDto } from './dto/following-pagination.dto';
import { FollowersPaginationDto } from './dto/followers-pagination.dto';
import { FullUserProfileDto } from './dto/full-user-profile.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly r2Service: R2Service,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const passwordHash = await this.hashingService.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        profilePicture: dto.profilePicture ?? null,
      },
    });

    return new UserResponseDto(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => new UserResponseDto(user));
  }

  async findById(id: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const readCount = await this.prisma.userBookStatus.count({
      where: {
        userId: id,
        status: 'read',
      },
    });

    return new UserProfileDto(user, readCount);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        profilePicture: dto.profilePicture,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserResponseDto(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.profilePicture) {
      await this.r2Service.deleteFileByUrl(user.profilePicture);
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async uploadFile(file: Express.Multer.File, user: User) {
    const existingUser = await this.findById(user.id);

    if (existingUser.profilePicture) {
      await this.r2Service.deleteFileByUrl(existingUser.profilePicture);
    }

    const url = await this.r2Service.uploadFile(file.buffer, file.originalname);
    return this.update(user.id, { profilePicture: url });
  }

  async followUser(
    followerId: string,
    followedId: string,
  ): Promise<FollowResponseDto> {
    if (followerId === followedId) {
      throw new BadRequestException("You can't follow yourself");
    }

    return this.prisma.userFollow.create({
      data: { followerId, followedId },
    });
  }

  async unfollowUser(
    followerId: string,
    followedId: string,
  ): Promise<FollowResponseDto> {
    return this.prisma.userFollow.delete({
      where: { followerId_followedId: { followerId, followedId } },
    });
  }

  async getFollowing(
    userId: string,
    query: FollowQueryDto,
  ): Promise<FollowingPaginationDto> {
    const { cursor, limit = 10 } = query;

    const take = limit + 1;

    const follows = await this.prisma.userFollow.findMany({
      where: { followerId: userId },
      take,
      include: { followed: true },
      cursor: cursor ? { followerId_followedId: cursor } : undefined,
      skip: cursor ? 1 : undefined,
    });

    let nextCursor:
      | {
          followerId: string;
          followedId: string;
        }
      | undefined = undefined;
    const hasNextPage = follows.length > limit;

    if (hasNextPage) {
      const next = follows.pop()!;
      nextCursor = { followerId: next.followerId, followedId: next.followedId };
    }

    const data = follows.map((f) => f.followed);

    return { data, nextCursor, hasNextPage };
  }

  async getFollowers(
    userId: string,
    query: FollowQueryDto,
  ): Promise<FollowersPaginationDto> {
    const { cursor, limit = 10 } = query;

    const take = limit + 1;

    const followers = await this.prisma.userFollow.findMany({
      where: { followedId: userId },
      take,
      include: { follower: true },
      cursor: cursor ? { followerId_followedId: cursor } : undefined,
      skip: cursor ? 1 : undefined,
    });

    const nextCursor: { followerId: string; followedId: string } | undefined =
      undefined;
    const hasNextPage = followers.length > limit;

    const data = followers.map((f) => f.follower);

    return { data, nextCursor, hasNextPage };
  }

  async getFollowCounts(userId: string): Promise<FollowCountsResponse> {
    const [followers, following] = await Promise.all([
      this.prisma.userFollow.count({ where: { followedId: userId } }),
      this.prisma.userFollow.count({ where: { followerId: userId } }),
    ]);

    return { followers, following };
  }

  async searchUsers(query: SearchUsersDto): Promise<SearchResponseDto> {
    const { q, cursor, limit = 10 } = query;

    const where: Prisma.UserWhereInput | undefined = q
      ? {
          OR: [
            { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

    const take = limit + 1;

    const findArgs: Prisma.UserFindManyArgs = {
      where,
      take,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        createdAt: true,
      },
    };

    if (cursor) {
      findArgs.cursor = { id: cursor };
      findArgs.skip = 1;
    }

    const users = await this.prisma.user.findMany(findArgs);

    let nextCursor: string | undefined = undefined;
    const hasNextPage = users.length > limit;

    if (hasNextPage) {
      const next = users.pop()!;
      nextCursor = next.id;
    }

    const data = users.map((u) => new UserSearchResultDto(u));
    return { data, nextCursor, hasNextPage };
  }

  async getFullUserProfile(
    userId: string,
    viewerId?: string,
  ): Promise<FullUserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cacheKey = `user:profile:${userId}`;
    const cachedCounts = await this.cacheManager.get<{
      followersCount: number;
      followingCount: number;
      readBooksCount: number;
    }>(cacheKey);

    let followersCount: number;
    let followingCount: number;
    let readBooksCount: number;

    if (cachedCounts) {
      this.logger.debug(`Cache hit for profile counts of user ${userId}`);
      ({ followersCount, followingCount, readBooksCount } = cachedCounts);
    } else {
      this.logger.debug(`Cache miss for profile counts of user ${userId}`);
      [followersCount, followingCount, readBooksCount] = await Promise.all([
        this.prisma.userFollow.count({ where: { followedId: userId } }),
        this.prisma.userFollow.count({ where: { followerId: userId } }),
        this.prisma.userBookStatus.count({
          where: { userId, status: 'read' },
        }),
      ]);

      await this.cacheManager.set(
        cacheKey,
        { followersCount, followingCount, readBooksCount },
        30,
      );
    }

    let isFollowing: boolean | undefined = undefined;
    if (viewerId) {
      const viewerCacheKey = `user:${viewerId}:follows:${userId}`;
      const cachedFollow = await this.cacheManager.get<boolean>(viewerCacheKey);

      if (cachedFollow !== undefined) {
        this.logger.debug(
          `Cache hit for follow status: ${viewerId} → ${userId}`,
        );
        isFollowing = cachedFollow;
      } else {
        const follow = await this.prisma.userFollow.findUnique({
          where: {
            followerId_followedId: {
              followerId: viewerId,
              followedId: userId,
            },
          },
        });

        isFollowing = !!follow;
        await this.cacheManager.set(viewerCacheKey, isFollowing, 30);
      }
    }

    const recentReviews = await this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        rating: true,
        description: true,
        createdAt: true,
      },
    });

    return {
      ...user,
      followersCount,
      followingCount,
      readBooksCount,
      isFollowing,
      recentReviews,
    };
  }
}

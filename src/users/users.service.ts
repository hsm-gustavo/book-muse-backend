import {
  BadRequestException,
  Injectable,
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
import { GetSignedUrlDto } from './dto/get-signed-url.dto';
import { SearchResponseDto } from './dto/search-response.dto';
import { FollowResponseDto } from './dto/follow-response.dto';
import { FollowCountsResponse } from './dto/follow-counts-response.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly r2Service: R2Service,
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

  async getProfilePictureSignedUrl(userId: string): Promise<GetSignedUrlDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.profilePicture) return { url: null };

    const key = this.r2Service.getKeyFromUrl(user.profilePicture);
    const url = await this.r2Service.getSignedUrl(key);
    return {
      url,
    };
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

  async getFollowing(userId: string) {
    const follows = await this.prisma.userFollow.findMany({
      where: { followerId: userId },
      include: { followed: true },
    });

    return follows.map((f) => f.followed);
    // omit password hash
  }

  async getFollowers(userId: string) {
    const followers = await this.prisma.userFollow.findMany({
      where: { followedId: userId },
      include: { follower: true },
    });

    return followers.map((f) => f.follower);
    //omit password hash
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
}

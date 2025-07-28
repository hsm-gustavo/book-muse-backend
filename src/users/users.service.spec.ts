import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from './users.service';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { R2Service } from 'src/storage/r2.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateUserDto } from './dto/create-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, User } from 'generated/prisma';
import { FollowResponseDto } from './dto/follow-response.dto';
import { UserSearchResultDto } from './dto/user-search-result.dto';
import { prismaMock } from 'src/singleton';

/* const prismaMock = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  userBookStatus: {
    count: jest.fn(),
  },
  userFollow: {
    create: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
  },
  review: {
    findMany: jest.fn(),
  },
}; */

const hashingMock = {
  hash: jest.fn(),
};

const r2Mock = {
  deleteFileByUrl: jest.fn(),
  uploadFile: jest.fn(),
};
const cacheManagerMock = {
  get: jest.fn(),
  set: jest.fn(),
};

const dateNow = new Date();

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: HashingService,
          useValue: hashingMock,
        },
        {
          provide: R2Service,
          useValue: r2Mock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    service = module.get(UsersService);

    prismaMock.user.create.mockClear();
    prismaMock.user.findUnique.mockClear();
    prismaMock.user.findMany.mockClear();
    prismaMock.user.update.mockClear();
    prismaMock.user.delete.mockClear();
    prismaMock.userBookStatus.count.mockClear();
    prismaMock.userFollow.create.mockClear();
    prismaMock.userFollow.delete.mockClear();
    prismaMock.userFollow.findMany.mockClear();
    prismaMock.userFollow.count.mockClear();
    hashingMock.hash.mockClear();
    r2Mock.deleteFileByUrl.mockClear();
    r2Mock.uploadFile.mockClear();
    cacheManagerMock.get.mockClear();
    cacheManagerMock.set.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      // Arrange
      // CreateUserDto
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
      };
      const mockUser = {
        id: 'user-id-123',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        profilePicture: null,
        createdAt: dateNow,
        updatedAt: dateNow,
        role: Role.USER,
      };
      const returnedUser = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        profilePicture: mockUser.profilePicture,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      jest.spyOn(hashingMock, 'hash').mockResolvedValue('hashed-password');
      jest.spyOn(prismaMock.user, 'create').mockResolvedValue(mockUser);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(hashingMock.hash).toHaveBeenCalledWith(dto.password);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash: 'hashed-password',
          profilePicture: dto.profilePicture ?? null,
        },
      });
      expect(result).toBeDefined();
      expect(result).toEqual(returnedUser);
    }); /* 
    it('should throw ConflictException if email already exists', async () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
      };

      jest.spyOn(prisma.user, 'create').mockRejectedValue({
        statusCode: 409,
        message: '[P2002]: Unique constraint failed on the fields: (`email`)',
      });

      await expect(await service.create(dto)).rejects.toThrow(something);
    }); */
  });
  describe('findById', () => {
    it('should return a user if user exists', async () => {
      const userId = 'user-id-123';
      const mockFindUnique = {
        id: 'user-id-123',
        name: 'John Doe',
        email: 'john@example.com',
        profilePicture: null,
        createdAt: dateNow,
        updatedAt: dateNow,
        passwordHash: 'hashed-password',
        role: Role.USER,
      };
      const returnedUser: UserProfileDto = {
        id: userId,
        name: mockFindUnique.name,
        email: mockFindUnique.email,
        profilePicture: mockFindUnique.profilePicture,
        createdAt: mockFindUnique.createdAt,
        readCount: 1,
      };
      jest
        .spyOn(prismaMock.user, 'findUnique')
        .mockResolvedValue(mockFindUnique);
      jest.spyOn(prismaMock.userBookStatus, 'count').mockResolvedValue(1);

      const result = await service.findById(userId);

      expect(result).toBeDefined();
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
          createdAt: true,
        },
      });
      expect(prismaMock.userBookStatus.count).toHaveBeenCalledWith({
        where: {
          userId: userId,
          status: 'read',
        },
      });

      expect(result).toBeInstanceOf(UserProfileDto);
      expect(result).toEqual(returnedUser);
    });
    it('should throw an error if user doesnt exist', async () => {
      const userId = 'user-id-123';

      jest.spyOn(prismaMock.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findById(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockFindAll = [
        {
          id: 'user-id-123',
          name: 'John Doe',
          email: 'john@example.com',
          passwordHash: 'hashed-password',
          profilePicture: null,
          createdAt: dateNow,
          updatedAt: dateNow,
          role: Role.USER,
        },
        {
          id: 'user-id-456',
          name: 'Jane Doe',
          email: 'jane@example.com',
          passwordHash: 'hashed-password',
          profilePicture: null,
          createdAt: dateNow,
          updatedAt: dateNow,
          role: Role.USER,
        },
      ];
      const returnedAll = [
        {
          id: 'user-id-123',
          name: 'John Doe',
          email: 'john@example.com',
          profilePicture: null,
          createdAt: dateNow,
          updatedAt: dateNow,
        },
        {
          id: 'user-id-456',
          name: 'Jane Doe',
          email: 'jane@example.com',
          profilePicture: null,
          createdAt: dateNow,
          updatedAt: dateNow,
        },
      ];
      jest.spyOn(prismaMock.user, 'findMany').mockResolvedValue(mockFindAll);

      const result = await service.findAll();

      expect(prismaMock.user.findMany).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result).toEqual(returnedAll);
    });
  });
  describe('update', () => {
    it('should update the user name', async () => {
      const userId = 'user-id-123';
      const dto: UpdateUserDto = {
        name: 'John Wick',
      };
      const updatedUser = {
        id: 'user-id-123',
        name: dto.name!,
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        profilePicture: null,
        createdAt: dateNow,
        updatedAt: dateNow,
        role: Role.USER,
      };
      const response: UserResponseDto = {
        id: updatedUser.id,
        name: updatedUser.name!,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
      jest.spyOn(prismaMock.user, 'update').mockResolvedValue(updatedUser);

      const result = await service.update(userId, dto);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          name: dto.name,
          profilePicture: dto.profilePicture,
        },
      });
      expect(result).toBeDefined();
      expect(result).toEqual(response);
    });
    it('should update the user profile picture', async () => {
      const userId = 'user-id-123';
      const dto: UpdateUserDto = {
        profilePicture: 'profile.url.com',
      };
      const updatedUser = {
        id: 'user-id-123',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        profilePicture: dto.profilePicture!,
        createdAt: dateNow,
        updatedAt: dateNow,
        role: Role.USER,
      };
      const response: UserResponseDto = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture!,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
      jest.spyOn(prismaMock.user, 'update').mockResolvedValue(updatedUser);

      const result = await service.update(userId, dto);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          name: dto.name,
          profilePicture: dto.profilePicture,
        },
      });
      expect(result).toBeDefined();
      expect(result).toEqual(response);
    });
    it('should throw an error if user doesnt exist', async () => {
      const userId = 'user-id-123';
      const dto: UpdateUserDto = {};

      jest.spyOn(prismaMock.user, 'update').mockResolvedValue(null as any);

      await expect(service.update(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  describe('delete', () => {
    it('should delete the user', async () => {
      const id = 'user-id-123';
      const uniqueUser = {
        id: 'user-id-123',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        profilePicture: 'image.url.com',
        createdAt: dateNow,
        updatedAt: dateNow,
        role: Role.USER,
      };
      jest.spyOn(prismaMock.user, 'findUnique').mockResolvedValue(uniqueUser);

      await service.delete(id);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(r2Mock.deleteFileByUrl).toHaveBeenCalledWith(
        uniqueUser.profilePicture,
      );
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
    it('should delete the user without picture', async () => {
      const id = 'user-id-123';
      const uniqueUser = {
        id: 'user-id-123',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        profilePicture: null,
        createdAt: dateNow,
        updatedAt: dateNow,
        role: Role.USER,
      };
      jest.spyOn(prismaMock.user, 'findUnique').mockResolvedValue(uniqueUser);

      await service.delete(id);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(r2Mock.deleteFileByUrl).toHaveBeenCalledTimes(0);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
    it('should throw an error', async () => {
      const id = 'user-id-123';
      jest.spyOn(prismaMock.user, 'findUnique').mockResolvedValue(null);

      await expect(service.delete(id)).rejects.toThrow(NotFoundException);
    });
  });
  describe('uploadFile', () => {
    it('should delete the old picture from r2, upload the file to r2 and updated the user', async () => {
      const id = 'user-id-123';
      const mockUser: User = {
        id: id,
        name: 'John Doe',
        email: 'john@example.com',
        profilePicture: 'image.url.com',
        createdAt: dateNow,
        updatedAt: dateNow,
        passwordHash: 'hashed-password',
        role: 'USER',
      };
      const uniqueUser: UserProfileDto = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        profilePicture: mockUser.profilePicture,
        createdAt: mockUser.createdAt,
        readCount: 1,
      };
      const mockFile = {
        originalname: 'WhatsApp Image 2025-07-09 at 16.10.21.jpeg',
        buffer: Buffer.alloc(105755), // allocate a buffer of same size (content not required)
      } as Express.Multer.File;
      const mockUrl = 'picture.url.com';
      const returnedUser: UserResponseDto = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        profilePicture: mockUrl,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      jest.spyOn(service, 'findById').mockResolvedValue(uniqueUser);
      jest.spyOn(r2Mock, 'uploadFile').mockResolvedValue(mockUrl);
      jest.spyOn(service, 'update').mockResolvedValue(returnedUser);

      const result = await service.uploadFile(mockFile, mockUser);

      //eslint-disable-next-line
      expect(service.findById).toHaveBeenCalledWith(id);
      expect(r2Mock.deleteFileByUrl).toHaveBeenCalledWith(
        uniqueUser.profilePicture,
      );
      expect(r2Mock.uploadFile).toHaveBeenCalledWith(
        mockFile.buffer,
        mockFile.originalname,
      );
      expect(result).toBeDefined();
      expect(result).toEqual(returnedUser);
    });
    it('should upload the file to r2 and updated the user', async () => {
      const id = 'user-id-123';
      const mockUser: User = {
        id: id,
        name: 'John Doe',
        email: 'john@example.com',
        profilePicture: null,
        createdAt: dateNow,
        updatedAt: dateNow,
        passwordHash: 'hashed-password',
        role: 'USER',
      };
      const uniqueUser: UserProfileDto = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        profilePicture: mockUser.profilePicture,
        createdAt: mockUser.createdAt,
        readCount: 1,
      };
      const mockFile = {
        originalname: 'WhatsApp Image 2025-07-09 at 16.10.21.jpeg',
        buffer: Buffer.alloc(105755), // allocate a buffer of same size (content not required)
      } as Express.Multer.File;
      const mockUrl = 'picture.url.com';
      const returnedUser: UserResponseDto = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        profilePicture: mockUrl,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      jest.spyOn(service, 'findById').mockResolvedValue(uniqueUser);
      jest.spyOn(r2Mock, 'uploadFile').mockResolvedValue(mockUrl);
      jest.spyOn(service, 'update').mockResolvedValue(returnedUser);

      const result = await service.uploadFile(mockFile, mockUser);

      //eslint-disable-next-line
      expect(service.findById).toHaveBeenCalledWith(id);
      expect(r2Mock.deleteFileByUrl).toHaveBeenCalledTimes(0);
      expect(r2Mock.uploadFile).toHaveBeenCalledWith(
        mockFile.buffer,
        mockFile.originalname,
      );
      expect(result).toBeDefined();
      expect(result).toEqual(returnedUser);
    });
  });
  describe('followUser', () => {
    it('should follow the user', async () => {
      const followerId = 'user-id-123';
      const followedId = 'user-id-456';
      const returnedFollow: FollowResponseDto = {
        followerId,
        followedId,
        createdAt: dateNow,
      };
      jest
        .spyOn(prismaMock.userFollow, 'create')
        .mockResolvedValue(returnedFollow);

      const result = await service.followUser(followerId, followedId);

      expect(prismaMock.userFollow.create).toHaveBeenCalledWith({
        data: { followerId, followedId },
      });
      expect(result).toBeDefined();
      expect(result).toEqual(returnedFollow);
    });
    it('should throw an error', async () => {
      const id = 'user-id-123';

      await expect(service.followUser(id, id)).rejects.toThrow(
        BadRequestException,
      );

      expect(prismaMock.userFollow.create).toHaveBeenCalledTimes(0);
    });
  });
  describe('unfollowUser', () => {
    it('should unfollow the user', async () => {
      const followerId = 'user-id-123';
      const followedId = 'user-id-456';
      const returnedUnfollow: FollowResponseDto = {
        followerId,
        followedId,
        createdAt: dateNow,
      };
      jest
        .spyOn(prismaMock.userFollow, 'delete')
        .mockResolvedValue(returnedUnfollow);

      const result = await service.unfollowUser(followerId, followedId);

      expect(prismaMock.userFollow.delete).toHaveBeenCalledWith({
        where: { followerId_followedId: { followerId, followedId } },
      });
      expect(result).toBeDefined();
      expect(result).toEqual(returnedUnfollow);
    });
  });
  describe('getFollowing', () => {
    const userId = 'user-id-123';

    const baseFollow = {
      followerId: userId,
      followedId: 'user-X',
      createdAt: dateNow,
      followed: {
        id: 'user-X',
        name: 'User X',
        email: 'userx@example.com',
        passwordHash: 'hashed-password',
        role: Role.USER,
        profilePicture: null,
        createdAt: dateNow,
        updatedAt: dateNow,
      },
    };

    it('should return paginated result with nextCursor if more data exists', async () => {
      const mockFollows = Array.from({ length: 11 }, (_, i) => ({
        ...baseFollow,
        followedId: `user-${i}`,
        followed: {
          ...baseFollow.followed,
          id: `user-${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`,
        },
      }));

      jest
        .spyOn(prismaMock.userFollow, 'findMany')
        .mockResolvedValue([...mockFollows]);

      const query = { limit: 10 };
      const result = await service.getFollowing(userId, query);

      expect(prismaMock.userFollow.findMany).toHaveBeenCalledWith({
        where: { followerId: userId },
        take: 11,
        include: { followed: true },
        cursor: undefined,
        skip: undefined,
      });
      expect(result.hasNextPage).toBe(true);
      expect(result.data.length).toBe(10);
      expect(result.nextCursor).toEqual({
        followerId: userId,
        followedId: 'user-10',
      });
    });
    it('should return paginated result without nextCursor if all data fits in one page', async () => {
      const mockFollows = Array.from({ length: 5 }, (_, i) => ({
        ...baseFollow,
        followedId: `user-${i}`,
        followed: {
          ...baseFollow.followed,
          id: `user-${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`,
        },
      }));

      jest
        .spyOn(prismaMock.userFollow, 'findMany')
        .mockResolvedValue([...mockFollows]);

      const query = { limit: 10 };
      const result = await service.getFollowing(userId, query);

      expect(result.hasNextPage).toBe(false);
      expect(result.nextCursor).toBeUndefined();
      expect(result.data.length).toBe(5);
    });
    it('should pass cursor and skip to prisma query when cursor is provided', async () => {
      const mockFollows = Array.from({ length: 2 }, (_, i) => ({
        ...baseFollow,
        followedId: `user-${i}`,
        followed: {
          ...baseFollow.followed,
          id: `user-${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`,
        },
      }));

      const cursor = {
        followerId: userId,
        followedId: 'user-1',
      };

      jest
        .spyOn(prismaMock.userFollow, 'findMany')
        .mockResolvedValue(mockFollows);

      const result = await service.getFollowing(userId, {
        limit: 1,
        cursor,
      });

      expect(prismaMock.userFollow.findMany).toHaveBeenCalledWith({
        where: { followerId: userId },
        take: 2,
        include: { followed: true },
        cursor: {
          followerId_followedId: cursor,
        },
        skip: 1,
      });

      expect(result.data.length).toBe(1);
      expect(result.hasNextPage).toBe(true);
    });
  });
  describe('getFollowers', () => {
    const userId = 'user-id-123';

    const baseFollow = {
      followerId: userId,
      followedId: 'user-X',
      createdAt: dateNow,
      follower: {
        id: 'user-X',
        name: 'User X',
        email: 'userx@example.com',
        passwordHash: 'hashed-password',
        role: Role.USER,
        profilePicture: null,
        createdAt: dateNow,
        updatedAt: dateNow,
      },
    };

    it('should return paginated result with nextCursor if more data exists', async () => {
      const mockFollows = Array.from({ length: 11 }, (_, i) => ({
        ...baseFollow,
        followedId: `user-${i}`,
        followed: {
          ...baseFollow.follower,
          id: `user-${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`,
        },
      }));

      jest
        .spyOn(prismaMock.userFollow, 'findMany')
        .mockResolvedValue([...mockFollows]);

      const query = { limit: 10 };
      const result = await service.getFollowers(userId, query);

      expect(prismaMock.userFollow.findMany).toHaveBeenCalledWith({
        where: { followedId: userId },
        take: 11,
        include: { follower: true },
        cursor: undefined,
        skip: undefined,
      });
      expect(result.hasNextPage).toBe(true);
      expect(result.data.length).toBe(10);
      expect(result.nextCursor).toEqual({
        followerId: userId,
        followedId: 'user-10',
      });
    });
    it('should return paginated result without nextCursor if all data fits in one page', async () => {
      const mockFollows = Array.from({ length: 5 }, (_, i) => ({
        ...baseFollow,
        followedId: `user-${i}`,
        followed: {
          ...baseFollow.follower,
          id: `user-${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`,
        },
      }));

      jest
        .spyOn(prismaMock.userFollow, 'findMany')
        .mockResolvedValue([...mockFollows]);

      const query = { limit: 10 };
      const result = await service.getFollowers(userId, query);

      expect(result.hasNextPage).toBe(false);
      expect(result.nextCursor).toBeUndefined();
      expect(result.data.length).toBe(5);
    });
    it('should pass cursor and skip to prisma query when cursor is provided', async () => {
      const mockFollows = Array.from({ length: 2 }, (_, i) => ({
        ...baseFollow,
        followedId: `user-${i}`,
        followed: {
          ...baseFollow.follower,
          id: `user-${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`,
        },
      }));

      const cursor = {
        followerId: userId,
        followedId: 'user-1',
      };

      jest
        .spyOn(prismaMock.userFollow, 'findMany')
        .mockResolvedValue(mockFollows);

      const result = await service.getFollowers(userId, {
        limit: 1,
        cursor,
      });

      expect(prismaMock.userFollow.findMany).toHaveBeenCalledWith({
        where: { followedId: userId },
        take: 2,
        include: { follower: true },
        cursor: {
          followerId_followedId: cursor,
        },
        skip: 1,
      });

      expect(result.data.length).toBe(1);
      expect(result.hasNextPage).toBe(true);
    });
  });
  describe('getFollowCounts', () => {
    it('should return the followers and following counts', async () => {
      const userId = 'user-id-123';
      const mockFollowers = 5;
      const mockFollowing = 10;

      jest
        .spyOn(prismaMock.userFollow, 'count')
        .mockResolvedValueOnce(mockFollowers)
        .mockResolvedValueOnce(mockFollowing);

      const result = await service.getFollowCounts(userId);

      expect(prismaMock.userFollow.count).toHaveBeenCalledTimes(2);
      expect(prismaMock.userFollow.count).toHaveBeenNthCalledWith(1, {
        where: { followedId: userId },
      });
      expect(prismaMock.userFollow.count).toHaveBeenNthCalledWith(2, {
        where: { followerId: userId },
      });
      expect(result).toEqual({
        followers: mockFollowers,
        following: mockFollowing,
      });
    });
  });
  describe('searchUsers', () => {
    it('should return users matching the query and no pagination needed', async () => {
      const query = { q: 'john', limit: 2 };
      const take = query.limit + 1;
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          passwordHash: 'hashed-password',
          profilePicture: null,
          createdAt: dateNow,
          updatedAt: dateNow,
          role: Role.USER,
        },
        {
          id: '2',
          name: 'Johnny Blaze',
          email: 'blaze@example.com',
          passwordHash: 'hashed-password',
          profilePicture: 'url.com/pic.jpg',
          createdAt: dateNow,
          updatedAt: dateNow,
          role: Role.USER,
        },
      ];

      jest.spyOn(prismaMock.user, 'findMany').mockResolvedValue([...mockUsers]);

      const result = await service.searchUsers(query);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' } },
            { email: { contains: query.q, mode: 'insensitive' } },
          ],
        },
        take: take,
        orderBy: { id: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
          createdAt: true,
        },
      });
      expect(result).toEqual({
        data: mockUsers.map((u) => new UserSearchResultDto(u)),
        nextCursor: undefined,
        hasNextPage: false,
      });
    });
    it('should return nextCursor and hasNextPage when results exceed limit', async () => {
      const query = { q: '', limit: 2 };
      const mockUsers = [
        {
          id: '1',
          name: 'A',
          email: 'a@a.com',
          passwordHash: 'hashed-password',
          profilePicture: null,
          createdAt: dateNow,
          updatedAt: dateNow,
          role: Role.USER,
        },
        {
          id: '2',
          name: 'B',
          email: 'b@b.com',
          passwordHash: 'hashed-password',
          profilePicture: null,
          createdAt: dateNow,
          updatedAt: dateNow,
          role: Role.USER,
        },
        {
          id: '3',
          name: 'C',
          email: 'c@c.com',
          passwordHash: 'hashed-password',
          profilePicture: null,
          createdAt: dateNow,
          updatedAt: dateNow,
          role: Role.USER,
        }, // next page
      ];

      prismaMock.user.findMany.mockResolvedValue([...mockUsers]);

      const result = await service.searchUsers(query);

      expect(result.data).toHaveLength(2);
      expect(result.hasNextPage).toBe(true);
      expect(result.nextCursor).toBe('3');
    });
    it('should call findMany with cursor and skip for pagination', async () => {
      const query = { q: 'Jane', limit: 2, cursor: '123' };
      const mockUsers = [
        {
          id: '124',
          name: 'Jane Smith',
          email: 'jane@example.com',
          passwordHash: 'hashed-password',
          profilePicture: null,
          createdAt: dateNow,
          updatedAt: dateNow,
          role: Role.USER,
        },
      ];

      prismaMock.user.findMany.mockResolvedValue([...mockUsers]);

      const result = await service.searchUsers(query);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { id: query.cursor },
          skip: 1,
        }),
      );

      expect(result).toEqual({
        data: mockUsers.map((u) => new UserSearchResultDto(u)),
        nextCursor: undefined,
        hasNextPage: false,
      });
    });
  });
  describe('getFullUserProfile', () => {
    it('should return full profile and set cache if cache is missing and no viewerId', async () => {
      const userId = 'user-id-123';
      const mockUser = {
        id: userId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        passwordHash: 'hashed-password',
        profilePicture: null,
        createdAt: dateNow,
        updatedAt: dateNow,
        role: Role.USER,
      };
      const mockCounts = {
        followersCount: 3,
        followingCount: 2,
        readBooksCount: 5,
      };
      const mockReviews = [
        {
          id: 'r1',
          userId,
          title: 'Great book',
          rating: 5,
          description: 'Loved it',
          createdAt: dateNow,
          updatedAt: dateNow,
          openLibraryId: 'OL123W',
        },
      ];

      jest.spyOn(prismaMock.user, 'findUnique').mockResolvedValue(mockUser);
      jest
        .spyOn(prismaMock.userFollow, 'count')
        .mockResolvedValueOnce(mockCounts.followersCount)
        .mockResolvedValueOnce(mockCounts.followingCount);
      jest
        .spyOn(prismaMock.userBookStatus, 'count')
        .mockResolvedValue(mockCounts.readBooksCount);
      jest.spyOn(prismaMock.review, 'findMany').mockResolvedValue(mockReviews);
      jest.spyOn(cacheManagerMock, 'get').mockResolvedValue(undefined);
      jest.spyOn(cacheManagerMock, 'set').mockResolvedValue(undefined);

      const result = await service.getFullUserProfile(userId);

      expect(result).toMatchObject({
        ...mockUser,
        ...mockCounts,
        isFollowing: undefined,
        recentReviews: mockReviews,
      });

      expect(prismaMock.user.findUnique).toHaveBeenCalled();
      expect(prismaMock.review.findMany).toHaveBeenCalled();
      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        `user:profile:${userId}`,
        mockCounts,
        30 * 1000,
      );
    });
    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(prismaMock.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getFullUserProfile('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should use cached counts if available', async () => {
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        profilePicture: null,
        createdAt: dateNow,
        updatedAt: dateNow,
        role: Role.USER,
      };

      const mockCachedCounts = {
        followersCount: 10,
        followingCount: 5,
        readBooksCount: 8,
      };

      jest.spyOn(prismaMock.user, 'findUnique').mockResolvedValue(mockUser);
      jest
        .spyOn(cacheManagerMock, 'get')
        .mockResolvedValueOnce(mockCachedCounts);
      jest.spyOn(prismaMock.review, 'findMany').mockResolvedValue([]);

      const result = await service.getFullUserProfile(userId);

      expect(cacheManagerMock.get).toHaveBeenCalledWith(
        `user:profile:${userId}`,
      );
      expect(result).toMatchObject({
        ...mockUser,
        ...mockCachedCounts,
        isFollowing: undefined,
        recentReviews: [],
      });
    });
    it('should get isFollowing from follow cache', async () => {
      const userId = 'user-1';
      const viewerId = 'viewer-1';

      const mockUser = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        profilePicture: null,
        createdAt: dateNow,
        updatedAt: dateNow,
        role: Role.USER,
      };

      const mockCachedCounts = {
        followersCount: 2,
        followingCount: 4,
        readBooksCount: 7,
      };

      jest
        .spyOn(cacheManagerMock, 'get')
        .mockResolvedValueOnce(mockCachedCounts)
        .mockResolvedValueOnce(true);
      jest.spyOn(prismaMock.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaMock.review, 'findMany').mockResolvedValue([]);

      const result = await service.getFullUserProfile(userId, viewerId);

      expect(result.isFollowing).toBe(true);
    });
    it('should fallback to Prisma if isFollowing is not cached', async () => {
      const userId = 'user-1';
      const viewerId = 'viewer-1';

      const mockUser = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        profilePicture: null,
        createdAt: dateNow,
        updatedAt: dateNow,
        role: Role.USER,
      };

      const mockCachedCounts = {
        followersCount: 1,
        followingCount: 1,
        readBooksCount: 2,
      };

      jest.spyOn(prismaMock.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaMock.userFollow, 'findUnique').mockResolvedValue({
        followerId: viewerId,
        followedId: userId,
        createdAt: dateNow,
      });
      jest
        .spyOn(cacheManagerMock, 'get')
        .mockResolvedValueOnce(mockCachedCounts)
        .mockResolvedValueOnce(undefined);
      jest.spyOn(cacheManagerMock, 'set').mockResolvedValue(undefined);
      jest.spyOn(prismaMock.review, 'findMany').mockResolvedValue([]);

      const result = await service.getFullUserProfile(userId, viewerId);

      expect(result.isFollowing).toBe(true);
      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        `user:${viewerId}:follows:${userId}`,
        true,
        30 * 1000,
      );
    });
  });
});

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'generated/prisma';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageUploadInterceptor } from './interceptors/image-upload.interceptor';
import { SearchUsersDto } from './dto/search-users.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FollowQueryDto } from './dto/follow-query.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { FullUserProfileDto } from './dto/full-user-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  async getMe(@CurrentUser() user: User) {
    return this.usersService.getFullUserProfile(user.id, user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for users' })
  async searchUsers(@Query() query: SearchUsersDto) {
    return this.usersService.searchUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOperation({ summary: 'Update authenticated user profile' })
  async updateUser(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me/profile-picture')
  @UseInterceptors(FileInterceptor('file'), ImageUploadInterceptor)
  @ApiOperation({ summary: 'Update profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async updateProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.usersService.uploadFile(file, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete authenticated user' })
  async deleteUser(@CurrentUser() user: User) {
    return this.usersService.delete(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':userId/follow')
  @ApiOperation({ summary: 'Follow another user' })
  @ApiParam({ name: 'userId', type: 'string' })
  follow(@Param('userId') userId: string, @CurrentUser() user: User) {
    return this.usersService.followUser(user.id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':userId/unfollow')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiParam({ name: 'userId', type: 'string' })
  unfollow(@Param('userId') userId: string, @CurrentUser() user: User) {
    return this.usersService.unfollowUser(user.id, userId);
  }

  @Get(':userId/following')
  @ApiOperation({ summary: 'List users a given user is following' })
  @ApiParam({ name: 'userId', type: 'string' })
  getFollowing(
    @Param('userId') userId: string,
    @Query() query: FollowQueryDto,
  ) {
    return this.usersService.getFollowing(userId, query);
  }

  @Get(':userId/followers')
  @ApiOperation({ summary: 'List followers of a given user' })
  @ApiParam({ name: 'userId', type: 'string' })
  getFollowers(
    @Param('userId') userId: string,
    @Query() query: FollowQueryDto,
  ) {
    return this.usersService.getFollowers(userId, query);
  }

  @Get(':userId/follow-counts')
  @ApiOperation({ summary: 'Get follow/following counts for a user' })
  @ApiParam({ name: 'userId', type: 'string' })
  async getFollowCounts(@Param('userId') userId: string) {
    return this.usersService.getFollowCounts(userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':userId/full-profile')
  @ApiParam({
    name: 'userId',
    description: 'ID of the user whose profile you want to fetch',
  })
  @ApiOkResponse({
    description:
      'Returns the full user profile including counts and optional isFollowing/recentReviews.',
    type: FullUserProfileDto,
  })
  @ApiUnauthorizedResponse({ description: 'JWT is invalid (if provided)' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getFullUserProfile(
    @Param('userId') userId: string,
    @CurrentUser() viewer?: User,
  ) {
    return this.usersService.getFullUserProfile(userId, viewer?.id);
  }
}

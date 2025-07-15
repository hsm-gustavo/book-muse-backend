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
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Get('search')
  async searchUsers(@Query() query: SearchUsersDto) {
    return this.usersService.searchUsers(query);
  }

  @Get(':id')
  async getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateUser(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me/profile-picture')
  @UseInterceptors(FileInterceptor('file'), ImageUploadInterceptor)
  async updateProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.usersService.uploadFile(file, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/profile-picture')
  async getProfilePictureUrl(@CurrentUser() user: User) {
    return this.usersService.getProfilePictureSignedUrl(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@CurrentUser() user: User) {
    return this.usersService.delete(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':userId/follow')
  follow(@Param('userId') userId: string, @CurrentUser() user: User) {
    return this.usersService.followUser(user.id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':userId/unfollow')
  unfollow(@Param('userId') userId: string, @CurrentUser() user: User) {
    return this.usersService.unfollowUser(user.id, userId);
  }

  @Get(':userId/following')
  getFollowing(@Param('userId') userId: string) {
    return this.usersService.getFollowing(userId);
  }

  @Get(':userId/followers')
  getFollowers(@Param('userId') userId: string) {
    return this.usersService.getFollowers(userId);
  }

  @Get(':userId/follow-counts')
  async getFollowCounts(@Param('userId') userId: string) {
    return this.usersService.getFollowCounts(userId);
  }
}

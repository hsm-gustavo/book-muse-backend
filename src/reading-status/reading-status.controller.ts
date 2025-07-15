import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReadingStatusService } from './reading-status.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ReadingStatus, User } from 'generated/prisma';
import { UpdateReadingStatusDto } from './dto/update-reading-status.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@Controller('reading-status')
export class ReadingStatusController {
  constructor(private readonly readingStatusService: ReadingStatusService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async upsert(@CurrentUser() user: User, @Body() dto: UpdateReadingStatusDto) {
    return this.readingStatusService.upsertStatus(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':openLibraryId')
  async get(
    @CurrentUser() user: User,
    @Param('openLibraryId') openLibraryId: string,
  ) {
    return this.readingStatusService.getStatus(user.id, openLibraryId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':openLibraryId')
  async remove(
    @CurrentUser() user: User,
    @Param('openLibraryId') openLibraryId: string,
  ) {
    return this.readingStatusService.deleteStatus(user.id, openLibraryId);
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'status',
    enum: ReadingStatus,
    required: false,
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(
    @CurrentUser() user: User,
    @Query('status') status?: ReadingStatus,
  ) {
    return this.readingStatusService.listStatus(user.id, status);
  }
}

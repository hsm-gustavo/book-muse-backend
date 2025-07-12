import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateReadingStatusDto } from './dto/update-reading-status.dto';
import { ReadingStatus } from 'generated/prisma';

@Injectable()
export class ReadingStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertStatus(userId: string, dto: UpdateReadingStatusDto) {
    return this.prisma.userBookStatus.upsert({
      where: {
        userId_openLibraryId: {
          userId,
          openLibraryId: dto.openLibraryId,
        },
      },
      update: {
        status: dto.status,
      },
      create: {
        userId,
        openLibraryId: dto.openLibraryId,
        status: dto.status,
      },
    });
  }

  async getStatus(userId: string, openLibraryId: string) {
    const result = await this.prisma.userBookStatus.findUnique({
      where: {
        userId_openLibraryId: {
          userId,
          openLibraryId,
        },
      },
    });

    if (!result) throw new NotFoundException('Reading status not found');
    return result;
  }

  async deleteStatus(userId: string, openLibraryId: string) {
    await this.getStatus(userId, openLibraryId);
    return this.prisma.userBookStatus.delete({
      where: {
        userId_openLibraryId: {
          userId,
          openLibraryId,
        },
      },
    });
  }

  async listStatus(userId: string, status?: ReadingStatus) {
    return this.prisma.userBookStatus.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }
}

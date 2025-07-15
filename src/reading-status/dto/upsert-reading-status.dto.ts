import { ApiProperty } from '@nestjs/swagger';
import { ReadingStatus } from 'generated/prisma';

export class ReadingStatusResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ enum: ReadingStatus })
  status: ReadingStatus;

  @ApiProperty()
  openLibraryId: string;

  @ApiProperty()
  userId: string;
}

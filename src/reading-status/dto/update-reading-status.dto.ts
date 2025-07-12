import { IsEnum, IsString } from 'class-validator';
import { ReadingStatus } from 'generated/prisma';

export class UpdateReadingStatusDto {
  @IsString()
  openLibraryId: string;

  @IsEnum(ReadingStatus)
  status: ReadingStatus;
}

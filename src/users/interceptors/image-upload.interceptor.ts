import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ImageUploadInterceptor implements NestInterceptor {
  private readonly MAX_SIZE = 2 * 1024 * 1024; // 2MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const file: Express.Multer.File | undefined = request.file;

    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid image type. Only JPEG, PNG or WebP allowed',
      );
    }

    if (file.size > this.MAX_SIZE) {
      throw new BadRequestException('Image too large. Max size is 2MB');
    }

    return next.handle();
  }
}

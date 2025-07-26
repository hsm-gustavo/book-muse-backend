import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { EnvService } from 'src/env/env.service';
import { v4 as uuid } from 'uuid';
import { lookup } from 'mime-types';

@Injectable()
export class R2Service {
  private s3: S3Client;
  private bucket: string;

  constructor(private readonly envService: EnvService) {
    this.bucket = this.envService.get('R2_BUCKET');

    this.s3 = new S3Client({
      region: this.envService.get('R2_REGION'),
      endpoint: this.envService.get('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.envService.get('R2_ACCESS_KEY'),
        secretAccessKey: this.envService.get('R2_SECRET_KEY'),
      },
    });
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    folder = 'users',
  ): Promise<string> {
    const extension = extname(originalName);
    const filename = `${folder}/${uuid()}${extension}`;
    const mimeType = lookup(extension) || 'application/octet-stream';

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filename,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await this.s3.send(command);

    const url = `${this.envService.get('R2_PUBLIC_URL')}/${filename}`;

    return url;
  }

  async deleteFile(fileKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
    });

    await this.s3.send(command);
  }

  async deleteFileByUrl(url: string): Promise<void> {
    try {
      const key = this.getKeyFromUrl(url);

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3.send(command);
    } catch (error) {
      console.error('Failed to delete previous file:', error);
    }
  }

  getKeyFromUrl(url: string): string {
    const baseUrl = this.envService.get('R2_PUBLIC_URL');
    return url.replace(`${baseUrl}/`, '');
  }
}

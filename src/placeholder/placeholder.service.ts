import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as sharp from 'sharp';

@Injectable()
export class PlaceholderService {
  async generateImage(
    res: Response,
    width: number,
    height: number,
    format: string = 'png',
    text?: string,
  ) {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

    const buffer = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: '#e0e0e0',
      },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg width="${width}" height="${height}">
              <style>
                text {
                  fill: #888;
                  font-family: Arial, sans-serif;
                  font-size: ${Math.min(width, height) / 8}px;
                  dominant-baseline: middle;
                  text-anchor: middle;
                }
              </style>
              <text x="50%" y="50%">${text || `${width}x${height}`}</text>
            </svg>`,
          ),
          top: 0,
          left: 0,
        },
      ])
      .toFormat(format === 'jpeg' ? 'jpeg' : 'png')
      .toBuffer();

    res.set({ 'Content-Type': mimeType, 'Content-Length': buffer.length });
    res.send(buffer);
  }
}

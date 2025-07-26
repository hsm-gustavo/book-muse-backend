import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { PlaceholderService } from './placeholder.service';
import { Response } from 'express';
import { PlaceholderParamsDto } from './dto/placeholder-params.dto';
import { PlaceholderQueryDto } from './dto/placeholder-query.dtto';
import { ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('placeholder')
export class PlaceholderController {
  constructor(private readonly placeholderService: PlaceholderService) {}

  @Get(':width/:height')
  @ApiParam({ name: 'width', type: Number, example: 300 })
  @ApiParam({ name: 'height', type: Number, example: 200 })
  @ApiQuery({ name: 'text', type: String, required: false })
  @ApiQuery({ name: 'format', enum: ['png', 'jpeg'], required: false })
  @ApiResponse({ status: 200, description: 'Generated placeholder image' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async generatePlaceholder(
    @Param() params: PlaceholderParamsDto,
    @Query() query: PlaceholderQueryDto,
    @Res() res: Response,
  ) {
    const { width, height } = params;
    const { text, format } = query;
    return this.placeholderService.generateImage(
      res,
      width,
      height,
      format,
      text,
    );
  }
}

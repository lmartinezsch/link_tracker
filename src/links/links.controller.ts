import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ValidationPipe,
  UsePipes,
  Query,
  HttpException,
  Put,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { LinkRequestDto } from './dto/link.request.dto';
import { RedirectResponseDto } from './dto/redirect.response.dto';
import { Link } from './entities/link.entity';
import { StatisticsResponseDto } from './dto/stats.response.dto';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createLinkDto: CreateLinkDto) {
    return this.linksService.create(createLinkDto);
  }

  @Get('/redirect')
  async redirect(
    @Query() request: LinkRequestDto,
  ): Promise<RedirectResponseDto> {
    try {
      const redirect: Link = await this.linksService.redirect(request?.link);
      return {
        target: redirect.target,
      };
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  @Get('/:id/stats')
  async statistics(@Param('id') id: string): Promise<StatisticsResponseDto> {
    try {
      const redirect: Link = await this.linksService.statistics(+id);
      return {
        count: redirect.redirectsCount,
      };
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  @Put('/invalidate')
  invalidateLink(@Query() request: LinkRequestDto) {
    return this.linksService.invalidateLink(request.link);
  }
}

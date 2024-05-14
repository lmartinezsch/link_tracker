import { Test, TestingModule } from '@nestjs/testing';
import { LinksController } from '../../src/links/links.controller';
import { LinksService } from '../../src/links/links.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Link } from '../../src/links/entities/link.entity';
import { CreateLinkDto } from '../../src/links/dto/create-link.dto';
import { CreateLinkResponseDto } from '../../src/links/dto/create-link.response.dto';
import { HttpException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { LinkRequestDto } from '../../src/links/dto/link.request.dto';
import { RedirectResponseDto } from '../../src/links/dto/redirect.response.dto';
import { StatisticsResponseDto } from '../../src/links/dto/stats.response.dto';

describe('LinksController', () => {
  let controller: LinksController;
  let service: LinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinksController],
      providers: [
        LinksService,
        {
          provide: getRepositoryToken(Link),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<LinksController>(LinksController);
    service = module.get<LinksService>(LinksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new link', async () => {
      const createLinkDto: CreateLinkDto = {
        url: 'https://example.com',
        password: 'password',
      };
      const createLinkResponseDto: Link = {
        id: 1,
        target: 'https://example.com',
        link: 'https://maskedurl.com/abcd',
        isValid: true,
        redirectsCount: 0,
      };
      jest.spyOn(service, 'create').mockResolvedValue(createLinkResponseDto);

      const result = await controller.create(createLinkDto);
      expect(result).toEqual({
        target: createLinkResponseDto.target,
        link: createLinkResponseDto.link,
        valid: createLinkResponseDto.isValid,
      });
    });

    it('should throw HttpException if creation fails', async () => {
      const createLinkDto: CreateLinkDto = {
        url: 'https://example.com',
        password: 'password',
      };
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new Error('Creation failed'));

      await expect(controller.create(createLinkDto)).rejects.toThrow(
        HttpException,
      );
    });

    it('should transform the response using plainToClass', async () => {
      const createLinkDto: CreateLinkDto = {
        url: 'https://example.com',
        password: 'password',
      };
      const createLinkResponseDto: Link = {
        id: 1,
        target: 'https://example.com',
        link: 'https://maskedurl.com/abcd',
        isValid: true,
        redirectsCount: 0,
      };
      jest.spyOn(service, 'create').mockResolvedValue(createLinkResponseDto);

      const result = await controller.create(createLinkDto);
      expect(result).toBeInstanceOf(CreateLinkResponseDto);
      expect(result).toEqual(
        plainToClass(CreateLinkResponseDto, {
          target: createLinkResponseDto.target,
          link: createLinkResponseDto.link,
          valid: createLinkResponseDto.isValid,
        }),
      );
    });

    it('should use ValidationPipe to validate the input', async () => {
      const createLinkDto: CreateLinkDto = {
        url: 'invalid-url',
        password: 'password',
      };
      await expect(controller.create(createLinkDto)).rejects.toThrow();
    });
  });

  describe('redirect', () => {
    it('should redirect to the target link', async () => {
      const linkRequestDto: LinkRequestDto = {
        link: 'https://maskedurl.com/abcd',
        password: 'password',
      };
      const redirectResponseDto: RedirectResponseDto = {
        target: 'https://example.com',
      };
      jest.spyOn(service, 'redirect').mockResolvedValue({
        ...linkRequestDto,
        target: redirectResponseDto.target,
      } as Link);

      const result = await controller.redirect(linkRequestDto);
      expect(result).toEqual(redirectResponseDto);
    });

    it('should throw HttpException if redirect fails', async () => {
      const linkRequestDto: LinkRequestDto = {
        link: 'https://maskedurl.com/abcd',
        password: 'password',
      };
      jest
        .spyOn(service, 'redirect')
        .mockRejectedValue(new Error('Redirect failed'));

      await expect(controller.redirect(linkRequestDto)).rejects.toThrow(
        HttpException,
      );
    });

    it('should use ValidationPipe to validate the input', async () => {
      const linkRequestDto: LinkRequestDto = {
        link: 'invalid-url',
        password: 'password',
      };
      await expect(controller.redirect(linkRequestDto)).rejects.toThrow();
    });
  });

  describe('statistics', () => {
    it('should return the statistics for a link', async () => {
      const linkId = '1';
      const statisticsResponseDto: StatisticsResponseDto = {
        count: 5,
      };
      jest.spyOn(service, 'statistics').mockResolvedValue({
        id: +linkId,
        redirectsCount: statisticsResponseDto.count,
      } as Link);

      const result = await controller.statistics(linkId);
      expect(result).toEqual(statisticsResponseDto);
    });

    it('should throw HttpException if statistics retrieval fails', async () => {
      const linkId = '1';
      jest
        .spyOn(service, 'statistics')
        .mockRejectedValue(new Error('Statistics retrieval failed'));

      await expect(controller.statistics(linkId)).rejects.toThrow(
        HttpException,
      );
    });

    it('should use ValidationPipe to validate the input', async () => {
      const invalidId = 'abc';
      await expect(controller.statistics(invalidId)).rejects.toThrow();
    });
  });

  describe('invalidateLink', () => {
    it('should invalidate the link', async () => {
      const linkRequestDto: LinkRequestDto = {
        link: 'https://maskedurl.com/abcd',
      };
      jest.spyOn(service, 'invalidateLink').mockResolvedValue(undefined);

      const result = await controller.invalidateLink(linkRequestDto);
      expect(result).toBeUndefined();
    });

    it('should throw HttpException if invalidation fails', async () => {
      const linkRequestDto: LinkRequestDto = {
        link: 'https://maskedurl.com/abcd',
      };
      jest
        .spyOn(service, 'invalidateLink')
        .mockRejectedValue(new Error('Invalidation failed'));

      await expect(controller.invalidateLink(linkRequestDto)).rejects.toThrow(
        HttpException,
      );
    });

    it('should use ValidationPipe to validate the input', async () => {
      const invalidLinkRequestDto: LinkRequestDto = { link: 'invalid-url' };
      await expect(
        controller.invalidateLink(invalidLinkRequestDto),
      ).rejects.toThrow();
    });
  });
});

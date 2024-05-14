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
});

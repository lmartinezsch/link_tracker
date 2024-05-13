import { Test, TestingModule } from '@nestjs/testing';
import { LinksService } from '../../src/links/links.service';
import { Repository } from 'typeorm';
import { Link } from '../../src/links/entities/link.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateLinkDto } from '../../src/links/dto/create-link.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('LinksService', () => {
  let service: LinksService;
  let linkRepository: Repository<Link>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        { provide: getRepositoryToken(Link), useClass: Repository },
      ],
    }).compile();

    service = module.get<LinksService>(LinksService);
    linkRepository = module.get<Repository<Link>>(getRepositoryToken(Link));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new link successfully with passowrd', async () => {
      const createLinkDto: CreateLinkDto = {
        url: 'http://example.com',
        password: 'password',
      };
      const savedLink = {
        id: 1,
        link: 'https://maskedurl.com/abcd',
        target: 'http://example.com',
        password: 'password',
      };
      jest.spyOn(linkRepository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(linkRepository, 'create').mockReturnValue(savedLink as any);
      jest.spyOn(linkRepository, 'save').mockResolvedValue(savedLink as any);
      const result = await service.create(createLinkDto);
      expect(result).toEqual(savedLink);
    });

    it('should create a new link successfully without passowrd', async () => {
      const createLinkDto: CreateLinkDto = {
        url: 'http://example.com',
      };
      const savedLink = {
        id: 1,
        link: 'https://maskedurl.com/abcd',
        target: 'http://example.com',
        password: null,
      };
      jest.spyOn(linkRepository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(linkRepository, 'create').mockReturnValue(savedLink as any);
      jest.spyOn(linkRepository, 'save').mockResolvedValue(savedLink as any);
      const result = await service.create(createLinkDto);
      expect(result).toEqual(savedLink);
    });

    it('should throw BadRequestException if url already has a masked url', async () => {
      const createLinkDto = {
        url: 'https://example.com',
        password: 'password',
      };
      jest
        .spyOn(linkRepository, 'findOneBy')
        .mockResolvedValue({ id: 1 } as any);

      await expect(service.create(createLinkDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('statistics', () => {
    it('should return link statistics', async () => {
      const linkId = 1;
      const linkEntity = { id: linkId, redirectsCount: 0 } as any;
      jest.spyOn(linkRepository, 'findOneBy').mockResolvedValue(linkEntity);

      const result = await service.statistics(linkId);
      expect(result).toEqual(linkEntity);
    });

    it('should throw NotFoundException if link not found', async () => {
      const linkId = 1;
      jest.spyOn(linkRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.statistics(linkId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('redirect', () => {
    it('should redirect to the link and increment redirectsCount', async () => {
      const linkEntity = {
        id: 1,
        link: 'https://maskedurl.com/abcd',
        redirectsCount: 0,
        isValid: true,
      } as any;
      jest.spyOn(linkRepository, 'findOneBy').mockResolvedValue(linkEntity);
      jest.spyOn(linkRepository, 'save').mockResolvedValue(null);

      const result = await service.redirect(linkEntity.link, 'password');
      expect(result).toEqual(linkEntity);
      expect(linkEntity.redirectsCount).toBe(1);
      expect(linkRepository.save).toHaveBeenCalledWith(linkEntity);
    });

    it('should throw NotFoundException if link not found', async () => {
      jest.spyOn(linkRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.redirect('invalid-link', 'password'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if link is invalid', async () => {
      const linkEntity = {
        id: 1,
        link: 'https://maskedurl.com/abcd',
        isValid: false,
      } as any;
      jest.spyOn(linkRepository, 'findOneBy').mockResolvedValue(linkEntity);

      await expect(
        service.redirect(linkEntity.link, 'password'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is required but not provided', async () => {
      const linkEntity = {
        id: 1,
        link: 'https://maskedurl.com/abcd',
        password: 'password',
      } as any;
      jest.spyOn(linkRepository, 'findOneBy').mockResolvedValue(linkEntity);

      await expect(service.redirect(linkEntity.link, '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      const linkEntity = {
        id: 1,
        link: 'https://maskedurl.com/abcd',
        password: 'password',
      } as any;
      jest.spyOn(linkRepository, 'findOneBy').mockResolvedValue(linkEntity);

      await expect(
        service.redirect(linkEntity.link, 'incorrect-password'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is required', async () => {
      const linkEntity = {
        id: 1,
        link: 'https://maskedurl.com/abcd',
      } as any;
      jest.spyOn(linkRepository, 'findOneBy').mockResolvedValue(linkEntity);

      await expect(
        service.redirect(linkEntity.link, 'password-required'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('invalidateLink', () => {
    it('should invalidate a link', async () => {
      const linkEntity = {
        id: 1,
        link: 'https://maskedurl.com/abcd',
        isValid: true,
      } as any;
      jest.spyOn(linkRepository, 'findOneBy').mockResolvedValue(linkEntity);
      jest.spyOn(linkRepository, 'save').mockResolvedValue(null);

      await service.invalidateLink(linkEntity.link);
      expect(linkEntity.isValid).toBe(false);
      expect(linkRepository.save).toHaveBeenCalledWith(linkEntity);
    });

    it('should throw NotFoundException if link not found', async () => {
      jest.spyOn(linkRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.invalidateLink('invalid-link')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

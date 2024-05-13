import { Test, TestingModule } from '@nestjs/testing';
import { LinksController } from '../../src/links/links.controller';
import { LinksService } from '../../src/links/links.service';
import { Repository } from 'typeorm';
import { Link } from '../../src/links/entities/link.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('LinksController', () => {
  let controller: LinksController;
  let linkRepository: Repository<Link>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinksController],
      providers: [
        LinksService,
        { provide: getRepositoryToken(Link), useClass: Repository },
      ],
    }).compile();

    controller = module.get<LinksController>(LinksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

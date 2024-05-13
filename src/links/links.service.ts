import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLinkDto } from './dto/create-link.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Link } from './entities/link.entity';
import { Repository } from 'typeorm';
import { generateRandomBytes } from 'src/utils/random-bytes';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linksRepository: Repository<Link>,
  ) {}

  async create(createLinkDto: CreateLinkDto) {
    const link = await this.linksRepository.findOneBy({
      target: createLinkDto.url,
    });
    if (link)
      throw new BadRequestException('The urls already has an masked url');

    const linkId = generateRandomBytes(6);
    const newLink = this.linksRepository.create({
      link: process.env.MASKED_URL + linkId,
      target: createLinkDto.url,
    });
    return await this.linksRepository.save(newLink);
  }

  async statistics(id: number): Promise<Link> {
    const linkEntity = await this.linksRepository.findOneBy({ id });
    if (!linkEntity) throw new NotFoundException('Link not found');

    return linkEntity;
  }

  async redirect(link: string): Promise<Link> {
    const linkEntity = await this.linksRepository.findOneBy({ link });

    if (!linkEntity) throw new NotFoundException('Link not found');
    if (!linkEntity.isValid) throw new BadRequestException('Link is invalid');

    // Register the new redirect
    linkEntity.redirectsCount++;
    await this.linksRepository.save(linkEntity);

    return linkEntity;
  }

  async invalidateLink(link: string): Promise<void> {
    const linkEntity = await this.linksRepository.findOneBy({ link });
    if (!linkEntity) throw new NotFoundException('Link not found');

    linkEntity.isValid = false;
    await this.linksRepository.save(linkEntity);
  }
}

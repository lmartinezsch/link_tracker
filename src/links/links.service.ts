import { Injectable } from '@nestjs/common';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Link } from './entities/link.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linksRepository: Repository<Link>,
  ) {}

  async create(createLinkDto: CreateLinkDto) {
    const newLink = this.linksRepository.create({
      link: createLinkDto.link,
      target: createLinkDto.target,
      isValid: createLinkDto.isValid,
    });
    await this.linksRepository.save(newLink);
  }

  findAll() {
    return this.linksRepository.find();
  }

  async statistics(id: number): Promise<Link> {
    const linkEntity = await this.linksRepository.findOneBy({ id });
    if (!linkEntity) throw new Error('Link not found');

    return linkEntity;
  }

  async redirect(link: string): Promise<Link> {
    const linkEntity = await this.linksRepository.findOneBy({ link });

    if (!linkEntity) throw new Error('Link not found');
    if (!linkEntity.isValid) throw new Error('Link is invalid');

    // Register the new redirect
    linkEntity.redirectsCount++;
    await this.linksRepository.save(linkEntity);

    return linkEntity;
  }

  async invalidateLink(link: string) {
    const linkEntity = await this.linksRepository.findOneBy({ link });
    linkEntity.isValid = false;
    await this.linksRepository.save(linkEntity);

    return;
  }

  async remove(id: number) {
    await this.linksRepository.delete(id);
  }
}

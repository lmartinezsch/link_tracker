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
import * as bcrypt from 'bcrypt';

@Injectable()
export class LinksService {
  SALT_OR_ROUNDS: number = 10;

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
    const hashPassword = createLinkDto.password
      ? await bcrypt.hash(createLinkDto.password, this.SALT_OR_ROUNDS)
      : null;

    const newLink = this.linksRepository.create({
      link: process.env.MASKED_URL + linkId,
      target: createLinkDto.url,
      password: hashPassword,
    });
    return await this.linksRepository.save(newLink);
  }

  async statistics(id: number): Promise<Link> {
    const linkEntity = await this.linksRepository.findOneBy({ id });
    if (!linkEntity) throw new NotFoundException('Link not found');

    return linkEntity;
  }

  async redirect(link: string, password: string): Promise<Link> {
    const linkEntity = await this.linksRepository.findOneBy({ link });

    await this.redirectValidations(linkEntity, password);

    // Register the new redirect
    linkEntity.redirectsCount++;
    await this.linksRepository.save(linkEntity);

    return linkEntity;
  }

  private async redirectValidations(linkEntity: Link, password: string) {
    if (!linkEntity) throw new NotFoundException('Link not found');
    if (!linkEntity.isValid) throw new BadRequestException('Link is invalid');
    if (linkEntity.password && !password)
      throw new BadRequestException('Password required');

    if (linkEntity.password && password) {
      const isMatch = await bcrypt.compare(password, linkEntity.password);

      if (!isMatch) {
        throw new BadRequestException('Password incorrect');
      }
    }
  }

  async invalidateLink(link: string): Promise<void> {
    const linkEntity = await this.linksRepository.findOneBy({ link });
    if (!linkEntity) throw new NotFoundException('Link not found');

    linkEntity.isValid = false;
    await this.linksRepository.save(linkEntity);
  }
}

import { IsString } from 'class-validator';

export class LinkRequestDto {
  @IsString()
  link!: string;
}

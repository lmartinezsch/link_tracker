import { IsDate, IsOptional, IsString } from 'class-validator';

export class CreateLinkDto {
  @IsString()
  url!: string;

  @IsDate()
  @IsOptional()
  expirationDate?: Date;
}

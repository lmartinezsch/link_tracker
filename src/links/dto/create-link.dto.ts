import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class CreateLinkDto {
  @IsString()
  link!: string;

  @IsString()
  target!: string;

  @IsBoolean()
  isValid!: boolean;

  @IsDate()
  @IsOptional()
  expirationDate?: Date;
}

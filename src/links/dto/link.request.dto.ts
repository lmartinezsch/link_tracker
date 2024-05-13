import { IsOptional, IsString } from 'class-validator';

export class LinkRequestDto {
  @IsString()
  link!: string;

  @IsString()
  @IsOptional()
  password?: string;
}

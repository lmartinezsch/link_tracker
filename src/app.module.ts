import { Module } from '@nestjs/common';
import { LinksModule } from './links/links.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      synchronize: true,
      entities: [`${__dirname}/**/entities/*.{ts,js}`],
      migrations: [`${__dirname}/**/migrations/*.{ts,js}`],
    }),
    LinksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

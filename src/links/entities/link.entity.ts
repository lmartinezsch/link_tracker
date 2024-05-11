import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Link {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  link: string;

  @Column({ type: 'varchar', nullable: false })
  target: string;

  @Column({ default: true })
  isValid: boolean;

  @Column()
  redirectsCount: number = 0;

  @Column({ type: 'varchar', nullable: true })
  expirationDate?: Date;
}

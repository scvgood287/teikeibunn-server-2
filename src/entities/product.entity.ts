import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Index } from 'typeorm';
import { Option } from './option.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  lotteryticket: number;

  @Index()
  @Column()
  urlId: string;

  @OneToMany(() => Option, option => option.product, { cascade: true })
  options: Option[];
}

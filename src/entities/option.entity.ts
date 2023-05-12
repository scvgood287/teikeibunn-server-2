import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Option {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  lotteryticket: number;

  @ManyToOne(() => Product, product => product.options, { onDelete: 'CASCADE' })
  product: Product;
}

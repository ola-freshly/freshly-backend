import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('pantry_items')
export class PantryItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  name!: string;

  @Column({ type: 'decimal' })
  quantity!: number;

  @Column({ length: 50 })
  unit!: string;

  @Column({ length: 100, nullable: true })
  category?: string;

  @Column({ nullable: true })
  barcode?: string;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ name: 'purchase_date', type: 'date', nullable: true })
  purchaseDate?: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PantryItemSource {
  MANUAL = 'manual',
  AI = 'ai',
  BARCODE = 'barcode',
}

export enum FoodCategory {
  DAIRY = 'dairy',
  VEGETABLE = 'vegetable',
  FRUIT = 'fruit',
  MEAT = 'meat',
  SEAFOOD = 'seafood',
  GRAIN = 'grain',
  SPICE = 'spice',
  BEVERAGE = 'beverage',
  SNACK = 'snack',
  CONDIMENT = 'condiment',
  OTHER = 'other',
}

export enum AiProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Index(['user', 'category'])
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

  @Column({ type: 'enum', enum: FoodCategory, nullable: true })
  category?: FoodCategory;

  @Column({ nullable: true })
  barcode?: string;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ name: 'purchase_date', type: 'date', nullable: true })
  purchaseDate?: Date;

  @Index()
  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({
    type: 'enum',
    enum: PantryItemSource,
    default: PantryItemSource.MANUAL,
  })
  source!: PantryItemSource;

  @Column({
    name: 'ai_processing_status',
    type: 'enum',
    enum: AiProcessingStatus,
    nullable: true,
  })
  aiProcessingStatus?: AiProcessingStatus;

  @Column({ name: 'ai_confidence', type: 'decimal', nullable: true })
  aiConfidence?: number;

  @Column({ name: 'ocr_result', type: 'text', nullable: true })
  ocrResult?: string;

  @Column({ name: 'usage_instruction', type: 'text', nullable: true })
  usageInstruction?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

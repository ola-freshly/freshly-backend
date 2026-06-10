import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('nutrition_logs')
export class NutritionLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'week_start', type: 'date' })
  weekStart!: Date;

  @Column({ name: 'protein_ratio', type: 'decimal' })
  proteinRatio!: number;

  @Column({ name: 'vegetable_ratio', type: 'decimal' })
  vegetableRatio!: number;

  @Column({ name: 'fruit_ratio', type: 'decimal' })
  fruitRatio!: number;

  @Column({ name: 'nutrition_score', type: 'decimal' })
  nutritionScore!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
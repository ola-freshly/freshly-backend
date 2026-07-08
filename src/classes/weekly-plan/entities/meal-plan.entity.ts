import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User, WeightGoal } from '../../users/entities/user.entity';

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH='lunch',
  DINNER='dinner',
  SIDEDISHES='sidedishes'
}

export interface Dish{
  name: string;
  ingredients: string[];
  description?: string;
  estimatedMinutes?: number;
}

@Index(['user','date'])
@Unique(['user','date','mealType'])
@Entity('meal-plans')
export class MealPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'enum', enum: MealType, name: 'meal_type' })
  mealType!: MealType;

  @Column({ type: 'jsonb' })
  dishes!: Dish[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
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
import { User } from '../../users/entities/user.entity';

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

export class MealPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(()=>User,{onDelete:"CASCADE"})
  @JoinColumn({name:"user_id"})
}
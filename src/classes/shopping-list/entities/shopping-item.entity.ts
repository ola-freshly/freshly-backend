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
import { MealPlan } from '../../meal-plans/entities/meal-plan.entity';

@Index(['user', 'purchased'])
@Entity('shopping_items')
export class ShoppingItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Provenance: which meal plan generated this item (null = manually added).
  @ManyToOne(() => MealPlan, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'meal_plan_id' })
  mealPlan?: MealPlan | null;

  @Column()
  name!: string;

  @Column({ type: 'decimal' })
  quantity!: number;

  @Column({ length: 50 })
  unit!: string;

  @Column({ default: false })
  purchased!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

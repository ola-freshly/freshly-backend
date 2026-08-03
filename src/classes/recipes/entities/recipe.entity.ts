import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('recipes')
@Index(['createdAt', 'id'])
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 100, nullable: true })
  cuisine?: string;

  @Column({ nullable: true })
  servings?: number;

  @Column({ name: 'cook_time', nullable: true })
  cookTime?: number;

  @Column({ type: 'text' })
  instructions!: string;

  @Column({ name: 'calories', type: 'decimal', nullable: true })
  calories?: number;

  @Column({ name: 'protein', type: 'decimal', nullable: true })
  protein?: number;

  @Column({ name: 'carbs', type: 'decimal', nullable: true })
  carbs?: number;

  @Column({ name: 'fat', type: 'decimal', nullable: true })
  fat?: number;

  // Category for filtering: breakfast | lunch | dinner | snack. Nullable so
  // pre-existing / uncategorised recipes are still valid.
  @Column({ name: 'meal_type', length: 20, nullable: true })
  mealType?: string;

  // 'library' recipes appear in GET /recipes; 'plan' recipes are attached to a
  // meal plan only and are hidden from the recipe library.
  @Column({ length: 20, default: 'library' })
  source!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

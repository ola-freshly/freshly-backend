import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MealPlan } from '../../meal-plans/entities/meal-plan.entity';
import { Recipe } from '../../recipes/entities/recipe.entity';

@Entity('meal_plan_items')
export class MealPlanItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'meal_plan_id' })
  mealPlanId!: string;

  @ManyToOne(() => MealPlan)
  @JoinColumn({ name: 'meal_plan_id' })
  mealPlan!: MealPlan;

  @Column({ name: 'recipe_id' })
  recipeId!: string;

  @ManyToOne(() => Recipe)
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;

  @Column({ name: 'meal_date', type: 'date' })
  mealDate!: Date;

  @Column({ name: 'meal_type', length: 50 })
  mealType!: string;
}

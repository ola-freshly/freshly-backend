import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity';

@Entity('recipe_ingredients')
export class RecipeIngredient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'recipe_id' })
  recipeId!: string;

  @ManyToOne(() => Recipe)
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;

  @Column({ name: 'ingredient_name' })
  ingredientName!: string;

  @Column({ type: 'decimal', nullable: true })
  quantity?: number;

  @Column({ length: 50, nullable: true })
  unit?: string;
}
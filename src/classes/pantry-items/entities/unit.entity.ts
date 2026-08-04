import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// Canonical measurement units. Which units are valid for a given food category
// is defined by the `category_units` join table (see FoodCategory.units).
@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 20, unique: true })
  code!: string;

  @Column({ length: 50 })
  label!: string;
}

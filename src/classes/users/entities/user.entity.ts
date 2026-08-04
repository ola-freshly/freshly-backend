import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum WeightGoal {
  GAIN = 'gain',
  LOSE = 'lose',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  phone?: string | null;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'avatar_url', nullable: true, type: 'varchar' })
  avatarUrl?: string | null;

  @Column({ name: 'is_verified', default: false })
  isVerified!: boolean;

  @Column({ name: 'verification_token', nullable: true, type: 'varchar' })
  verificationToken?: string | null;

  @Column({ name: 'refresh_token_hash', nullable: true, type: 'varchar' })
  refreshTokenHash?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'weight', nullable: true, type: 'decimal' })
  weight!: number | null;

  @Column({ name: 'height', nullable: true, type: 'decimal' })
  height!: number | null;

  @Column({
    name: 'preferred_plan',
    nullable: true,
    type: 'enum',
    enum: WeightGoal,
  })
  preferredPlan!: WeightGoal | null;
}

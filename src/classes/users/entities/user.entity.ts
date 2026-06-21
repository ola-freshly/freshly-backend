import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, nullable: true })
  phone?: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

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
}

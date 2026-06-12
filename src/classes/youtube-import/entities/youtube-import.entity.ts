import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('youtube_imports')
export class YouTubeImport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'youtube_url', type: 'text' })
  youtubeUrl!: string;

  @Column({ name: 'video_title', nullable: true })
  videoTitle?: string;

  @Column({ name: 'extracted_recipe', type: 'jsonb', nullable: true })
  extractedRecipe?: object;

  @CreateDateColumn({ name: 'imported_at' })
  importedAt!: Date;
}
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../config/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

const TABLE = 'users';

const PUBLIC_FIELDS =
  'id, email, full_name, username, bio, avatar_url, dietary_preferences, created_at, updated_at';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findById(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from(TABLE)
      .select(PUBLIC_FIELDS)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('User not found');
    }

    return data;
  }

  private async isUsernameTaken(
    username: string,
    excludeId: string,
  ): Promise<boolean> {
    const { data } = await this.supabaseService
      .getClient()
      .from(TABLE)
      .select('id')
      .eq('username', username)
      .neq('id', excludeId)
      .maybeSingle();

    return !!data;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    if (dto.username !== undefined) {
      const taken = await this.isUsernameTaken(dto.username, id);
      if (taken) {
        throw new ConflictException({
          message: 'Validation failed',
          errors: [{ field: 'username', message: 'Username is already taken' }],
        });
      }
    }

    const updates: Record<string, unknown> = {
      ...dto,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabaseService
      .getClient()
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select(PUBLIC_FIELDS)
      .single();

    if (error || !data) {
      throw new NotFoundException('User not found');
    }

    return data;
  }
}

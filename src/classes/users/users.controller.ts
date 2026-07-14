import {
  Controller,
  Get,
  Patch,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from './decorators/current-user.decorator';

type PublicUserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  weight: number | null;
  height: number | null;
  preferredPlan: string | null;
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private toPublicProfile(user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    weight?: number | null;
    height?: number | null;
    preferredPlan?: string | null;
  }): PublicUserProfile {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      avatarUrl: user.avatarUrl ?? null,
      weight: user.weight ?? null,
      height: user.height ?? null,
      preferredPlan: user.preferredPlan ?? null,
    };
  }

  @Get('me')
  async getProfile(@CurrentUser() user: { id: string; email: string }) {
    const found = await this.usersService.findById(user.id);
    if (!found) throw new NotFoundException('User not found');
    return this.toPublicProfile(found);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.usersService.updateProfile(user.id, dto);
    return this.toPublicProfile(updated);
  }
}

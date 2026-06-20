import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import type { AuthenticatedUser } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.usersService.findById(user.id);
    return { success: true, data };
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const data = await this.usersService.updateProfile(user.id, dto);
    return {
      success: true,
      message: 'Profile updated successfully',
      data,
    };
  }
}

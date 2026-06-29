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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: { id: string; email: string }) {
    const found = await this.usersService.findById(user.id);
    if (!found) throw new NotFoundException('User not found');
    const { passwordHash, refreshTokenHash, verificationToken, ...profile } = found;
    return profile;
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.usersService.updateProfile(user.id, dto);
    const { passwordHash, refreshTokenHash, verificationToken, ...profile } = updated;
    return profile;
  }
}

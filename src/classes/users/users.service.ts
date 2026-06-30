import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  verificationToken: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async createUser(data: CreateUserData): Promise<User> {
    const user = this.userRepo.create({ ...data, isVerified: false });
    return this.userRepo.save(user);
  }

  findByVerificationToken(token: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { verificationToken: token } });
  }

  async markVerified(id: string): Promise<void> {
    await this.userRepo.update(id, {
      isVerified: true,
      verificationToken: null,
    });
  }

  async updateRefreshToken(
    id: string,
    refreshTokenHash: string,
  ): Promise<void> {
    await this.userRepo.update(id, { refreshTokenHash });
  }
}

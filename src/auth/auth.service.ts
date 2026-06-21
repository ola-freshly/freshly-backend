import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersService } from '../classes/users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthUser } from './interfaces/auth-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const verificationToken = randomUUID();

    const user = await this.usersService.createUser({
      name: dto.name,
      email: dto.email,
      passwordHash,
      verificationToken,
    });

    this.mailService
      .sendVerificationEmail(user, verificationToken)
      .catch((err) => console.error('Verification email failed', err));

    return {
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }
    await this.usersService.markVerified(user.id);
  }

  async login(dto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new ForbiddenException('Please verify your email before logging in');
    }

    return this.generateTokens({ id: user.id, name: user.name, email: user.email });
  }

  async generateTokens(user: AuthUser): Promise<{
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: user.id, email: user.email },
        { secret: this.config.get<string>('JWT_SECRET'), expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: user.id },
        { secret: this.config.get<string>('JWT_REFRESH_SECRET'), expiresIn: '7d' },
      ),
    ]);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, refreshTokenHash);

    return { accessToken, refreshToken, user };
  }
}

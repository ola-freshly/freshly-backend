import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersService } from '../classes/users/users.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
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
    const email = dto.email.trim().toLowerCase();

    const existing = await this.usersService.findByEmail(email);

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const verificationToken = randomUUID();

    const user = await this.usersService.createUser({
      name: dto.name.trim(),
      email,
      passwordHash,
      verificationToken,
    });

    this.mailService
      .sendVerificationEmail(user, verificationToken)
      .catch((error: unknown) => {
        console.error('Verification email failed', error);
      });

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
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
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account does not have a password configured',
      );
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new ForbiddenException(
        'Please verify your email before logging in',
      );
    }

    return this.generateTokens({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  async refresh(
    userId: string,
    refreshToken: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.usersService.findById(userId);

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokenPair(user.id, user.email);

    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);

    await this.usersService.updateRefreshToken(user.id, refreshTokenHash);

    return tokens;
  }

  private async generateTokenPair(
    sub: string,
    email: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const jwtSecret = this.config.get<string>('JWT_SECRET');
    const jwtRefreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be configured');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub, email },
        {
          secret: jwtSecret,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub },
        {
          secret: jwtRefreshSecret,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(user: AuthUser): Promise<{
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }> {
    const { accessToken, refreshToken } = await this.generateTokenPair(
      user.id,
      user.email,
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.usersService.updateRefreshToken(user.id, refreshTokenHash);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}

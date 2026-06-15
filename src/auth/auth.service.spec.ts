import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../classes/users/users.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { User } from '../classes/users/entities/user.entity';

const mockUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'uuid-1',
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedpassword',
    isVerified: true,
    verificationToken: null,
    refreshTokenHash: null,
    ...overrides,
  } as User);

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    findByVerificationToken: jest.fn(),
    markVerified: jest.fn(),
    updateRefreshToken: jest.fn(),
  };
  const mockMailService = { sendVerificationEmail: jest.fn().mockResolvedValue(undefined) };
  const mockJwtService = { signAsync: jest.fn() };
  const mockConfigService = { get: jest.fn((key: string) => key) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: MailService, useValue: mockMailService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const dto = { name: 'Test User', email: 'test@example.com', password: 'password123' };

    it('throws ConflictException if email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser());
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('hashes password before saving', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.createUser.mockResolvedValue(mockUser({ isVerified: false }));

      await service.register(dto);

      const createCall = mockUsersService.createUser.mock.calls[0][0];
      expect(createCall.passwordHash).not.toBe('password123');
      expect(createCall.verificationToken).toBeDefined();
    });

    it('returns success message', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.createUser.mockResolvedValue(mockUser({ isVerified: false }));

      const result = await service.register(dto);
      expect(result.message).toBeDefined();
    });
  });

  describe('verifyEmail', () => {
    it('throws BadRequestException for invalid token', async () => {
      mockUsersService.findByVerificationToken.mockResolvedValue(null);
      await expect(service.verifyEmail('bad-token')).rejects.toThrow(BadRequestException);
    });

    it('calls markVerified with the user id', async () => {
      mockUsersService.findByVerificationToken.mockResolvedValue(
        mockUser({ verificationToken: 'good-token' }),
      );
      mockUsersService.markVerified.mockResolvedValue(undefined);

      await service.verifyEmail('good-token');
      expect(mockUsersService.markVerified).toHaveBeenCalledWith('uuid-1');
    });
  });

  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'password123' };

    it('throws UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if password does not match', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser({ passwordHash: '$2b$10$wrong' }));
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException if email not verified', async () => {
      const hash = await bcrypt.hash('password123', 10);
      mockUsersService.findByEmail.mockResolvedValue(
        mockUser({ passwordHash: hash, isVerified: false }),
      );
      await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
    });

    it('returns tokens and user summary on success', async () => {
      const hash = await bcrypt.hash('password123', 10);
      mockUsersService.findByEmail.mockResolvedValue(
        mockUser({ passwordHash: hash, isVerified: true }),
      );
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.login(dto);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).toEqual({ id: 'uuid-1', name: 'Test User', email: 'test@example.com' });
    });
  });

  describe('generateTokens', () => {
    it('returns accessToken and refreshToken and persists hash', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.generateTokens({ id: 'uuid-1', name: 'Test', email: 'test@example.com' });
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith('uuid-1', expect.any(String));
    });
  });
});

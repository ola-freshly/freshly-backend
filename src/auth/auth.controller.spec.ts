import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    verifyEmail: jest.fn(),
    login: jest.fn(),
  };
  const mockConfigService = { get: jest.fn(() => 'http://localhost:4200') };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register() delegates to AuthService and returns message', async () => {
    mockAuthService.register.mockResolvedValue({ message: 'Registration successful.' });
    const result = await controller.register({
      name: 'Test',
      email: 'test@example.com',
      password: 'pass1234',
    });
    expect(mockAuthService.register).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Registration successful.' });
  });

  it('verifyEmail() calls authService then redirects to FRONTEND_URL', async () => {
    mockAuthService.verifyEmail.mockResolvedValue(undefined);
    const mockRes = { redirect: jest.fn() } as unknown as Response;

    await controller.verifyEmail('token-123', mockRes);

    expect(mockAuthService.verifyEmail).toHaveBeenCalledWith('token-123');
    expect(mockRes.redirect).toHaveBeenCalledWith('http://localhost:4200/login?verified=true');
  });

  it('login() delegates to AuthService and returns tokens', async () => {
    const loginResult = {
      accessToken: 'access',
      refreshToken: 'refresh',
      user: { id: '1', name: 'Test', email: 'test@example.com' },
    };
    mockAuthService.login.mockResolvedValue(loginResult);
    const result = await controller.login({ email: 'test@example.com', password: 'pass1234' });
    expect(result).toEqual(loginResult);
  });
});

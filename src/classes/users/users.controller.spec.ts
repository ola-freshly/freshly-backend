import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUser = {
  id: 'uuid-1',
  name: 'Test User',
  email: 'test@example.com',
  phone: null,
  avatarUrl: null,
  isVerified: true,
  passwordHash: 'secret',
  refreshTokenHash: 'secret',
  verificationToken: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const safeUser = {
  id: 'uuid-1',
  name: 'Test User',
  email: 'test@example.com',
  phone: null,
  avatarUrl: null,
  weight: null,
  height: null,
  preferredPlan: null,
  bmi: null,
};

const mockUsersService = {
  findById: jest.fn(),
  updateProfile: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /users/me', () => {
    it('returns profile without sensitive fields', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      const result = await controller.getProfile({
        id: 'uuid-1',
        email: 'test@example.com',
      });

      expect(mockUsersService.findById).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(safeUser);
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('refreshTokenHash');
      expect(result).not.toHaveProperty('verificationToken');
      expect(result).not.toHaveProperty('isVerified');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockUsersService.findById.mockResolvedValue(null);
      await expect(
        controller.getProfile({ id: 'bad-id', email: 'x@x.com' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('PATCH /users/me', () => {
    it('returns updated profile without sensitive fields', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      const updatedSafe = {
        id: 'uuid-1',
        name: 'Updated Name',
        email: 'test@example.com',
        phone: null,
        avatarUrl: null,
        weight: null,
        height: null,
        preferredPlan: null,
        bmi: null,
      };
      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(
        { id: 'uuid-1', email: 'test@example.com' },
        { name: 'Updated Name' },
      );

      expect(mockUsersService.updateProfile).toHaveBeenCalledWith('uuid-1', {
        name: 'Updated Name',
      });
      expect(result).toEqual(updatedSafe);
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('refreshTokenHash');
      expect(result).not.toHaveProperty('verificationToken');
      expect(result).not.toHaveProperty('isVerified');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });

    it('handles empty body without error', async () => {
      mockUsersService.updateProfile.mockResolvedValue(mockUser);

      const result = await controller.updateProfile(
        { id: 'uuid-1', email: 'test@example.com' },
        {},
      );

      expect(mockUsersService.updateProfile).toHaveBeenCalledWith('uuid-1', {});
      expect(result).toEqual(safeUser);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

const mockUser: Partial<User> = {
  id: 'uuid-1',
  name: 'Test User',
  email: 'test@example.com',
  passwordHash: 'hashed',
  isVerified: false,
  verificationToken: 'token-123',
  refreshTokenHash: null,
};

const mockRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('returns a user when found', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('returns null when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const result = await service.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('creates and saves a new user', async () => {
      mockRepo.create.mockReturnValue(mockUser);
      mockRepo.save.mockResolvedValue(mockUser);

      const result = await service.createUser({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed',
        verificationToken: 'token-123',
      });

      expect(mockRepo.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed',
        verificationToken: 'token-123',
        isVerified: false,
      });
      expect(mockRepo.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByVerificationToken', () => {
    it('returns user when token matches', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.findByVerificationToken('token-123');
      expect(result).toEqual(mockUser);
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { verificationToken: 'token-123' } });
    });

    it('returns null when token not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const result = await service.findByVerificationToken('bad-token');
      expect(result).toBeNull();
    });
  });

  describe('markVerified', () => {
    it('sets isVerified true and clears verificationToken', async () => {
      mockRepo.update.mockResolvedValue({ affected: 1 });
      await service.markVerified('uuid-1');
      expect(mockRepo.update).toHaveBeenCalledWith('uuid-1', {
        isVerified: true,
        verificationToken: null,
      });
    });
  });

  describe('updateRefreshToken', () => {
    it('stores the hashed refresh token', async () => {
      mockRepo.update.mockResolvedValue({ affected: 1 });
      await service.updateRefreshToken('uuid-1', 'hashed-refresh');
      expect(mockRepo.update).toHaveBeenCalledWith('uuid-1', {
        refreshTokenHash: 'hashed-refresh',
      });
    });
  });
});

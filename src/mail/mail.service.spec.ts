import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { User } from '../classes/users/entities/user.entity';

const mockTransporter = { sendMail: jest.fn().mockResolvedValue({}) };

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => mockTransporter),
}));

describe('MailService', () => {
  let service: MailService;

  const mockConfig = {
    get: jest.fn((key: string) => {
      const map: Record<string, string> = {
        MAIL_HOST: 'smtp.test.com',
        MAIL_USERNAME: 'test@test.com',
        MAIL_PASSWORD: 'password',
        MAIL_FROM_EMAIL: 'noreply@freshly.com',
        APP_URL: 'http://localhost:3000',
      };
      return map[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('calls sendMail with correct recipient and subject', async () => {
    const user = { name: 'Test User', email: 'test@example.com' } as User;
    await service.sendVerificationEmail(user, 'test-token-uuid');

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Verify your Freshly account',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        html: expect.stringContaining('test-token-uuid'),
      }),
    );
  });
});

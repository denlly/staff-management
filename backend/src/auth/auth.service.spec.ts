import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  const usersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    updateResetToken: jest.fn(),
    findByResetToken: jest.fn(),
    updatePassword: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should reject duplicated email during register', async () => {
    usersService.findByEmail.mockResolvedValue({ id: '1' });

    await expect(
      authService.register({
        name: 'daniel',
        email: 'demo@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should create reset token for existing user', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'demo@example.com',
    });

    const result = await authService.forgotPassword('demo@example.com');

    expect(usersService.updateResetToken).toHaveBeenCalled();
    expect(result).toHaveProperty('resetToken');
  });
});

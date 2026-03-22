import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(payload: RegisterDto) {
    const exists = await this.usersService.findByEmail(
      payload.email.toLowerCase(),
    );
    if (exists) {
      throw new BadRequestException('邮箱已被注册');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = await this.usersService.create({
      name: payload.name,
      email: payload.email.toLowerCase(),
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    });
    if (!user) {
      throw new BadRequestException('注册失败，请稍后再试');
    }

    return this.buildAuthResponse(user.id, user.email, user.name);
  }

  async login(payload: LoginDto) {
    const user = await this.usersService.findByEmail(
      payload.email.toLowerCase(),
    );
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const passwordMatched = await bcrypt.compare(
      payload.password,
      user.password,
    );
    if (!passwordMatched) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    return this.buildAuthResponse(user.id, user.email, user.name);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email.toLowerCase());
    if (!user) {
      // Prevent account enumeration by returning success even when absent.
      return {
        message: '如果邮箱存在，我们已发送重置链接',
      };
    }

    const resetToken = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.usersService.updateResetToken(user.id, resetToken, expiresAt);

    return {
      message: '重置令牌已生成（演示环境直接返回）',
      resetToken,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async resetPassword(payload: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(payload.token);
    if (
      !user ||
      !user.resetPasswordExpiresAt ||
      user.resetPasswordExpiresAt < new Date()
    ) {
      throw new BadRequestException('重置令牌无效或已过期');
    }

    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);
    await this.usersService.updatePassword(user.id, hashedPassword);

    return {
      message: '密码重置成功',
    };
  }

  private buildAuthResponse(userId: string, email: string, name: string) {
    const accessToken = this.jwtService.sign({
      sub: userId,
      email,
      name,
    });

    return {
      accessToken,
      user: {
        id: userId,
        email,
        name,
      },
    };
  }
}

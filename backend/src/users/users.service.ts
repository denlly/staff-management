import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(data: Partial<User>) {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByResetToken(token: string) {
    return this.usersRepository.findOne({
      where: { resetPasswordToken: token },
    });
  }

  async updateResetToken(
    userId: string,
    token: string | null,
    expiresAt: Date | null,
  ) {
    await this.usersRepository.update(
      { id: userId },
      { resetPasswordToken: token, resetPasswordExpiresAt: expiresAt },
    );
  }

  async updatePassword(userId: string, hashedPassword: string) {
    await this.usersRepository.update(
      { id: userId },
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
      },
    );
  }
}

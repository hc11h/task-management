import {
  BadRequestException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import type { IAUthRepository } from './interfaces/auth.repository.interface';
import crypto from 'crypto';

export class AuthService {
  constructor(
    @Inject('IAUthRepository') private readonly authRepository: IAUthRepository,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.authRepository.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async login(loginDto: { username: string; password: string }) {
    if (!loginDto || !loginDto.username || !loginDto.password) {
      throw new BadRequestException('username and password required');
    }
    const user = await this.validateUser(loginDto.username, loginDto.password);

    const token = this.signJwt({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    return { message: 'Login successful', user, token };
  }

  private signJwt(payload: Record<string, any>) {
    const secret = process.env.JWT_SECRET ?? 'dev_secret';
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 24 * 60 * 60;
    const body = { ...payload, iat: now, exp };
    const base64url = (input: string | Buffer) =>
      Buffer.from(typeof input === 'string' ? input : input)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(body))}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(unsigned)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    return `${unsigned}.${signature}`;
  }
}

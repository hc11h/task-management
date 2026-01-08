import { PrismaService } from 'src/prisma/prisma.service';
import { IAUthRepository } from '../interfaces/auth.repository.interface';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class AuthRepository implements IAUthRepository {
  constructor(private prisma: PrismaService) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}

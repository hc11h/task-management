import { User } from '@prisma/client';

export interface IAUthRepository {
  findByUsername(username: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

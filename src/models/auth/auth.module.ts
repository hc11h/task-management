import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './repositories/auth.repositories';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    { provide: 'IAUthRepository', useClass: AuthRepository },
  ],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './jwt.strategy.js';

@Module({
  imports: [PassportModule, JwtModule.register({ secret: process.env.JWT_SECRET || 'sih26027-secret-key-demo', signOptions: { expiresIn: '8h' } })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

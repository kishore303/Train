import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Public } from '../common/decorators/roles.decorator.js';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Public()
  @Post('login')
  async login(@Body() body: any) {
    return this.auth.login(body.email, body.password);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Request() req: any) { return this.auth.me(req.user); }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const DEMO_USERS = [
  { email: 'admin@rail.demo', password: 'demo123', role: 'ADMIN', name: 'Admin NR' },
  { email: 'engineering@rail.demo', password: 'demo123', role: 'ENGINEERING_OFFICER', name: 'Engineering Officer' },
  { email: 'electrical@rail.demo', password: 'demo123', role: 'ELECTRICAL_OFFICER', name: 'Electrical Officer' },
  { email: 'st@rail.demo', password: 'demo123', role: 'ST_OFFICER', name: 'S&T Officer' },
  { email: 'operating@rail.demo', password: 'demo123', role: 'OPERATING_OFFICER', name: 'Operating Officer' },
  { email: 'staff@rail.demo', password: 'demo123', role: 'MAINTENANCE_STAFF', name: 'Maintenance Staff' },
  { email: 'je@rail.demo', password: 'demo123', role: 'JE_PWAY', name: 'JE PWay' },
  { email: 'sse@rail.demo', password: 'demo123', role: 'SSE_PWAY', name: 'SSE PWay' },
];

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}
  async login(email: string, password: string) {
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = { email: user.email, role: user.role, name: user.name, sub: user.email };
    return { access_token: this.jwt.sign(payload), user: { email: user.email, role: user.role, name: user.name } };
  }
  me(user: any) { return user; }
}

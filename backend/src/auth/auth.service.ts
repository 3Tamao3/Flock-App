import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(username: string, email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    try {
      const user = await this.prisma.user.create({
        data: { username, email, passwordHash: hashed },
      });
      return this.excludePassword(user);
    } catch (error: any) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.includes('email') ? 'Email' : 'Username';
        throw new ConflictException(`${field} is already in use`);
      }
      throw error;
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? this.excludePassword(user) : null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    return { access_token: this.jwt.sign(payload), username: user.username, email: user.email };
  }

  private excludePassword(user: any) {
    const { passwordHash: _pw, ...result } = user;
    return result;
  }
}

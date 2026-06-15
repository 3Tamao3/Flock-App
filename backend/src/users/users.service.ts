import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findMe(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    const { passwordHash: _pw, ...result } = user!;
    return result;
  }

  async updateMe(id: string, dto: UpdateUserDto) {
    const data: Record<string, unknown> = {};
    if (dto.username) data.username = dto.username;
    if (dto.email) data.email = dto.email;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.update({ where: { id }, data });
      const { passwordHash: _pw, ...result } = user;
      return result;
    } catch (error: any) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.includes('username') ? 'Username' : 'Email';
        throw new ConflictException(`${field} already in use`);
      }
      throw error;
    }
  }

  async search(username: string) {
    return this.prisma.user.findMany({
      where: { username: { contains: username, mode: 'insensitive' } },
      select: { id: true, username: true, email: true },
    });
  }
}

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, email: true, createdAt: true },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: any = { ...dto };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
      delete data.password;
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, email: true, createdAt: true },
    });
  }

  async search(username: string) {
    return this.prisma.user.findMany({
      where: { username: { contains: username, mode: 'insensitive' } },
      select: { id: true, username: true, email: true },
    });
  }
}

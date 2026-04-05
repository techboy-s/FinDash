import prisma from '../utils/prisma';
import { NotFoundError } from '../utils/app-error';
import { Role } from '../generated/prisma/client';

export class UserService {
  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  static async updateUserRole(id: string, role: Role) {
    const userExists = await prisma.user.findUnique({ where: { id } });
    if (!userExists) {
      throw new NotFoundError('User not found');
    }

    return prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  static async deleteUser(id: string) {
    const userExists = await prisma.user.findUnique({ where: { id } });
    if (!userExists) {
      throw new NotFoundError('User not found');
    }

    await prisma.user.delete({ where: { id } });
  }
}

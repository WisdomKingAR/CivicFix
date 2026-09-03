// src/features/users/users.service.ts
import { prisma } from '../../core/database/prisma';
import { UpdateProfileInput } from './users.schema';

export class UsersService {
  public static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        jurisdiction: true,
        isFlagged: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  }

  public static async updateProfile(userId: string, data: UpdateProfileInput) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        jurisdiction: true,
        updatedAt: true,
      },
    });

    return updated;
  }
}

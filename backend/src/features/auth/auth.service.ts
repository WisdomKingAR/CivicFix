// src/features/auth/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../core/database/prisma';
import { env } from '../../core/config/env';
import { RegisterInput, LoginInput } from './auth.schema';
import { AuthUserPayload } from '../../core/types';

export class AuthService {
  public static async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: data.role,
        jurisdiction: data.jurisdiction,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        jurisdiction: true,
        createdAt: true,
      },
    });

    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, ...tokens };
  }

  public static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) {
      throw new Error('Invalid email or password.');
    }

    if (user.isFlagged) {
      // Still allow login, but inform that account is subject to review
    }

    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        jurisdiction: user.jurisdiction,
        isFlagged: user.isFlagged,
      },
      ...tokens,
    };
  }

  public static refreshAccessToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as AuthUserPayload;
      const accessToken = jwt.sign(
        { id: decoded.id, email: decoded.email, role: decoded.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any }
      );
      return { accessToken };
    } catch {
      throw new Error('Refresh token is invalid or expired.');
    }
  }

  public static generateTokens(payload: AuthUserPayload) {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken };
  }
}

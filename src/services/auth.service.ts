import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { env } from '../config/env';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { ConflictError, UnauthorizedError } from '../utils/app-error';
import { Role } from '../generated/prisma/client';

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  token: string;
}

function generateToken(payload: { id: string; email: string; role: Role }): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export async function registerUser(data: RegisterInput): Promise<AuthResponse> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError('A user with this email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role as Role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return { user, token };
}

export async function loginUser(data: LoginInput): Promise<AuthResponse> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(data.password, user.password);

  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

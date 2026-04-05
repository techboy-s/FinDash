import { z } from 'zod';
import { Role } from '../generated/prisma/client';

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(Role, {
    message: 'Role must be VIEWER, ANALYST, or ADMIN',
  }),
});

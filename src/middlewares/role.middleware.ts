import { Request, Response, NextFunction } from 'express';
import { Role } from '../generated/prisma/client';
import { ForbiddenError, UnauthorizedError } from '../utils/app-error';

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new ForbiddenError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
        )
      );
      return;
    }

    next();
  };
}

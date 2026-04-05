import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { env } from '../config/env';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default to 500 internal server error
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  const response: Record<string, unknown> = {
    status: 'error',
    statusCode,
    message,
  };

  // Include stack trace in development for non-operational errors
  if (env.NODE_ENV === 'development' && !(err instanceof AppError)) {
    console.error('Unexpected Error:', err);
    response.message = err.message;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

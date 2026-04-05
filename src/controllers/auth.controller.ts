import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

export async function register(
  req: Request<unknown, unknown, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.registerUser(req.body);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request<unknown, unknown, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.loginUser(req.body);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

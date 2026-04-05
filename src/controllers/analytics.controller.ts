import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service';

/**
 * Retrieves the overall financial summary (income, expenses, and net balance).
 */
export async function getSummary(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const summary = await analyticsService.getSummary();

    res.status(200).json({
      status: 'success',
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves the breakdown of expenses grouped by category.
 */
export async function getCategoryBreakdown(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const breakdown = await analyticsService.getCategoryBreakdown();

    res.status(200).json({
      status: 'success',
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves the income and expense trends historically by month.
 */
export async function getMonthlyTrends(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const trends = await analyticsService.getMonthlyTrends();

    res.status(200).json({
      status: 'success',
      data: trends,
    });
  } catch (error) {
    next(error);
  }
}

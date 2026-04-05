import { Request, Response, NextFunction } from 'express';
import * as recordService from '../services/record.service';
import { CreateRecordInput, UpdateRecordInput, RecordQueryInput } from '../schemas/record.schema';
import { UnauthorizedError } from '../utils/app-error';

export async function createRecord(
  req: Request<unknown, unknown, CreateRecordInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const record = await recordService.createRecord(req.body, req.user.id);

    res.status(201).json({
      status: 'success',
      message: 'Record created successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecords(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as RecordQueryInput;
    const result = await recordService.getRecords(query);

    res.status(200).json({
      status: 'success',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecordById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const record = await recordService.getRecordById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRecord(
  req: Request<{ id: string }, unknown, UpdateRecordInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const record = await recordService.updateRecord(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Record updated successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteRecord(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await recordService.deleteRecord(req.params.id);

    res.status(200).json({
      status: 'success',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

import { Router } from 'express';
import * as recordController from '../controllers/record.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createRecordSchema,
  updateRecordSchema,
  recordQuerySchema,
  recordIdParamSchema,
} from '../schemas/record.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/records — ADMIN only
router.post(
  '/',
  requireRole(['ADMIN']),
  validate({ body: createRecordSchema }),
  recordController.createRecord
);

// GET /api/records — VIEWER, ADMIN and ANALYST
router.get(
  '/',
  requireRole(['VIEWER', 'ADMIN', 'ANALYST']),
  validate({ query: recordQuerySchema }),
  recordController.getRecords
);

// GET /api/records/:id — VIEWER, ADMIN and ANALYST
router.get(
  '/:id',
  requireRole(['VIEWER', 'ADMIN', 'ANALYST']),
  validate({ params: recordIdParamSchema }),
  recordController.getRecordById
);

// PUT /api/records/:id — ADMIN only
router.put(
  '/:id',
  requireRole(['ADMIN']),
  validate({ params: recordIdParamSchema, body: updateRecordSchema }),
  recordController.updateRecord
);

// DELETE /api/records/:id — ADMIN only
router.delete(
  '/:id',
  requireRole(['ADMIN']),
  validate({ params: recordIdParamSchema }),
  recordController.deleteRecord
);

export default router;

import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { userIdParamSchema, updateUserRoleSchema } from '../schemas/user.schema';

const router = Router();

router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/', userController.getUsers);

router.get(
  '/:id',
  validate({ params: userIdParamSchema }),
  userController.getUserById
);

router.put(
  '/:id/role',
  validate({ params: userIdParamSchema, body: updateUserRoleSchema }),
  userController.updateUserRole
);

router.delete(
  '/:id',
  validate({ params: userIdParamSchema }),
  userController.deleteUser
);

export default router;

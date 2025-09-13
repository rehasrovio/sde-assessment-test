import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { validateCreateUser, validateUpdateUser, validateUserId } from '../middlewares/validation';

const router = Router();
const userController = new UserController();

// User routes with validation middleware
router.get('/', userController.getAllUsers);
router.get('/:id', validateUserId, userController.getUserById);
router.post('/', validateCreateUser, userController.createUser);
router.put('/:id', validateUserId, validateUpdateUser, userController.updateUser);
router.delete('/:id', validateUserId, userController.deleteUser);

export default router;

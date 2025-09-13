import { Router } from "express";
import { UserController } from "../controllers/UserController";
import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
} from "../middlewares/userValidation";

const router = Router();
const userController = new UserController();

//GET /api/users  - get all users
router.get("/", userController.getAllUsers);

//GET /api/users/:id - get user by id
router.get("/:id", validateUserId, userController.getUserById);

//POST /api/users - create user
router.post("/", validateCreateUser, userController.createUser);

//PUT /api/users/:id - update user
router.put(
  "/:id",
  validateUserId,
  validateUpdateUser,
  userController.updateUser
);

//DELETE /api/users/:id - delete user
router.delete("/:id", validateUserId, userController.deleteUser);

export default router;

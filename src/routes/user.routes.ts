import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middleware/validation.middleware';
import { followUserSchema } from '../validations/user.validation';

const userRouter = Router();
const userController = new UserController();

// User routes
userRouter.get('/:id', userController.getUserById.bind(userController));
userRouter.get('/:id/followers', userController.getFollowers.bind(userController));
userRouter.post('/:id/follow', validate(followUserSchema), userController.followUser.bind(userController));
userRouter.delete('/:id/follow', validate(followUserSchema), userController.unfollowUser.bind(userController));

export { userRouter };

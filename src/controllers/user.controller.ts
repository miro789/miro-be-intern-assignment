import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { createApiResponse } from '../types/response';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public async createUser(req: Request, res: Response): Promise<Response> {
        try {
            const userData = req.body;
            const user = await this.userService.createUser(userData);
            return res.status(201).json(createApiResponse(
                [user],
                10,
                0,
                1
            ));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create user';
            return res.status(400).json(createApiResponse(
                [],
                10,
                0,
                0,
                message,
                400
            ));
        }
    }

    public async getAllUsers(req: Request, res: Response): Promise<Response> {
        try {
            const limit = Number(req.query.limit) || 10;
            const offset = Number(req.query.offset) || 0;
            
            const [users, total] = await this.userService.getAllUsers({ limit, offset });
            
            return res.json(createApiResponse(
                users,
                limit,
                offset,
                total
            ));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch users';
            return res.status(500).json(createApiResponse(
                [],
                10,
                0,
                0,
                message,
                500
            ));
        }
    }

    public async getUserById(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const user = await this.userService.getUserById(id);
            
            if (!user) {
                return res.status(404).json(createApiResponse(
                    [],
                    10,
                    0,
                    0,
                    'User not found',
                    404
                ));
            }

            return res.json(createApiResponse(
                [user],
                10,
                0,
                1
            ));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch user';
            return res.status(500).json(createApiResponse(
                [],
                10,
                0,
                0,
                message,
                500
            ));
        }
    }

    public async updateUser(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json(createApiResponse(
                    [],
                    10,
                    0,
                    0,
                    'Invalid user ID',
                    400
                ));
            }

            const userData = req.body;
            const updatedUser = await this.userService.updateUser(id, userData);
            
            return res.json(createApiResponse(
                [updatedUser],
                10,
                0,
                1
            ));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update user';
            return res.status(404).json(createApiResponse(
                [],
                10,
                0,
                0,
                message,
                404
            ));
        }
    }

    public async deleteUser(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            await this.userService.deleteUser(id);
            return res.status(204).send();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete user';
            return res.status(404).json(createApiResponse(
                [],
                10,
                0,
                0,
                message,
                404
            ));
        }
    }

    public async followUser(req: Request, res: Response) {
        try {
            const followingId = Number(req.params.id);
            const { followerId } = req.body;
            
            await this.userService.followUser(followerId, followingId);
            
            return res.status(200).json(createApiResponse(
                [],
                10,
                0,
                0,
                'Successfully followed user'
            ));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            return res.status(500).json(createApiResponse(
                [],
                10,
                0,
                0,
                message
            ));
        }
    }

    public async getFollowers(req: Request, res: Response) {
        try {
            const userId = Number(req.params.id);
            const limit = Number(req.query.limit) || 10;
            const offset = Number(req.query.offset) || 0;

            const [followers, total] = await this.userService.getFollowers(userId, { limit, offset });

            return res.status(200).json(createApiResponse(
                followers,
                limit,
                offset,
                total,
                total === 0 ? 'No followers found' : undefined
            ));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            return res.status(500).json(createApiResponse(
                [],
                10,
                0,
                0,
                message,
                500
            ));
        }
    }

    public async unfollowUser(req: Request, res: Response) {
        try {
            const followingId = Number(req.params.id);
            const { followerId } = req.body;
            
            await this.userService.unfollowUser(followerId, followingId);
            
            return res.status(200).json(createApiResponse(
                [],
                10,
                0,
                0,
                'Successfully unfollowed user'
            ));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            return res.status(500).json(createApiResponse(
                [],
                10,
                0,
                0,
                message,
                500
            ));
        }
    }
}

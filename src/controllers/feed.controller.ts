import { Request, Response } from 'express';
import { FeedService } from '../services/feed.service';
import { createApiResponse } from '../types/response';

export class FeedController {
    private feedService: FeedService;

    constructor() {
        this.feedService = new FeedService();
    }

    async getUserFeed(req: Request, res: Response) {
        try {
            const userId = parseInt(req.query.userId as string);
            
            if (isNaN(userId)) {
                return res.status(400).json(createApiResponse(
                    [],
                    10,
                    0,
                    0,
                    'Invalid userId parameter',
                    400
                ));
            }

            const limit = parseInt(req.query.limit as string) || 10;
            const offset = parseInt(req.query.offset as string) || 0;

            const { items, total, message } = await this.feedService.getUserFeed(userId, { limit, offset });
            
            return res.json(createApiResponse(
                items,
                limit,
                offset,
                total,
                message
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

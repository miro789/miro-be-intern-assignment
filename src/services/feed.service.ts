import { AppDataSource } from '../data-source';
import { Post } from '../entities/Post';
import { User } from '../entities/User';
import { UserFollow } from '../entities/UserFollow';
import { PaginatedResponse, PaginationParams } from '../types/pagination';
import { PostStatus } from '../entities/Post';

export class FeedService {
    private postRepository = AppDataSource.getRepository(Post);
    private userRepository = AppDataSource.getRepository(User);
    private userFollowRepository = AppDataSource.getRepository(UserFollow);

    async getUserFeed(userId: number, { limit = 10, offset = 0 }: PaginationParams): Promise<PaginatedResponse<Post>> {
        // First check if user exists
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            return {
                items: [],
                total: 0,
                limit,
                offset,
                message: `User with ID ${userId} not found`
            };
        }

        // Check if user has any followers
        const followCount = await this.userFollowRepository.count({
            where: {
                follower: { id: userId }  // Changed from followerId to follower
            }
        });
        
        if (followCount === 0) {
            return {
                items: [],
                total: 0,
                limit,
                offset,
                message: "User is not following anyone"
            };
        }

        const [posts, total] = await this.postRepository
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.author', 'author')
            .leftJoinAndSelect('post.hashtags', 'hashtags')
            .leftJoinAndSelect('post.likes', 'likes')
            .leftJoinAndSelect('likes.user', 'likeUser')
            .innerJoin(UserFollow, 'userFollow', 'userFollow.followingId = post.authorId')
            .where('userFollow.followerId = :userId', { userId })
            .andWhere('post.status = :status', { status: PostStatus.PUBLISHED })
            .orderBy('post.createdAt', 'DESC')
            .take(limit)
            .skip(offset)
            .getManyAndCount();

        return {
            items: posts,
            total,
            limit,
            offset,
            message: total === 0 ? "No posts found from followed users" : undefined
        };
    }
}

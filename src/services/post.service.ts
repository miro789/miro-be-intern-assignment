import { AppDataSource } from '../data-source';
import { Post, PostStatus } from '../entities/Post';
import { User } from '../entities/User';
import { PostLike } from '../entities/PostLike';
import { Hashtag } from '../entities/Hashtag';
import { PaginatedResponse, PaginationParams } from '../types/pagination';
import { Repository } from 'typeorm';

export class PostService {
    private postRepository: Repository<Post>;
    private userRepository: Repository<User>;
    private postLikeRepository: Repository<PostLike>;
    private hashtagRepository: Repository<Hashtag>;

    constructor() {
        this.postRepository = AppDataSource.getRepository(Post);
        this.userRepository = AppDataSource.getRepository(User);
        this.postLikeRepository = AppDataSource.getRepository(PostLike);
        this.hashtagRepository = AppDataSource.getRepository(Hashtag);
    }

    async createPost(authorId: number, content: string, hashtags: string[] = []): Promise<Post> {
        const author = await this.userRepository.findOneBy({ id: authorId });
        if (!author) {
            throw new Error('Author not found');
        }

        const hashtagEntities = await Promise.all(
            hashtags.map(async (tag) => {
                const normalizedTag = tag.toLowerCase().replace(/^#/, '');
                let hashtag = await this.hashtagRepository.findOneBy({ name: normalizedTag });
                if (!hashtag) {
                    hashtag = this.hashtagRepository.create({ name: normalizedTag });
                    await this.hashtagRepository.save(hashtag);
                }
                return hashtag;
            })
        );

        const post = this.postRepository.create({
            content,
            author,
            hashtags: hashtagEntities,
            status: PostStatus.PUBLISHED
        });

        return this.postRepository.save(post);
    }

    async getPost(postId: number): Promise<Post> {
        const post = await this.postRepository.findOne({
            where: { 
                id: postId,
                status: PostStatus.PUBLISHED 
            },
            relations: ['author', 'hashtags', 'likes', 'likes.user']
        });

        if (!post) {
            throw new Error('Post not found');
        }

        return post;
    }

    async getPosts({ limit = 10, offset = 0 }: PaginationParams): Promise<PaginatedResponse<Post>> {
        const [posts, total] = await this.postRepository.findAndCount({
            where: { status: PostStatus.PUBLISHED },
            relations: ['author', 'hashtags', 'likes', 'likes.user'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset
        });

        return {
            items: posts,
            total,
            limit,
            offset
        };
    }

    async updatePost(postId: number, content: string): Promise<Post> {
        const post = await this.getPost(postId);
        
        if (!post) {
            throw new Error('Post not found');
        }

        post.content = content;
        return this.postRepository.save(post);
    }

    async deletePost(postId: number): Promise<void> {
        const post = await this.getPost(postId);
        
        if (!post) {
            throw new Error('Post not found');
        }

        // Soft delete by updating status
        post.status = PostStatus.DELETED;
        await this.postRepository.save(post);
    }

    async likePost(userId: number, postId: number): Promise<PostLike> {
        const [user, post] = await Promise.all([
            this.userRepository.findOneBy({ id: userId }),
            this.getPost(postId)
        ]);

        if (!user) {
            throw new Error('User not found');
        }

        if (!post) {
            throw new Error('Post not found');
        }

        const existingLike = await this.postLikeRepository.findOneBy({
            user: { id: userId },
            post: { id: postId }
        });

        if (existingLike) {
            throw new Error('Post already liked');
        }

        const like = this.postLikeRepository.create({ user, post });
        return this.postLikeRepository.save(like);
    }

    async unlikePost(userId: number, postId: number): Promise<void> {
        const existingLike = await this.postLikeRepository.findOne({
            where: {
                user: { id: userId },
                post: { id: postId }
            }
        });

        if (!existingLike) {
            throw new Error('Like not found');
        }

        await this.postLikeRepository.remove(existingLike);
    }

    async getPostsByAuthor(authorId: number, { limit = 10, offset = 0 }: PaginationParams): Promise<PaginatedResponse<Post>> {
        const [posts, total] = await this.postRepository.findAndCount({
            where: { 
                author: { id: authorId },
                status: PostStatus.PUBLISHED 
            },
            relations: ['author', 'hashtags', 'likes', 'likes.user'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset
        });

        return {
            items: posts,
            total,
            limit,
            offset
        };
    }

    async getLikedPosts(userId: number, { limit = 10, offset = 0 }: PaginationParams): Promise<PaginatedResponse<Post>> {
        const [posts, total] = await this.postRepository
            .createQueryBuilder('post')
            .innerJoin('post.likes', 'likes', 'likes.userId = :userId', { userId })
            .leftJoinAndSelect('post.author', 'author')
            .leftJoinAndSelect('post.hashtags', 'hashtags')
            .leftJoinAndSelect('post.likes', 'allLikes')
            .leftJoinAndSelect('allLikes.user', 'likeUser')
            .where('post.status = :status', { status: PostStatus.PUBLISHED })
            .orderBy('post.createdAt', 'DESC')
            .take(limit)
            .skip(offset)
            .getManyAndCount();

        return {
            items: posts,
            total,
            limit,
            offset
        };
    }
}

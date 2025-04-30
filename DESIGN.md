# System Design Documentation

## Architecture Overview

### Tech Stack
- Backend: Node.js with Express
- Language: TypeScript
- Database: SQLite with TypeORM
- Validation: Joi
- Testing: Shell Script-based integration tests

### Project Structure
```
src/
├── entities/        # TypeORM entities
├── routes/         # Express routes
├── services/       # Business logic
├── middleware/     # Express middleware
├── validations/    # Joi validation schemas
├── migrations/     # TypeORM migrations
└── types/         # TypeScript type definitions
```

## Database Schema Design

### Core Entities

1. **User**
   - Primary key: `id`
   - Fields:
     - `firstName` (string)
     - `lastName` (string)
     - `email` (string, unique)
     - `createdAt` (datetime)
     - `updatedAt` (datetime)
   - Relationships:
     - One-to-Many with Posts (as author)
     - Many-to-Many with Users (self-referential for follows)
     - One-to-Many with PostLikes

2. **Post**
   - Primary key: `id`
   - Fields:
     - `content` (text)
     - `status` (enum: DRAFT, PUBLISHED, ARCHIVED, DELETED)
     - `createdAt` (datetime)
     - `updatedAt` (datetime)
   - Relationships:
     - Many-to-One with User (author)
     - Many-to-Many with Hashtags
     - One-to-Many with PostLikes

3. **Hashtag**
   - Primary key: `id`
   - Fields:
     - `name` (string, unique)
     - `createdAt` (datetime)
     - `updatedAt` (datetime)
   - Relationships:
     - Many-to-Many with Posts

4. **PostLike**
   - Primary key: `id`
   - Fields:
     - `createdAt` (datetime)
     - `updatedAt` (datetime)
   - Relationships:
     - Many-to-One with User
     - Many-to-One with Post
   - Constraints:
     - Unique composite constraint on (userId, postId)

5. **UserFollow**
   - Primary key: `id`
   - Fields:
     - `createdAt` (datetime)
     - `updatedAt` (datetime)
   - Relationships:
     - Many-to-One with User (follower)
     - Many-to-One with User (following)
   - Constraints:
     - Unique composite constraint on (followerId, followingId)

## API Design

### RESTful Endpoints

1. **User Management**
   ```
   POST   /api/users              # Create user
   GET    /api/users              # List users
   GET    /api/users/:id          # Get user details
   PUT    /api/users/:id          # Update user
   DELETE /api/users/:id          # Delete user
   POST   /api/users/:id/follow   # Follow user
   DELETE /api/users/:id/follow   # Unfollow user
   GET    /api/users/:id/followers # Get user followers
   GET    /api/users/:id/activity # Get user activity
   ```

2. **Post Management**
   ```
   POST   /api/posts              # Create post
   GET    /api/posts              # List posts
   GET    /api/posts/:id          # Get post details
   PUT    /api/posts/:id          # Update post
   DELETE /api/posts/:id          # Delete post
   POST   /api/posts/:id/like     # Like post
   DELETE /api/posts/:id/like     # Unlike post
   GET    /api/posts/hashtag/:tag # Get posts by hashtag
   ```

3. **Feed Management**
   ```
   GET    /api/feed               # Get user feed
   ```

### Request/Response Format

1. **Pagination**
   ```typescript
   interface PaginationParams {
       limit: number;   // Default: 10, Max: 100
       offset: number;  // Default: 0
   }
   ```

2. **Activity Filtering**
   ```typescript
   enum ActivityType {
       POST = 'post',
       LIKE = 'like',
       FOLLOW = 'follow'
   }
   ```

## Implementation Details

### Data Access Layer
- Using TypeORM Repository pattern
- Eager loading relationships to prevent N+1 queries
- Transaction support for complex operations

### Validation Layer
- Joi schemas for request validation
- Custom validation middleware
- Strong typing with TypeScript

### Error Handling
- Centralized error handling middleware
- Consistent error response format
- HTTP status codes mapping

## Performance Optimizations

### Database Indexes

1. **Posts Table**
   ```sql
   CREATE INDEX "IDX_posts_created_at" ON "posts" ("createdAt");
   CREATE INDEX "IDX_posts_author_status" ON "posts" ("authorId", "status");
   ```

2. **Hashtags Table**
   ```sql
   CREATE INDEX "IDX_hashtags_name_search" ON "hashtags" ("name");
   ```

3. **PostLikes Table**
   ```sql
   CREATE UNIQUE INDEX "IDX_post_likes_user_post" ON "post_likes" ("userId", "postId");
   ```

### Query Optimization
- Pagination on all list endpoints
- Efficient joins using TypeORM relations
- Composite indexes for common query patterns

## Security Considerations

1. **Input Validation**
   - Strict request validation using Joi
   - SQL injection prevention via TypeORM
   - XSS protection through content sanitization

2. **Rate Limiting**
   - Per-user and per-IP rate limits
   - Graduated rate limits based on endpoint

3. **Data Protection**
   - Input sanitization
   - Parameter validation
   - Error message security

## Testing Strategy

1. **Integration Tests**
   - Shell script-based test suite
   - Coverage for all CRUD operations
   - Edge case testing

2. **Test Categories**
   - User operations
   - Post management
   - Feed functionality
   - Hashtag operations
   - Follow/unfollow mechanics

## Future Improvements

1. **Authentication & Security**
   - Implement JWT-based authentication using numeric user IDs
   - Add route protection for user-specific operations
   - Implement rate limiting for social actions

2. **Performance Optimizations**
   - Add Redis caching for frequently accessed data
   - Optimize database queries and indexes
   - Implement connection pooling

3. **API Enhancements**

   - Standardize response format
   - Improve error handling
   - Add comprehensive input validation

4. **Code Quality & Best Practices**
   - Add route parameter validation
     ```typescript
     // Example validation middleware
     const validateUUID = (req, res, next) => {
         const { id } = req.params;
         if (!isValidUUID(id)) {
             return res.status(400).json({
                 status: 400,
                 message: 'Invalid UUID format'
             });
         }
         next();
     };
     ```
   - Implement comprehensive error handling:
     ```typescript
     app.use((err, req, res, next) => {
         logger.error(err);
         res.status(err.status || 500).json({
             status: err.status || 500,
             message: err.message,
             timestamp: new Date().toISOString()
         });
     });
     ```
   - Add OpenAPI/Swagger documentation
     ```yaml
     /api/users/{id}:
       get:
         responses:
           200:
             description: Success
           404:
             description: User not found
           401:
             description: Unauthorized
     ```

5. **Performance**
   - Redis caching for frequently accessed data
   - Query optimization for large datasets
   - Connection pooling
   - Implement response compression

6. **Scalability**
   - Horizontal scaling preparation
   - Load balancing consideration
   - Database sharding strategy
   - Message queue implementation for async operations

7. **Monitoring & Logging**
   - Add structured logging
   - Implement performance monitoring
   - Add health check endpoints
   - Set up error tracking

8. **Features**
   - Real-time notifications using WebSocket
   - Advanced search capabilities
   - Media content support
   - User activity analytics
   - Content moderation system

9. **Testing Improvements**
   - Add unit tests for services
   - Implement E2E testing
   - Add performance testing
   - Implement CI/CD pipeline
   ```typescript
   describe('Authentication', () => {
       it('should validate JWT token', async () => {
           // Test implementation
       });
   });
   ```

10. **Documentation**
    - Add detailed API documentation
    - Include response codes for each endpoint
    - Document rate limiting rules
    - Add setup guide for local development


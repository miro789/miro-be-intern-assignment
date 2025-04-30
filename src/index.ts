import express from 'express';
import { userRouter } from './routes/user.routes';
import { postRouter } from './routes/post.routes';
import { feedRouter } from './routes/feed.routes';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';

const app = express();

// Middleware
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/feed', feedRouter);

// Error handling middleware should be last
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

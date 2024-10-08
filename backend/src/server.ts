import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRoutes from './routes/tasks';
import { errorHandler } from './middleware/errorHandler';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger';
import { swaggerUi, specs } from './utils/swagger';
import authMiddleware from './middleware/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiter to all requests
app.use(limiter);

// app.use(authMiddleware);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api/tasks',authMiddleware, taskRoutes);
app.use(errorHandler);

export { app };

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI as string, {
    retryWrites: false,
  })
    .then(() => {
      logger.info('Connected to Cosmos DB');
      app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      logger.error('Cosmos DB connection error:', error);
    });
}
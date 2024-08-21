import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';
import { NotFoundError } from '../utils/customErrors';
import logger from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);

  if (Array.isArray(err) && err[0] && typeof err[0].validate === 'function') {
    return res.status(400).json({ message: 'Validation Error', errors: err });
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  if (err.statusCode === 429) {
    return res.status(429).json({ message: 'Too many requests, please try again later.' });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ message: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal Server Error';

  res.status(statusCode).json({ message });
};
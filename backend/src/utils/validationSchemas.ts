import { body, param } from 'express-validator';

export const taskValidationSchemas = {
  createTask: [
    body('title').notEmpty().withMessage('Title is required').trim().escape(),
    body('description').optional().trim().escape(),
    body('status').notEmpty().withMessage('Status is required').isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  ],
  updateTask: [
    param('id').isMongoId().withMessage('Invalid task ID'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty').trim().escape(),
    body('description').optional().trim().escape(),
    body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  ],
  getTask: [
    param('id').isMongoId().withMessage('Invalid task ID'),
  ],
  deleteTask: [
    param('id').isMongoId().withMessage('Invalid task ID'),
  ],
};

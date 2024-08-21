import express, { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import Task from '../models/Task';

const router = express.Router();

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all tasks
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Create a new task
router.post(
  '/',
  [
    body('title').notEmpty().trim().escape(),
    body('description').optional().trim().escape(),
    body('status').notEmpty().isIn(['todo', 'in-progress', 'done']),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, status } = req.body;
      const newTask = new Task({ title, description, status });
      await newTask.save();
      res.status(201).json(newTask);
    } catch (error) {
      next(error);
    }
  }
);

// Get a specific task
router.get(
  '/:id',
  [param('id').isMongoId()],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      next(error);
    }
  }
);

// Update a task
router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('title').optional().notEmpty().trim().escape(),
    body('description').optional().trim().escape(),
    body('status').optional().isIn(['todo', 'in-progress', 'done']),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, status } = req.body;
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        { title, description, status },
        { new: true, runValidators: true }
      );
      if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(updatedTask);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a task
router.delete(
  '/:id',
  [param('id').isMongoId()],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedTask = await Task.findByIdAndDelete(req.params.id);
      if (!deletedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
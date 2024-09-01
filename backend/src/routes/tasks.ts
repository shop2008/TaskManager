import express, { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { NotFoundError, ValidationError } from '../utils/customErrors';
import Task from '../models/Task';
import { taskValidationSchemas } from '../utils/validationSchemas';
import logger from '../utils/logger';

const router = express.Router();

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: any) => `${error.path}: ${error.msg}`);
    throw new ValidationError(errorMessages.join(', '));
  }
  next();
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the task
 *         title:
 *           type: string
 *           description: The title of the task
 *         description:
 *           type: string
 *           description: The description of the task
 *         status:
 *           type: string
 *           description: The status of the task
 *           enum: [todo, in-progress, done]
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Returns the list of all tasks
 *     responses:
 *       200:
 *         description: The list of the tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).auth.sub; // Get the user ID from the token
    const tasks = await Task.find({ userId }); // Filter tasks by user ID
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: The task was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  taskValidationSchemas.createTask,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, status } = req.body;
      logger.info(`Auth object: ${JSON.stringify((req as any).auth)}`);
      const userId = (req as any).auth?.sub;
      if (!userId) {
        logger.error('User ID not found in token');
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const newTask = new Task({ userId, title, description, status });
      await newTask.save();
      logger.info(`New task created: ${newTask._id}`);
      res.status(201).json(newTask);
    } catch (error) {
      logger.error(`Error creating task: ${error}`);
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The task id
 *     responses:
 *       200:
 *         description: The task description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: The task was not found
 */
router.get(
  '/:id',
  taskValidationSchemas.getTask,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        throw new NotFoundError('Task not found');
      }
      res.json(task);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The task id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: The task was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: The task was not found
 *       400:
 *         description: Validation error
 */
router.put(
  '/:id',
  [...taskValidationSchemas.getTask, ...taskValidationSchemas.updateTask],
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
        throw new NotFoundError('Task not found');
      }
      res.json(updatedTask);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The task id
 *     responses:
 *       200:
 *         description: The task was deleted
 *       404:
 *         description: The task was not found
 */
router.delete(
  '/:id',
  [...taskValidationSchemas.getTask, ...taskValidationSchemas.deleteTask],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedTask = await Task.findByIdAndDelete(req.params.id);
      if (!deletedTask) {
        throw new NotFoundError('Task not found');
      }
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
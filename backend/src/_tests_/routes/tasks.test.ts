import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import taskRoutes from '../../routes/tasks';
import { errorHandler } from '../../middleware/errorHandler';
import Task from '../../models/Task';

let app: express.Application;
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  app = express();
  app.use(express.json());
  app.use('/api/tasks', taskRoutes);
  app.use(errorHandler);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Task Routes', () => {
  beforeEach(async () => {
    await Task.deleteMany({});
  });

  it('should create a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Test Task',
        description: 'This is a test task',
        status: 'todo',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Task');
    expect(res.body.description).toBe('This is a test task');
    expect(res.body.status).toBe('todo');
  });

  it('should get all tasks', async () => {
    await Task.create({
      title: 'Task 1',
      description: 'Description 1',
      status: 'todo',
    });
    await Task.create({
      title: 'Task 2',
      description: 'Description 2',
      status: 'in-progress',
    });

    const res = await request(app).get('/api/tasks');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('should get a specific task', async () => {
    const task = await Task.create({
      title: 'Test Task',
      description: 'This is a test task',
      status: 'todo',
    });

    const res = await request(app).get(`/api/tasks/${task._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Test Task');
  });

  it('should update a task', async () => {
    const task = await Task.create({
      title: 'Test Task',
      description: 'This is a test task',
      status: 'todo',
    });

    const res = await request(app)
      .put(`/api/tasks/${task._id}`)
      .send({
        title: 'Updated Task',
        status: 'in-progress',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Task');
    expect(res.body.status).toBe('in-progress');
  });

  it('should delete a task', async () => {
    const task = await Task.create({
      title: 'Test Task',
      description: 'This is a test task',
      status: 'todo',
    });

    const res = await request(app).delete(`/api/tasks/${task._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Task deleted successfully');

    const deletedTask = await Task.findById(task._id);
    expect(deletedTask).toBeNull();
  });

  // it('should serve Swagger documentation', async () => {
  //   const res = await request(app).get('/api-docs/');
  //   expect(res.statusCode).toBe(200);
  // });
});
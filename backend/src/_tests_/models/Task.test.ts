import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Task from '../../models/Task';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Task Model', () => {
  it('should create a task successfully', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'todo',
    };
    const task = new Task(taskData);
    const savedTask = await task.save();
    
    expect(savedTask._id).toBeDefined();
    expect(savedTask.title).toBe(taskData.title);
    expect(savedTask.description).toBe(taskData.description);
    expect(savedTask.status).toBe(taskData.status);
  });

  it('should fail to create a task without required fields', async () => {
    const taskData = {};
    const task = new Task(taskData);
    let error;
    try {
      await task.save();
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
  });
});
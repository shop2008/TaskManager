import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  userId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
}

const TaskSchema: Schema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
});

export default mongoose.model<ITask>('Task', TaskSchema);
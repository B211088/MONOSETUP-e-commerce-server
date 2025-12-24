import mongoose from 'mongoose';
import { MONGO_URI } from './configs/index.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Database connected successfully ^_^');
    } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};


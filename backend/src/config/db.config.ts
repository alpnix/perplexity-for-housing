import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || '';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1);
  }
};

export const closeDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB Atlas');
};

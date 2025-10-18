import { config } from 'dotenv';
config()

export const AppConfig = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || '',
  MONGO_URI: process.env.MONGO_URI || '',
};

export const isProduction = AppConfig.NODE_ENV === 'production';

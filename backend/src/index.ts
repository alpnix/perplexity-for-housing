
import createApp from './app';
import { AppConfig, connectDB } from './config/index';

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const app = createApp();

    app.listen(AppConfig.PORT, () => {
      console.log(`Server running in ${AppConfig.NODE_ENV} mode on port ${AppConfig.PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();

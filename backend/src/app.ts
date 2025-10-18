import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJson from '../swagger.json';
import apis from "./routes"
import { corsOptions } from './config/cors.config';

const createApp = (): Application => {
  const app = express();

  // CORS configuration
  app.use(cors(corsOptions));

  // Increase body limits to handle base64 images
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJson))
  app.use('/', apis)
  app.get('/health', (req, res) => {
    res.status(200).send('API is running');
  });

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return app;
};

export default createApp;

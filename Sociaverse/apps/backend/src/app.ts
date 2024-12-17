import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import connectDB from './config/database';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);

app.listen(port, () => {
  console.log(`⚡️[server]: Server running at http://localhost:${port}`);
});
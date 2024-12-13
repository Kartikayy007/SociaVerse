import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/auth';
import connectDB from './config/database';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/v1', routes);

app.listen(port, () => {
  console.log(`⚡️[server]: Server running at http://localhost:${port}`);
});
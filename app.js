import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import peaksRouter from './src/routes/peaks.js';
import saddlesRouter from './src/routes/saddles.js';
import userRouter from './src/routes/users.js';
import photosRouter from './src/routes/photos.js';
import { LOCAL_URL, PROD_URL } from './config.js';
import { setProblemJsonHeader } from './src/middlewares/jsonProblem.js';

const app = express();
const allowedOrigins = [PROD_URL, LOCAL_URL];
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(setProblemJsonHeader);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.options('*', cors(corsOptions));

app.use('/api/peaks', peaksRouter);
app.use('/api/saddles', saddlesRouter);
app.use('/api/users', userRouter);
app.use('/api/photos', photosRouter);

const mongoUri = process.env.MONGO_URI ? process.env.MONGO_URI : 'mongodb://localhost:27017/trails';

mongoose
  .connect(mongoUri)
  .then(() => console.log('Connected to database'))
  .catch((err) => console.error('Error occurred when connecting to db', err));

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

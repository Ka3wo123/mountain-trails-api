import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import peaksRouter from './endpoints/peaksRoutes.js';
import saddlesRouter from './endpoints/saddlesRoutes.js';
import userRouter from './endpoints/userRoutes.js';
import photosRouter from './endpoints/photosRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.use('/api/peaks', peaksRouter);
app.use('/api/saddles', saddlesRouter);
app.use('/api/users', userRouter);
app.use('/api/photos', photosRouter);

const mongoUri = process.env.MONGO_URI ? process.env.MONGO_URI : 'mongodb://localhost:27017/trails';

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to database'))
  .catch(err => console.error('Error occurred', err));

if (process.env.NODE_ENV !== 'production') {  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import peaksRouter from './endpoints/peaks.js';
import saddlesRouter from './endpoints/saddles.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.use('/peaks', peaksRouter);
app.use('/saddles', saddlesRouter);

const mongoUri = process.env.MONGO_URI ? process.env.MONGO_URI : 'mongodb://localhost:27017/trails';

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to database'))
  .catch(err => console.error('Error occurred', err));

export default app;
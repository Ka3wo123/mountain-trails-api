  import express from 'express';
  import mongoose from 'mongoose';
  import Peak from './models/peak.js';
  import cors from 'cors';
  import Saddle from './models/saddle.js';
  import morgan from 'morgan';

  const app = express();
  app.use(cors());
  app.use(morgan('dev'));
  const mongoURI = 'mongodb://localhost:27017/trails';


  mongoose.connect(mongoURI)
    .then(() => console.log('Connected to database'))
    .catch(err => console.error('Error occurred', err));

    app.get('/peaks', async (req, res) => {
      const { lat1, lon1, lat2, lon2, search} = req.query;
    
    
      const lat1Float = parseFloat(lat1);
      const lon1Float = parseFloat(lon1);
      const lat2Float = parseFloat(lat2);
      const lon2Float = parseFloat(lon2);
    
      try {
        if (search) {
          const regex = new RegExp(search, 'i');
          const data = await Peak.find({
            'tags.name': { $regex: regex }
          });        
          res.json({ data });
          return;
        }

        const data = await Peak.find({
          lat: { $gte: Math.min(lat1Float, lat2Float), $lte: Math.max(lat1Float, lat2Float) },
          lon: { $gte: Math.min(lon1Float, lon2Float), $lte: Math.max(lon1Float, lon2Float) }
        });
        
        res.json({ data });
      } catch (error) {
        console.error('Error fetching peaks:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

  app.get('/saddles', async (req, res) => {
    const { lat1, lon1, lat2, lon2 } = req.query;

    const lat1Float = parseFloat(lat1);
    const lon1Float = parseFloat(lon1);
    const lat2Float = parseFloat(lat2);
    const lon2Float = parseFloat(lon2);

    try {
      const data = await Saddle.find({
        lat: { $gte: Math.min(lat1Float, lat2Float), $lte: Math.max(lat1Float, lat2Float) },
        lon: { $gte: Math.min(lon1Float, lon2Float), $lte: Math.max(lon1Float, lon2Float) }
      });

      res.json({ data });
    } catch (error) {
      console.error('Error fetching saddles:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  })

  app.listen(5000, () => console.log('Server running on port 5000'));

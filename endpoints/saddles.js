import express from 'express';
import Saddle from './models/saddle.js';

const router = express.Router();

router.get('/', async (req, res) => {
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
  });

  export default router;
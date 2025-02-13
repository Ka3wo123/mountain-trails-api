import express from 'express';
import Peak from './models/peak.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { lat1, lon1, lat2, lon2, search } = req.query;

  const lat1Float = parseFloat(lat1);
  const lon1Float = parseFloat(lon1);
  const lat2Float = parseFloat(lat2);
  const lon2Float = parseFloat(lon2);

  try {
    let data;
    if (search) {
      const regex = new RegExp(search, 'i');
      data = await Peak.find({
        'tags.name': { $regex: regex }
      });
      res.json({ data });
      return;
    }

    data = await Peak.find({
      lat: { $gte: Math.min(lat1Float, lat2Float), $lte: Math.max(lat1Float, lat2Float) },
      lon: { $gte: Math.min(lon1Float, lon2Float), $lte: Math.max(lon1Float, lon2Float) }
    });

    res.json({ data });
  } catch (error) {
    console.error('Error fetching peaks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/count', async (_, res) => {
  try {
    const total = await Peak.countDocuments();
    res.status(200).json({ total: total })
  } catch (error) {
    res.status(500).json('Internal server error');
  }

})

export default router;
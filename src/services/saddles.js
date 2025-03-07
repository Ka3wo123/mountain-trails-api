import Saddle from '../models/saddle.js';

export const findAll = async (params) => {
  const { lat1, lon1, lat2, lon2 } = params;
  const lat1Float = parseFloat(lat1);
  const lon1Float = parseFloat(lon1);
  const lat2Float = parseFloat(lat2);
  const lon2Float = parseFloat(lon2);

  try {
    const data = await Saddle.find({
      lat: {
        $gte: Math.min(lat1Float, lat2Float),
        $lte: Math.max(lat1Float, lat2Float),
      },
      lon: {
        $gte: Math.min(lon1Float, lon2Float),
        $lte: Math.max(lon1Float, lon2Float),
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

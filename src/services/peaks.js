import Peak from '../models/peak.js';

export const findAll = async (params) => {
  const { lat1, lon1, lat2, lon2, search, page = 1, limit = 10 } = params;

  const lat1Float = parseFloat(lat1);
  const lon1Float = parseFloat(lon1);
  const lat2Float = parseFloat(lat2);
  const lon2Float = parseFloat(lon2);

  try {
    let data;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (search) {
      const matchingCount = await Peak.countDocuments({
        'tags.name': { $regex: search, $options: 'i' },
      });

      data = await Peak.find({
        'tags.name': { $regex: search, $options: 'i' },
      })
        .skip(skip)
        .limit(parseInt(limit));
      return { data, total: matchingCount };
    }

    const total = await Peak.countDocuments({
      lat: {
        $gte: Math.min(lat1Float, lat2Float),
        $lte: Math.max(lat1Float, lat2Float),
      },
      lon: {
        $gte: Math.min(lon1Float, lon2Float),
        $lte: Math.max(lon1Float, lon2Float),
      },
    });

    data = await Peak.find({
      lat: {
        $gte: Math.min(lat1Float, lat2Float),
        $lte: Math.max(lat1Float, lat2Float),
      },
      lon: {
        $gte: Math.min(lon1Float, lon2Float),
        $lte: Math.max(lon1Float, lon2Float),
      },
    });

    return { data, total };
  } catch (error) {
    throw error;
  }
};

export const countPeaks = async () => {
  try {
    const total = await Peak.countDocuments();
    return total;
  } catch (error) {
    throw error;
  }
};

import { countPeaks, findAll } from '../services/peaks.js';
export const find = async (req, res) => {
  const params = req.query;
  try {
    const data = await findAll(params);
    res.status(200).json(data);
  } catch (error) {
    res.problem(error.status, error.name, error.message);
  }
};

export const count = async (_, res) => {
  try {
    const total = await countPeaks();
    res.status(200).json(total);
  } catch (error) {
    res.problem(error.status, error.name, error.message);
  }
};

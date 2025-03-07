import { findAll } from '../services/saddles.js';

export const find = async (req, res) => {
  const params = req.query;

  console.log(params);

  try {
    const data = await findAll(params);
    res.status(200).json(data);
  } catch (error) {
    res.problem(error.status, error.name, error.message);
  }
};

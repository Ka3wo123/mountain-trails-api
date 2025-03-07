import express from 'express';
import { find } from '../controllers/saddles.js';

const router = express.Router();

router.get('/', find);
export default router;

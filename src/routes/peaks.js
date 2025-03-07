import express from 'express';
import { count, find } from '../controllers/peaks.js';

const router = express.Router();

router.get('/', find);
router.get('/count', count);

export default router;

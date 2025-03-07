import express from 'express';
import {
  find,
  findOne,
  register,
  login,
  logout,
  getPeaks,
  addNewUserPeak,
  deletePeakForUser,
  refresh,
} from '../controllers/users.js';
import authenticateJWT from '../middlewares/jwt.js';

const router = express.Router();

router.get('/', find);
router.get('/:nick', findOne);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refresh);
router.get('/:nick/peaks', getPeaks);
router.post('/:nick/peaks', authenticateJWT, addNewUserPeak);
router.delete('/:nick/peaks', authenticateJWT, deletePeakForUser);

export default router;

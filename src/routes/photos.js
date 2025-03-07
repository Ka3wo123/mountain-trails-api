import { Router } from 'express';
import multer from 'multer';
import { uploadImage, deleteImage } from '../controllers/photos.js';
import authenticateJWT from '../middlewares/jwt.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', authenticateJWT, upload.single('image'), uploadImage);
router.delete('/delete', authenticateJWT, deleteImage);

export default router;

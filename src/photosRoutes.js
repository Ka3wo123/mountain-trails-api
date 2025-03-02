import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import User from './models/user.js';
import authenticateJWT from './middlewares/jwt.js';

const router = Router();

const cloudName = process.env.CLOUDINARY_NAME;
const cloudApiKey = process.env.CLOUDINARY_API_KEY;
const cloudApiSecret = process.env.CLOUDINARY_SECRET;
const allowedFormats = ['jpg', 'jpeg', 'png', 'webp'];

cloudinary.config({
  cloud_name: cloudName,
  api_key: cloudApiKey,
  api_secret: cloudApiSecret,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
});

router.post('/upload', authenticateJWT, upload.single('image'), async (req, res) => {
  const { folder, peakId, nick } = req.body;

  try {
    const user = await User.findOne({ nick: nick });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileSizeBytes = req.file.size;

    if (fileSizeBytes > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large (max 5MB)' });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            transformation: [
              {
                quality: 'auto',
              },
            ],
            folder,
            allowed_formats: allowedFormats,
            resource_type: 'image',
          },
          (error, uploadResult) => {
            return error ? reject(error) : resolve(uploadResult);
          }
        )
        .end(req.file.buffer);
    });

    const peakIndex = user.peaksAchieved.findIndex((p) => p.peakId.toString() === peakId);

    if (peakIndex === -1) {
      return res.status(404).json({ error: "Peak not found in user's achieved list" });
    }

    user.peaksAchieved[peakIndex].imgData.push({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });

    await user.save();

    res.status(200).json({ message: 'Image uploaded succesffully and added to user' });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.delete('/delete', authenticateJWT, async (req, res) => {
  const { nick, peakId, publicId } = req.body;

  try {
    const user = await User.findOne({ nick });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const peakIndex = user.peaksAchieved.findIndex((p) => p.peakId.toString() === peakId);
    if (peakIndex === -1) {
      return res.status(404).json({ error: "Peak not found in user's achieved list" });
    }

    const initialLength = user.peaksAchieved[peakIndex].imgData.length;
    user.peaksAchieved[peakIndex].imgData = user.peaksAchieved[peakIndex].imgData.filter(
      (img) => img.publicId !== publicId
    );

    if (user.peaksAchieved[peakIndex].imgData.length === initialLength) {
      return res.status(404).json({ error: 'Image with specified publicId not found' });
    }

    await user.save();

    const cloudResult = await cloudinary.uploader.destroy(publicId);
    if (cloudResult.result !== 'ok') {
      return res.status(400).json({ error: 'Failed to delete image from Cloudinary' });
    }

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;

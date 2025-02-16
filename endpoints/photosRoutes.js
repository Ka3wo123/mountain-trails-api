import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

const cloudName = process.env.CLOUDINARY_NAME;
const cloudApiKey = process.env.CLOUDINARY_API_KEY;
const cloudApiSecret = process.env.CLOUDINARY_SECRET;
const allowedFormats = ['jpg', 'jpeg', 'png'];

cloudinary.config({
    cloud_name: cloudName,
    api_key: cloudApiKey,
    api_secret: cloudApiSecret,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const folder = req.body.folder;
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder,
                    allowed_formats: allowedFormats,
                    resource_type: 'image'
                },
                (error, uploadResult) => {
                return error ? reject(error) : resolve(uploadResult);
            }).end(req.file.buffer);
        });

        const { api_key, ...response } = uploadResult;

        res.status(200).json({ uploadResult: response })
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

router.delete('/delete', async (req, res) => {
    const { publicId } = req.body;
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== 'ok') {
            return res.status(400).json(result);
        }
        res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

export default router;

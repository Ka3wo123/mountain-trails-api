import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from 'cloudinary';
import { CLOUDINARY_API_KEY, CLOUDINARY_NAME, CLOUDINARY_SECRET } from "../config.js";
import express from 'express';

const router = express.Router();

cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: "mountain-trails-photos",
    allowedFormats: ["jpg", "png"],
    transformation: [
        { if: "w_gt_1900", width: 1900, crop: "scale" },
        { if: "h_gt_1900", height: 1900, crop: "scale" },
        { quality: "auto" },
        { format: 'jpg' }
    ]
});


const parser = multer({ storage: storage });

router.post('/upload', parser.single('file'), (req, res) => {
    const imageUUID = req.file.public_id;
    res.json(imageUUID);
});

router.get('/upload', (req, res) => {    
    cloudinary.v2.uploader.upload('/home/ka3wo/Obrazy/integration.png', {asset_folder: 'mountain-trails-photos'}).then(result => console.log('success', JSON.stringify(result, null, 2)))
    res.json('ok');
});


export default router;
import { v2 as cloudinary } from 'cloudinary';
import UnsupportedFormatError from '../errors/unsupportedFileFormat.js';
import OversizeFileError from '../errors/oversized.js';
import NotFoundError from '../errors/notFound.js';
import User from '../models/user.js';

const cloudName = process.env.CLOUDINARY_NAME;
const cloudApiKey = process.env.CLOUDINARY_API_KEY;
const cloudApiSecret = process.env.CLOUDINARY_SECRET;
const allowedFormats = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

cloudinary.config({
  cloud_name: cloudName,
  api_key: cloudApiKey,
  api_secret: cloudApiSecret,
});

export const uploadImageToCloudinary = async (file, folder) => {
  const fileExt = file.originalname.split('.').pop().toLowerCase();
  if (!allowedFormats.includes(fileExt)) {
    throw new UnsupportedFormatError(this, { allowedFormats });
  }

  if (file.size > MAX_FILE_SIZE) {
    let tempSize = MAX_FILE_SIZE;
    let i = 0;
    let suffix;
    while (tempSize > 1024) {
      tempSize /= 1024;
      i++;
    }
    let calcFileSize = tempSize % 1024;

    switch (i) {
      case 1:
        suffix = 'kB';
        break;
      case 2:
        suffix = 'MB';
        break;
      case 3:
        suffix = 'GB';
        break;
      default:
        suffix = 'B';
    }
    throw new OversizeFileError(`File is too large. Max size: ${calcFileSize} ${suffix}`, {
      maxSize: `${calcFileSize} ${suffix}`,
    });
  }
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, allowed_formats: allowedFormats, resource_type: 'image' },
        (error, result) => (error ? reject(error) : resolve(result))
      )
      .end(file.buffer);
  });
};

export const addImageToUser = async (nick, peakId, uploadResult) => {
  const user = await User.findOne({ nick });
  const peakIndex = user.peaksAchieved.findIndex((p) => p.peakId.toString() === peakId);
  if (peakIndex === -1) throw new NotFoundError('Peak not found');

  user.peaksAchieved[peakIndex].imgData.push({
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  });

  await user.save();
};

export const deleteImageFromUser = async (nick, peakId, publicId) => {
  const user = await User.findOne({ nick });
  const peakIndex = user.peaksAchieved.findIndex((p) => p.peakId.toString() === peakId);
  if (peakIndex === -1) throw new NotFoundError("Peak not found in user's achieved list.");

  const initialLength = user.peaksAchieved[peakIndex].imgData.length;
  user.peaksAchieved[peakIndex].imgData = user.peaksAchieved[peakIndex].imgData.filter(
    (img) => img.publicId !== publicId
  );

  if (user.peaksAchieved[peakIndex].imgData.length === initialLength) {
    throw new NotFoundError('Image with specified publicId not found');
  }

  await user.save();
};

export const deleteImageFromCloudinary = async (publicId) => {
  const cloudResult = await cloudinary.uploader.destroy(publicId);
  if (cloudResult.result !== 'ok') {
    throw new Error('Failed to delete image from Cloudinary');
  }
};

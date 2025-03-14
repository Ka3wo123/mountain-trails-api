import {
  uploadImageToCloudinary,
  addImageToUser,
  deleteImageFromUser,
  deleteImageFromCloudinary,
} from '../services/photos.js';

export const uploadImage = async (req, res) => {
  const { folder, peakId, nick } = req.body;
  const file = req.file;
  try {
    const uploadResult = await uploadImageToCloudinary(file, folder);
    await addImageToUser(nick, peakId, uploadResult);
    return res.status(200).json({});
  } catch (error) {
    res.problem(error.status, error.name, error.message, req.originalUrl, error.extra);
  }
};

export const deleteImage = async (req, res) => {
  const { nick, peakId, publicId } = req.body;

  try {
    await deleteImageFromCloudinary(publicId);
    await deleteImageFromUser(nick, peakId, publicId);
    return res.status(200).json({});
  } catch (error) {
    res.problem(error.status, error.name, error.message, req.originalUrl);
  }
};

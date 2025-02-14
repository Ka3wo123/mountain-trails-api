import dotenv from 'dotenv';
import { dirname } from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: __dirname + '/.env' });

export const CLOUDINARY_URL = process.env.CLOUDINARY_URL || 'cloudinary-url';
export const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME || 'cloudinary-name';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'cloudinary-api-key';
export const CLOUDINARY_SECRET = process.env.CLOUDINARY_SECRET || 'cloudinary-secret';
export const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret';
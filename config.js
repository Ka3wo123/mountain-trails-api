import dotenv from 'dotenv';
import { dirname } from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: __dirname + '/.env' });

export const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret';
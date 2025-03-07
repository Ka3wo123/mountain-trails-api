import User from '../models/user.js';
import Peak from '../models/peak.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../../config.js';
import DuplicateError from '../errors/duplicate.js';
import NotFoundError from '../errors/notFound.js';
import BadCredentialsError from '../errors/badCredentials.js';
import UnauthorizedError from '../errors/unauthorized.js';

const jwtsecret = JWT_SECRET;
const jwtRefreshSecret = JWT_REFRESH_SECRET;
const EXPIRES_IN = '1m';
const REFRESH_EXPIRES_IN = '30d';

export const findAll = async (params) => {
  const { page, limit } = params;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  console.log(skip, page, limit)
  try {
    const users = await User.find().skip(skip).limit(parseInt(limit)); 
    const total = await User.countDocuments();
    return { data: toDto(users), total };
  } catch (error) {
    throw error;
  }
};

export const findOneByNick = async (nick) => {
  try {
    const user = await User.findOne({ nick });
    return toDto(user);
  } catch (error) {
    throw error;
  }
};

export const create = async (user) => {
  const { name, surname, nick, password } = user;
  const newUser = new User({ name, surname, nick, password });
  try {
    await newUser.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new DuplicateError('Nick already exists');
    }
    throw error;
  }
};

export const authenticate = async (credentials) => {
  const { nick, password } = credentials;
  try {
    const user = await User.findOne({ nick });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const doesMatch = await bcrypt.compare(password, user.password);
    if (!doesMatch) {
      throw new BadCredentialsError('Invalid credentials');
    }
    const token = jwt.sign({ userId: user._id, nick: user.nick }, jwtsecret, {
      expiresIn: EXPIRES_IN,
    });
    const refreshToken = jwt.sign({ userId: user._id, nick: user.nick }, jwtRefreshSecret, {
      expiresIn: REFRESH_EXPIRES_IN,
    });

    return { token, refreshToken, user };
  } catch (error) {
    throw error;
  }
};

export const getAccessToken = (refreshToken) => {
  if (!refreshToken) {
    throw new UnauthorizedError();
  }

  try {
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret);
    const newAccessToken = jwt.sign({ userId: decoded._id, nick: decoded.nick }, jwtsecret, {
      expiresIn: EXPIRES_IN,
    });
    return newAccessToken;
  } catch (error) {
    throw error;
  }
};

export const findUserPeaks = async (nick, params) => {
  const { page, limit } = params;

  try {
    const user = await User.findOne({ nick });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const peaksAchievedIds = user.peaksAchieved.map((peak) => peak.peakId);
    const peaks = await Peak.find({ _id: { $in: peaksAchievedIds } });

    const totalSystemPeaks = await Peak.countDocuments();

    const totalPeaks = peaks.length;
    const startIndex = (page - 1) * limit;
    const peaksOnPage = peaks.slice(startIndex, startIndex + parseInt(limit));

    const peakDtos = peaksOnPage.map((peak) => ({
      peakId: peak._id,
      name: peak.tags.name,
      ele: peak.tags.ele,
      lon: peak.lon,
      lat: peak.lat,
    }));

    return {
      peakDtos,
      totalSystemPeaks,
      totalPeaks,
      totalPages: Math.ceil(totalPeaks / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };
  } catch (error) {
    throw error;
  }
};

export const addPeakToUser = async (nick, params) => {
  const { peakId } = params;

  try {
    const user = await User.findOne({ nick });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const peak = await Peak.findById(peakId);
    if (!peak) {
      throw new NotFoundError('Peak not found');
    }

    const peakIds = user.peaksAchieved.map((p) => p.peakId.toString());

    if (peakIds.includes(peakId)) {
      throw new DuplicateError('Peak already achieved');
    }

    const peakToSave = {
      peakId: peakId,
    };

    const updateResult = await User.updateOne({ nick }, { $addToSet: { peaksAchieved: peakToSave } });

    await user.save();

    return updateResult;
  } catch (error) {
    throw error;
  }
};

export const deleteUserPeak = async (nick, params) => {
  const { peakId } = params;

  try {
    const user = await User.findOne({ nick });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const peakIdx = user.peaksAchieved.findIndex((p) => p.peakId.toString() === peakId);
    if (peakIdx === -1) {
      throw new NotFoundError('Peak not found');
    }
    user.peaksAchieved.splice(peakIdx, 1);
    await user.save();
  } catch (error) {
    throw error;
  }
};

const toDto = (input) => {
  if (Array.isArray(input)) {
    return input.map((u) => ({
      _id: u._id,
      name: u.name,
      surname: u.surname,
      nick: u.nick,
      peaksAchieved: u.peaksAchieved,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  } else {
    return {
      _id: input._id,
      name: input.name,
      surname: input.surname,
      nick: input.nick,
      peaksAchieved: input.peaksAchieved,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    };
  }
};

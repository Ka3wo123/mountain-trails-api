import express from 'express';
import User from './models/user.js';
import Peak from './models/peak.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config.js';
import authenticateJWT from './middlewares/jwt.js';

const router = express.Router();
const jwtsecret = JWT_SECRET;
const jwtRefreshSecret = JWT_REFRESH_SECRET;
const EXPIRES_IN = '1m';
const REFRESH_EXPIRES_IN = '30d';
const SAME_SITE = 'None';

router.get('/', async (_, res) => {
    try {
        const users = await User.find();
        const usersDto = toDto(users);

        res.status(200).json({ data: usersDto });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
});

router.get('/:nick', async (req, res) => {
    const { nick } = req.params;
    try {
        const user = await User.findOne({ nick });
        const userDto = toDto(user);

        res.status(200).json({ data: userDto });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
});

router.post('/register', async (req, res) => {
    const { name, surname, nick, password } = req.body;

    try {
        const newUser = new User({ name, surname, nick, password });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Duplicate nickname' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { nick, password } = req.body;

    try {
        const user = await findUserByNick(nick);
        if (!user) {
            return res.status(404).json({ error: 'User not found' + `${nick}` });
        }

        const doesMatch = await bcrypt.compare(password, user.password);
        if (!doesMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, nick: user.nick }, jwtsecret, { expiresIn: EXPIRES_IN });
        const refreshToken = jwt.sign({ userId: user._id, nick: user.nick }, jwtRefreshSecret, { expiresIn: REFRESH_EXPIRES_IN });

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: SAME_SITE });

        res.json({ message: 'Login successful', token, user: { nick: user.nick } });
    } catch (error) {
        console.error('Error register user', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/logout', async (_, res) => {
    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: SAME_SITE });
    res.json({ message: 'Logged out successfully' });
});

router.post('/refresh-token', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(refreshToken, jwtRefreshSecret);
        const newAccessToken = jwt.sign(
            { userId: decoded._id, nick: decoded.nick },
            jwtsecret,
            { expiresIn: EXPIRES_IN }
        )
        res.json({ accessToken: newAccessToken })
    } catch (error) {
        console.error('Error refreshing token', error);
        res.status(403).json({ error: 'Invalid refresh token' })
    }
})

router.get('/:nick/peaks', async (req, res) => {
    const { nick } = req.params;
    const { page = 1, limit = 2 } = req.query;

    try {
        const user = await findUserByNick(nick);

        if (!user) {
            return res.status(404).json({ error: `User ${nick} not found` });
        }

        const peaksAchievedIds = user.peaksAchieved.map(peak => peak.peakId);
        const peaks = await Peak.find({ '_id': { $in: peaksAchievedIds } });

        const totalSystemPeaks = await Peak.countDocuments();

        const totalPeaks = peaks.length;
        const startIndex = (page - 1) * limit;
        const peaksOnPage = peaks.slice(startIndex, startIndex + parseInt(limit));

        const peakDtos = peaksOnPage.map(peak => ({
            peakId: peak._id,
            name: peak.tags.name,
            ele: peak.tags.ele,
            lon: peak.lon,
            lat: peak.lat
        }));

        return res.json({
            data: peakDtos,
            totalPeaks,
            totalPages: Math.ceil(totalPeaks / limit),
            totalSystemPeaks: totalSystemPeaks,
            currentPage: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error user peaks', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/:nick/peaks', authenticateJWT, async (req, res) => {
    const { nick } = req.params;
    const { peakId } = req.body;

    try {
        const user = await findUserByNick(nick);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const peak = await Peak.findById(peakId);
        if (!peak) {
            return res.status(404).json({ error: 'Peak not found' });
        }

        const peakIds = user.peaksAchieved.map(p => p.peakId.toString());

        if (peakIds.includes(peakId)) {
            return res.status(400).json({ error: 'Peak already achieved' });
        }

        const peakToSave = {
            peakId: peakId
        }

        await User.updateOne(
            { nick },
            { $addToSet: { peaksAchieved: peakToSave } }
        );

        await user.save();

        res.status(201).json({ message: 'Peak added to user\'s achieved list', peaksAchieved: user.peaksAchieved });
    } catch (error) {
        console.error(`Error adding peak to user ${nick}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const toDto = (input) => {
    if (Array.isArray(input)) {
        return input.map(u => ({
            _id: u._id,
            name: u.name,
            surname: u.surname,
            nick: u.nick,
            peaksAchieved: u.peaksAchieved,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt
        }));
    } else {
        return {
            _id: input._id,
            name: input.name,
            surname: input.surname,
            nick: input.nick,
            peaksAchieved: input.peaksAchieved,
            createdAt: input.createdAt,
            updatedAt: input.updatedAt
        };
    }
};

const findUserByNick = (nick) => {
    return User.findOne({ nick });
}

export default router;
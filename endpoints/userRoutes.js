import express from 'express';
import User from './models/user.js';
import Peak from './models/peak.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const jwtsecret = process.env.JWT_SECRET;


router.post('/register', async (req, res) => {
    const { name, surname, nick, password } = req.body;

    try {
        const userExists = await findUserByNick(nick);
        if (userExists) {
            return res.status(400).json({ error: 'Duplicate nickname' });
        }

        const newUser = new User({ name, surname, nick, password });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error register user', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { nick, password } = req.body;    

    try {
        const user = await findUserByNick(nick);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const doesMatch = await bcrypt.compare(password, user.password);
        if (!doesMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, nick: user.nick }, jwtsecret, { expiresIn: '7d' });

        res.json({ message: 'Login successful', token, user: { nick: user.nick } });
    } catch (error) {
        console.error('Error register user', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:nick/peaks', async (req, res) => {
    const { nick } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const user = await findUserByNick(nick);
        
        if (!user) {
            return res.status(404).json({ error: `User ${nick} not found` });
        }
        user.populate('peaksAchieved');

        const totalPeaks = user.peaksAchieved.length;

        const startIndex = (page - 1) * limit;

        const peaksOnPage = user.peaksAchieved.slice(startIndex, startIndex + parseInt(limit));

        return res.json({
            data: peaksOnPage,
            totalPeaks,
            totalPages: Math.ceil(totalPeaks / limit),
            currentPage: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error register user', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/:nick/peaks', async (req, res) => {
    const { nick } = req.params;
    const { peakId } = req.body;

    try {
        const user = await findUserByNick(nick);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.peaksAchieved) {
            user.peaksAchieved = [];
        }

        const peak = await Peak.findById(peakId);
        if (!peak) {
            return res.status(404).json({ error: 'Peak not found' });
        }

        if (user.peaksAchieved.includes(peakId)) {
            return res.status(400).json({ error: 'Peak already achieved' });
        }

        user.peaksAchieved.push(peak);
        await user.save();

        res.status(201).json({ message: 'Peak added to user\'s achieved list', peaksAchieved: user.peaksAchieved });
    } catch (error) {
        console.error(`Error adding peak to user ${nick}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const findUserByNick = (nick) => {
    return User.findOne({ nick });
}

export default router;
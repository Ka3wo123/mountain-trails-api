import {
  create,
  findAll,
  findOneByNick,
  getAccessToken,
  authenticate,
  findUserPeaks,
  addPeakToUser,
  deleteUserPeak,
} from '../services/users.js';

const SAME_SITE = 'None';
export const find = async (req, res) => {
  const params = req.query;
  try {
    const users = await findAll(params);
    res.status(200).json(users);
  } catch (error) {
    res.problem(error.status, error.name, error.message);
  }
};

export const findOne = async (req, res) => {
  const { nick } = req.params;
  try {
    const user = await findOneByNick(nick);
    res.status(200).json(user);
  } catch (error) {
    res.problem(error.status, error.name, error.message);
  }
};

export const register = async (req, res) => {
  const user = req.body;

  try {
    await create(user);
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.problem(error.status, error.name, error.message);
  }
};

export const login = async (req, res) => {
  const credentials = req.body;
  console.log(credentials);
  try {
    const { token, refreshToken, user } = await authenticate(credentials);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: SAME_SITE,
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken: token,
      user: { nick: user.nick },
    });
  } catch (error) {
    res.problem(error.status, error.name, error.message);
  }
};

export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    const accessToken = await getAccessToken(refreshToken);
    res.status(200).json({ accessToken });
  } catch (error) {
    res.problem(error.status, error.name, error.message);
  }
};

export const logout = async (_, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: SAME_SITE,
    });
    res.json({ message: 'Cleared refresh token' });
  } catch (error) {
    res.problem(error.status, error.name, error.message);
  }
};

export const getPeaks = async (req, res) => {
  const { nick } = req.params;
  const params = req.query;
  try {
    const result = await findUserPeaks(nick, params);
    res.status(200).json(result);
  } catch (error) {
    res.problem(error.status, error.name, error.message);
  }
};

export const addNewUserPeak = async (req, res) => {
  const { nick } = req.params;
  const body = req.body;

  try {
    const result = await addPeakToUser(nick, body);
    res.status(201).json();
  } catch (error) {
    res.problem(error.status, error.name, error.message);
  }
};

export const deletePeakForUser = async (req, res) => {
  const { nick } = req.params;
  const body = req.body;

  try {
    await deleteUserPeak(nick, body);
    res.status(200).json();
  } catch (error) {
    res.problem(error.status, error.name, error.message);
  }
};

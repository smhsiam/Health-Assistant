const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const emailPattern = /^\S+@\S+\.\S+$/;

const makeToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

const register = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name || name.length > 100) {
      return res.status(400).json({ message: 'Enter your full name' });
    }

    if (!emailPattern.test(email) || email.length > 255) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }

    const strongEnough =
      password.length >= 8 &&
      password.length <= 72 &&
      /[A-Za-z]/.test(password) &&
      /\d/.test(password);

    if (!strongEnough) {
      return res.status(400).json({
        message: 'Use 8 to 72 characters with at least one letter and one number',
      });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res
        .status(409)
        .json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.createWithProfile(name, email, passwordHash);

    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === '23505') {
      return res
        .status(409)
        .json({ message: 'An account with this email already exists' });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Enter your email and password' });
    }

    const user = await userModel.findByEmail(email);
    const matches = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!matches) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    res.json({ token: makeToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

const me = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, me };
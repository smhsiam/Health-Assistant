const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const emailPattern = /^\S+@\S+\.\S+$/;
const bmdcPattern = /^[A-Za-z0-9-]{3,30}$/;

const makeToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const readAccount = (body) => {
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!name || name.length > 100) {
    return { error: 'Enter your full name' };
  }

  if (!emailPattern.test(email) || email.length > 255) {
    return { error: 'Enter a valid email address' };
  }

  const strongEnough =
    password.length >= 8 &&
    password.length <= 72 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password);

  if (!strongEnough) {
    return {
      error: 'Use 8 to 72 characters with at least one letter and one number',
    };
  }

  return { name, email, password };
};

const register = async (req, res, next) => {
  try {
    const account = readAccount(req.body);

    if (account.error) {
      return res.status(400).json({ message: account.error });
    }

    const existing = await userModel.findByEmail(account.email);
    if (existing) {
      return res
        .status(409)
        .json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(account.password, 10);
    const user = await userModel.createWithProfile(
      account.name,
      account.email,
      passwordHash
    );

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

const registerDoctor = async (req, res, next) => {
  try {
    const account = readAccount(req.body);

    if (account.error) {
      return res.status(400).json({ message: account.error });
    }

    const specialty = String(req.body.specialty || '').trim();
    const bmdcNumber = String(req.body.bmdcNumber || '').trim().toUpperCase();

    if (!specialty || specialty.length > 100) {
      return res.status(400).json({ message: 'Enter your specialty' });
    }

    if (!bmdcPattern.test(bmdcNumber)) {
      return res
        .status(400)
        .json({ message: 'Enter your BMDC registration number' });
    }

    const existing = await userModel.findByEmail(account.email);
    if (existing) {
      return res
        .status(409)
        .json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(account.password, 10);
    const user = await userModel.createDoctor({
      name: account.name,
      email: account.email,
      passwordHash,
      specialty,
      bmdcNumber,
    });

    res.status(201).json({
      token: makeToken(user),
      user: publicUser(user),
      doctorStatus: 'pending',
    });
  } catch (error) {
    if (error.code === '23505') {
      const duplicateBmdc = String(error.constraint || '').includes('bmdc');
      return res.status(409).json({
        message: duplicateBmdc
          ? 'This BMDC number is already registered'
          : 'An account with this email already exists',
      });
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

module.exports = { register, registerDoctor, login, me };
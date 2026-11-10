const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Please login to continue' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ message: 'Your session has expired. Please login again' });
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Please login to continue' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { pool } = require('../config/mysql');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, token missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ? LIMIT 1', [
      decoded.userId,
    ]);

    if (!rows.length) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    req.user = rows[0];
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token invalid');
  }
});

module.exports = {
  protect,
};

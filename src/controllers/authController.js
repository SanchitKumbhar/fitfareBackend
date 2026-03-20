const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { pool } = require('../config/mysql');
const { generateToken } = require('../utils/authToken');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);

  if (existing.length) {
    res.status(409);
    throw new Error('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [String(name).trim(), normalizedEmail, hashedPassword]
  );

  const user = {
    id: result.insertId,
    name: String(name).trim(),
    email: normalizedEmail,
  };

  res.status(201).json({
    token: generateToken(user.id),
    user,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const [rows] = await pool.query(
    'SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail]
  );

  if (!rows.length) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const userRow = rows[0];
  const isPasswordValid = await bcrypt.compare(password, userRow.password);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    token: generateToken(userRow.id),
    user: {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
    },
  });
});

module.exports = {
  register,
  login,
};

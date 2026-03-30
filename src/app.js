const path = require('path');
const cors = require('cors');
const express = require('express');
require('dotenv').config();

const apiRoutes = require('./routes');

const app = express();

// ✅ Allowed origins from .env
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// ✅ CORS CONFIG (FIXED)
const corsOptions = {
  origin: function (origin, callback) {
    console.log("🌐 Request Origin:", origin);

    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`❌ CORS blocked for: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ Apply CORS
app.use(cors(corsOptions));

// ✅ FIX: Handle preflight properly
app.options('/*', cors(corsOptions));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ✅ API routes
app.use('/api', apiRoutes);

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);

  // Handle CORS error properly
  if (err.message.includes('CORS')) {
    return res.status(403).json({ message: err.message });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
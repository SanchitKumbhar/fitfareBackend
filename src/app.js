const path = require('path');
const cors = require('cors');
const express = require('express');
require('dotenv').config();

const apiRoutes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

/**
 * ✅ Allowed Origins (from .env)
 * Example:
 * CORS_ORIGIN=http://15.207.11.4,http://localhost:3000
 */
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

/**
 * ✅ CORS Configuration
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

/**
 * ✅ Middlewares
 */
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ Explicit preflight handler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ✅ Static Files
 */
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

/**
 * ✅ Routes
 */
app.use('/api', apiRoutes);

/**
 * ❌ 404 Handler
 */
app.use(notFound);

/**
 * ❌ Error Handler
 */
app.use(errorHandler);

module.exports = app;
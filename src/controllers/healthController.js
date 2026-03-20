const { pool } = require('../config/mysql');

const getHealth = async (req, res) => {
  let dbStatus = 'down';

  try {
    await pool.query('SELECT 1');
    dbStatus = 'up';
  } catch (error) {
    dbStatus = 'down';
  }

  res.status(dbStatus === 'up' ? 200 : 503).json({
    success: dbStatus === 'up',
    message: 'Server health status',
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
};

module.exports = getHealth;

const asyncHandler = require('express-async-handler');
const { pool } = require('../config/mysql');

const getByDate = asyncHandler(async (req, res) => {
  const date = req.params.date;

  const [rows] = await pool.query(
    'SELECT completed FROM day_completions WHERE user_id = ? AND date = ? LIMIT 1',
    [req.user.id, date]
  );

  res.json({
    date,
    completed: rows.length ? Boolean(rows[0].completed) : false,
  });
});

const upsertByDate = asyncHandler(async (req, res) => {
  const date = req.params.date;
  const completed = Boolean(req.body.completed);

  await pool.query(
    `INSERT INTO day_completions (user_id, date, completed)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE completed = VALUES(completed)`,
    [req.user.id, date, completed]
  );

  res.json({
    date,
    completed,
  });
});

module.exports = {
  getByDate,
  upsertByDate,
};

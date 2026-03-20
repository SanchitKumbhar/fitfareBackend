const asyncHandler = require('express-async-handler');
const { pool } = require('../config/mysql');
const { toPublicImageUrl } = require('../utils/imageUrl');

function mapFood(row, req) {
  return {
    id: row.id,
    name: row.name,
    calories: Number(row.calories),
    protein: Number(row.protein),
    carbs: Number(row.carbs),
    fats: Number(row.fats),
    image: toPublicImageUrl(req, row.image_url),
    createdAt: row.created_at,
  };
}

const getFoods = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, name, calories, protein, carbs, fats, image_url, created_at
     FROM foods
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [req.user.id]
  );

  res.json(rows.map((row) => mapFood(row, req)));
});

const createFood = asyncHandler(async (req, res) => {
  const { name, calories, protein, carbs, fats } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Food name is required');
  }

  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const [result] = await pool.query(
    `INSERT INTO foods (user_id, name, calories, protein, carbs, fats, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      String(name).trim(),
      Number(calories) || 0,
      Number(protein) || 0,
      Number(carbs) || 0,
      Number(fats) || 0,
      imagePath,
    ]
  );

  const [rows] = await pool.query(
    `SELECT id, name, calories, protein, carbs, fats, image_url, created_at
     FROM foods
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [result.insertId, req.user.id]
  );

  res.status(201).json(mapFood(rows[0], req));
});

const updateFood = asyncHandler(async (req, res) => {
  const foodId = Number(req.params.id);
  const { name, calories, protein, carbs, fats } = req.body;

  const [existingRows] = await pool.query('SELECT * FROM foods WHERE id = ? AND user_id = ? LIMIT 1', [
    foodId,
    req.user.id,
  ]);

  if (!existingRows.length) {
    res.status(404);
    throw new Error('Food not found');
  }

  const existing = existingRows[0];
  const imagePath = req.file ? `/uploads/${req.file.filename}` : existing.image_url;

  await pool.query(
    `UPDATE foods
     SET name = ?, calories = ?, protein = ?, carbs = ?, fats = ?, image_url = ?
     WHERE id = ? AND user_id = ?`,
    [
      name ? String(name).trim() : existing.name,
      calories !== undefined ? Number(calories) || 0 : Number(existing.calories),
      protein !== undefined ? Number(protein) || 0 : Number(existing.protein),
      carbs !== undefined ? Number(carbs) || 0 : Number(existing.carbs),
      fats !== undefined ? Number(fats) || 0 : Number(existing.fats),
      imagePath,
      foodId,
      req.user.id,
    ]
  );

  const [rows] = await pool.query(
    `SELECT id, name, calories, protein, carbs, fats, image_url, created_at
     FROM foods
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [foodId, req.user.id]
  );

  res.json(mapFood(rows[0], req));
});

const deleteFood = asyncHandler(async (req, res) => {
  const foodId = Number(req.params.id);

  const [result] = await pool.query('DELETE FROM foods WHERE id = ? AND user_id = ?', [
    foodId,
    req.user.id,
  ]);

  if (!result.affectedRows) {
    res.status(404);
    throw new Error('Food not found');
  }

  await pool.query('DELETE FROM meals WHERE food_id = ? AND user_id = ?', [foodId, req.user.id]);

  res.json({ message: 'Food deleted successfully' });
});

module.exports = {
  getFoods,
  createFood,
  updateFood,
  deleteFood,
};

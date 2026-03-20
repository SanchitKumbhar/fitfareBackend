const asyncHandler = require('express-async-handler');
const { pool } = require('../config/mysql');
const { toPublicImageUrl } = require('../utils/imageUrl');

const ALLOWED_TYPES = new Set(['breakfast', 'lunch', 'dinner', 'snacks']);

function mapMeal(row, req) {
  return {
    id: row.id,
    date: row.date,
    type: row.meal_type,
    foodId: row.food_id,
    food: {
      id: row.food_id,
      name: row.food_name,
      calories: Number(row.calories),
      protein: Number(row.protein),
      carbs: Number(row.carbs),
      fats: Number(row.fats),
      image: toPublicImageUrl(req, row.image_url),
    },
  };
}

const getMeals = asyncHandler(async (req, res) => {
  const date = req.query.date;
  const params = [req.user.id];

  let query = `
    SELECT m.id, m.date, m.meal_type, m.food_id,
           f.name AS food_name, f.calories, f.protein, f.carbs, f.fats, f.image_url
    FROM meals m
    JOIN foods f ON f.id = m.food_id
    WHERE m.user_id = ?
  `;

  if (date) {
    query += ' AND m.date = ?';
    params.push(date);
  }

  query += ' ORDER BY m.date DESC, m.id DESC';

  const [rows] = await pool.query(query, params);
  res.json(rows.map((row) => mapMeal(row, req)));
});

const createMeal = asyncHandler(async (req, res) => {
  const { date, type, foodId } = req.body;

  if (!date || !type || !foodId) {
    res.status(400);
    throw new Error('date, type, and foodId are required');
  }

  if (!ALLOWED_TYPES.has(type)) {
    res.status(400);
    throw new Error('Invalid meal type');
  }

  const [foods] = await pool.query('SELECT id FROM foods WHERE id = ? AND user_id = ? LIMIT 1', [
    Number(foodId),
    req.user.id,
  ]);

  if (!foods.length) {
    res.status(404);
    throw new Error('Food not found');
  }

  const [result] = await pool.query(
    'INSERT INTO meals (user_id, food_id, meal_type, date) VALUES (?, ?, ?, ?)',
    [req.user.id, Number(foodId), type, date]
  );

  const [rows] = await pool.query(
    `SELECT m.id, m.date, m.meal_type, m.food_id,
            f.name AS food_name, f.calories, f.protein, f.carbs, f.fats, f.image_url
     FROM meals m
     JOIN foods f ON f.id = m.food_id
     WHERE m.id = ? AND m.user_id = ?
     LIMIT 1`,
    [result.insertId, req.user.id]
  );

  res.status(201).json(mapMeal(rows[0], req));
});

const deleteMeal = asyncHandler(async (req, res) => {
  const mealId = Number(req.params.id);

  const [result] = await pool.query('DELETE FROM meals WHERE id = ? AND user_id = ?', [
    mealId,
    req.user.id,
  ]);

  if (!result.affectedRows) {
    res.status(404);
    throw new Error('Meal not found');
  }

  res.json({ message: 'Meal removed successfully' });
});

module.exports = {
  getMeals,
  createMeal,
  deleteMeal,
};

const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { getMeals, createMeal, deleteMeal } = require('../controllers/mealController');

const router = express.Router();

router.use(protect);

router.get('/', getMeals);
router.post('/', createMeal);
router.delete('/:id', deleteMeal);

module.exports = router;

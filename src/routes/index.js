const express = require('express');
const getHealth = require('../controllers/healthController');
const authRoutes = require('./authRoutes');
const foodRoutes = require('./foodRoutes');
const mealRoutes = require('./mealRoutes');
const dayCompletionRoutes = require('./dayCompletionRoutes');

const router = express.Router();

router.get('/health', getHealth);
router.use('/auth', authRoutes);
router.use('/foods', foodRoutes);
router.use('/meals', mealRoutes);
router.use('/day-completions', dayCompletionRoutes);

module.exports = router;

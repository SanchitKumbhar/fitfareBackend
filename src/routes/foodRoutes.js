const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');
const {
  getFoods,
  createFood,
  updateFood,
  deleteFood,
} = require('../controllers/foodController');

const router = express.Router();

router.use(protect);

router.get('/', getFoods);
router.post('/', upload.single('image'), createFood);
router.put('/:id', upload.single('image'), updateFood);
router.delete('/:id', deleteFood);

module.exports = router;

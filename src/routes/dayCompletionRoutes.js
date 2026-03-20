const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { getByDate, upsertByDate } = require('../controllers/dayCompletionController');

const router = express.Router();

router.use(protect);

router.get('/:date', getByDate);
router.put('/:date', upsertByDate);

module.exports = router;

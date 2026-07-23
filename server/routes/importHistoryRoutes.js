const express = require('express');
const router = express.Router();
const { getImportHistory } = require('../controllers/importExportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getImportHistory);

module.exports = router;

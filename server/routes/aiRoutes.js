const express = require('express');
const router = express.Router();
const { summarizeNotes, suggestFollowUp, analyzeSentiment } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/summarize/:id', summarizeNotes);
router.post('/follow-up/:id', suggestFollowUp);
router.post('/sentiment/:id', analyzeSentiment);

module.exports = router;

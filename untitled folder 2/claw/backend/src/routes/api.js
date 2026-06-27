const express = require('express');
const router = express.Router();
const multer = require('multer');

// Setup multer for memory storage (for parsing CSV files)
const upload = multer({ storage: multer.memoryStorage() });

const { analyzeFeedback } = require('../controllers/feedbackController');
const { generatePRD } = require('../controllers/prdController');

// Route for analyzing uploaded CSV or pasted text feedback
// Accepts optional 'file' if uploading CSV
router.post('/analyze-feedback', upload.single('file'), analyzeFeedback);

// Route for generating the PRD from grouped feedback
router.post('/generate-prd', generatePRD);

module.exports = router;

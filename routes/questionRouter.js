const express = require('express');
const router = express.Router();
const questionControllerr = require('../controllers/questionControllerr');

// Get all questions with rules
router.get('/', questionControllerr.getAllQuestions);

// Create question
router.post('/', questionControllerr.createQuestion);

// Update question
router.put('/:questionID', questionControllerr.updateQuestion);

// Delete question
router.delete('/:questionID', questionControllerr.deleteQuestion);

module.exports = router;

const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Get all questions with rules
router.get('/', questionController.getAllQuestions);

// Create question
router.post('/', questionController.createQuestion);

// Update question
router.put('/:questionID', questionController.updateQuestion);

// Delete question
router.delete('/:questionID', questionController.deleteQuestion);

module.exports = router;

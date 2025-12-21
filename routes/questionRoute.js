const express = require('express');
const router = express.Router();
const QuestionController = require('../controllers/questionController');

/**
 * @route   GET /questions/patient/:patientID
 * @desc    Get questions for a specific patient based on their data
 * @access  Public (consider adding authentication middleware)
 */
router.get('/patient/:patientID', QuestionController.getPatientQuestions);

/**
 * @route   POST /questions/patient/:patientID/answers
 * @desc    Save patient's answers
 * @access  Public
 */
router.post('/patient/:patientID/answers', QuestionController.saveAnswers);

/**
 * @route   GET /api/questions/all
 * @desc    Get all questions (for testing/admin)
 * @access  Public
 */
router.get('/all', QuestionController.getAllQuestions);

/**
 * @route   GET /api/questions/patient/:patientID/data
 * @desc    Get patient data for debugging
 * @access  Public
 */
router.get('/patient/:patientID/data', QuestionController.getPatientData);

module.exports = router;
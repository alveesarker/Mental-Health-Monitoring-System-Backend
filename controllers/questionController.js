const Question = require('../models/questionModel');

const questionController = {
  // Get all questions
  getAllQuestions: async (req, res) => {
    try {
      const questions = await Question.getAll();
      res.json(questions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching questions' });
    }
  },

  // Create question
  createQuestion: async (req, res) => {
    try {
      const { questionText, type, rules } = req.body;
      const questionID = await Question.create(questionText, type, rules);
      res.status(201).json({ message: 'Question created', questionID });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error creating question' });
    }
  },

  // Update question
  updateQuestion: async (req, res) => {
    try {
      const { questionID } = req.params;
      const { questionText, type, rules } = req.body;
      await Question.update(questionID, questionText, type, rules);
      res.json({ message: 'Question updated' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating question' });
    }
  },

  // Delete question
  deleteQuestion: async (req, res) => {
    try {
      const { questionID } = req.params;
      await Question.delete(questionID);
      res.json({ message: 'Question deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error deleting question' });
    }
  }
};

module.exports = questionController;

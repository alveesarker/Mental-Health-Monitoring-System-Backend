const db = require('../db'); // assume you have a db.js exporting a mysql2/promise connection

// Question Model
const Question = {
  // Get all questions with their rules
  getAll: async () => {
    const [questions] = await db.query('SELECT * FROM question');
    
    // Get rules for each question
    const result = [];
    for (const q of questions) {
      const [rules] = await db.query(
        'SELECT category, value FROM questionrule WHERE questionID = ?',
        [q.questionID]
      );
      result.push({ ...q, rules });
    }
    return result;
  },

  

  // Create question with rules
  create: async (questionText, type, rules = []) => {
    const [res] = await db.query(
      'INSERT INTO question (questionText, type) VALUES (?, ?)',
      [questionText, type]
    );
    const questionID = res.insertId;

    // Insert rules if any
    for (const rule of rules) {
      await db.query(
        'INSERT INTO questionrule (questionID, category, value) VALUES (?, ?, ?)',
        [questionID, rule.category, rule.value]
      );
    }
    return questionID;
  },

  // Update question and rules
  update: async (questionID, questionText, type, rules = []) => {
    await db.query(
      'UPDATE question SET questionText = ?, type = ? WHERE questionID = ?',
      [questionText, type, questionID]
    );

    // Delete existing rules and insert new ones
    await db.query('DELETE FROM questionrule WHERE questionID = ?', [questionID]);
    for (const rule of rules) {
      await db.query(
        'INSERT INTO questionrule (questionID, category, value) VALUES (?, ?, ?)',
        [questionID, rule.category, rule.value]
      );
    }
    return questionID;
  },

  // Delete question and its rules
  delete: async (questionID) => {
    await db.query('DELETE FROM questionrule WHERE questionID = ?', [questionID]);
    await db.query('DELETE FROM question WHERE questionID = ?', [questionID]);
  }
};

module.exports = Question;

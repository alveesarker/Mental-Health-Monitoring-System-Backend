const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await db.query(
    `SELECT userID, name, email, role
     FROM user_t 
     WHERE email = ? AND password = ?`,
    [email, password]
  );

  if (rows.length === 0) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    message: 'Login successful',
    user: rows[0]
  });
});

module.exports = router;

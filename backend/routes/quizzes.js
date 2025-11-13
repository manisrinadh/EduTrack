const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ Get all quizzes OR filter by course name using query param
router.get('/', (req, res) => {
  const { course } = req.query;

  const sql = course
    ? 'SELECT * FROM quizzes WHERE course_name = ?'
    : 'SELECT * FROM quizzes';

  const params = course ? [course] : [];

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ✅ Create a new quiz
router.post('/', (req, res) => {
  const { title, course_name, trainer_id } = req.body;

  if (!title || !course_name || !trainer_id) {
    return res.status(400).json({ error: "title, course_name, and trainer_id are required" });
  }

  const sql = 'INSERT INTO quizzes (title, course_name, trainer_id) VALUES (?, ?, ?)';
  db.query(sql, [title, course_name, trainer_id], (err, result) => {
    if (err) return res.status(500).send({ error: err.message });
    res.status(201).json({ quizId: result.insertId });
  });
});

module.exports = router;

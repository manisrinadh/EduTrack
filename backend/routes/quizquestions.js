const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ Add multiple questions to a quiz
router.post("/:quizId", (req, res) => {
  const { questions } = req.body;
  const quizId = req.params.quizId;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: "Questions array is required." });
  }

  const values = questions.map((q) => [
    quizId,
    q.question_text,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_option.toUpperCase() // Normalize to 'A', 'B', 'C', or 'D'
  ]);

  const sql = `
    INSERT INTO quiz_questions 
    (quiz_id, question, option_a, option_b, option_c, option_d, correct_option)
    VALUES ?
  `;

  db.query(sql, [values], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ added: result.affectedRows });
  });
});

// ✅ Get all questions for a quiz
router.get("/:quizId", (req, res) => {
  const quizId = req.params.quizId;

  const sql = `
    SELECT id, question AS question_text, option_a, option_b, option_c, option_d, correct_option
    FROM quiz_questions
    WHERE quiz_id = ?
  `;

  db.query(sql, [quizId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// ➕ Add this to quizquestions.js
router.get("/", (req, res) => {
  const sql = `
    SELECT id, quiz_id, question AS question_text, option_a, option_b, option_c, option_d, correct_option
    FROM quiz_questions
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;

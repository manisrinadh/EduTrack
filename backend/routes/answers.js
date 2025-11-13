const express = require("express");
const router = express.Router();
const db = require("../config/db");

// POST: Save answers
router.post('/attempts/:attemptId/answers', (req, res) => {
  const attemptId = req.params.attemptId;
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: "Invalid answers format" });
  }

  const values = answers.map(a => [
    attemptId, a.question_id, a.selected_option, a.is_correct
  ]);

  const sql = `
    INSERT INTO student_answers (attempt_id, question_id, selected_option, is_correct)
    VALUES ?
  `;

  db.query(sql, [values], (err, result) => {
    if (err) return res.status(500).send({ error: err.message });
    res.status(201).json({ saved: result.affectedRows });
  });
});

// ✅ NEW: GET all answers for a given attempt
router.get('/attempts/:attemptId/answers', (req, res) => {
  const attemptId = req.params.attemptId;

  const sql = `
    SELECT sa.*, qq.question 
    FROM student_answers sa
    JOIN quiz_questions qq ON sa.question_id = qq.id
    WHERE sa.attempt_id = ?
  `;

  db.query(sql, [attemptId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;

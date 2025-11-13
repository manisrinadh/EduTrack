const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ Submit a quiz attempt (student)
router.post("/", (req, res) => {
  const { student_id, quiz_id, score } = req.body;

  if (!student_id || !quiz_id || score == null) {
    return res.status(400).json({ error: "Missing student_id, quiz_id, or score" });
  }

  // Optional: get total from question count
  const getTotalSql = "SELECT COUNT(*) AS total FROM quiz_questions WHERE quiz_id = ?";
  db.query(getTotalSql, [quiz_id], (err, totalResult) => {
    if (err) return res.status(500).json({ error: err.message });

    const total = totalResult[0].total;

    const insertSql = `
      INSERT INTO student_quiz_attempts (student_id, quiz_id, score, total)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertSql, [student_id, quiz_id, score, total], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({ attemptId: result.insertId, total });
    });
  });
});

// ✅ Get all quiz attempts for a student
router.get("/", (req, res) => {
  const student_id = req.query.student_id;

  if (!student_id) {
    return res.status(400).json({ error: "Missing student_id in query" });
  }

  const sql = `
    SELECT sqa.*, q.title AS quiz_title
    FROM student_quiz_attempts sqa
    JOIN quizzes q ON q.id = sqa.quiz_id
    WHERE sqa.student_id = ?
    ORDER BY sqa.id DESC
  `;

  db.query(sql, [student_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;

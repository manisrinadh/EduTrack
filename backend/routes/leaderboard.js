// routes/leaderboard.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ GET /api/leaderboard - All students with their points
router.get("/", (req, res) => {
  const sql = `
    SELECT s.id, s.name, s.college, s.course, l.points
    FROM students s
    JOIN leaderboard l ON s.id = l.id
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
router.post("/", (req, res) => {
  const { student_id, points } = req.body;

  const sql = `
    UPDATE leaderboard
    SET points = points + ?
    WHERE id = ?
  `;

  db.query(sql, [points, student_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found in leaderboard" });
    }

    res.json({ success: true, updated: result.affectedRows });
  });
});

// ✅ PATCH /api/leaderboard/:id - Update student points
router.patch("/:id", (req, res) => {
  const { points } = req.body;
  const studentId = req.params.id;

  if (typeof points !== "number") {
    return res.status(400).json({ error: "points must be a number" });
  }

  db.query(
    "UPDATE leaderboard SET points = ? WHERE id = ?",
    [points, studentId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Student not found in leaderboard" });
      }
      res.json({ message: "Points updated successfully" });
    }
  );
});

// ✅ GET /api/leaderboard/top - Top 10 by points
router.get("/top", (req, res) => {
  const sql = `
    SELECT s.id, s.name, s.college, s.course, l.points
    FROM students s
    JOIN leaderboard l ON s.id = l.id
    ORDER BY l.points DESC
    LIMIT 10
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../config/db");

// POST /api/attendance → Mark/store attendance
router.post("/", (req, res) => {
  const {
    student_id,
    student_name,
    course,
    date,
    status = "Absent",
    marked_by,
  } = req.body;

  // Validate required fields
  if (!student_id || !date || !marked_by) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO attendance (student_id, student_name, course, date, status, marked_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [student_id, student_name, course, date, status, marked_by],
    (err, result) => {
      if (err) {
        console.error("❌ Error inserting attendance:", err);
        return res.status(500).json({ error: "Database insert error" });
      }
      res.status(201).json({ message: "✅ Attendance marked successfully!" });
    }
  );
});

// GET /api/attendance → Get all attendance records
router.get("/", (req, res) => {
  const sql = `
    SELECT a.*, s.NAME AS student_name, t.NAME AS trainer_name
    FROM attendance a
    LEFT JOIN students s ON a.student_id = s.id
    LEFT JOIN trainers t ON a.marked_by = t.id
    ORDER BY a.date DESC, a.timestamp DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching attendance:", err);
      return res.status(500).json({ error: "Database fetch error" });
    }
    res.status(200).json(results);
  });
});

module.exports = router;

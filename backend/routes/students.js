const express = require("express");
const db = require("../config/db");
const router = express.Router();

console.log("✅ students.js route file loaded");

// 🔹 GET /api/students - Fetch all students
router.get("/", (req, res) => {
  db.query("SELECT * FROM students", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 🔹 GET /api/students/update-attendance - Calculate and update attendance %
router.get("/update-attendance", (req, res) => {
  const updateSql = `
    UPDATE students s
    LEFT JOIN (
      SELECT 
        student_id,
        COUNT(*) AS total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_days,
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 0) AS attendance_percent
      FROM attendance
      GROUP BY student_id
    ) a ON s.id = a.student_id
    SET s.ATTENDANCE = IFNULL(a.attendance_percent, 0)
  `;

  db.query(updateSql, (err, result) => {
    if (err) {
      console.error("❌ Attendance update failed:", err);
      return res.status(500).json({ error: "Database update failed" });
    }
    res.json({
      message: "✅ Attendance updated successfully!",
      affectedRows: result.affectedRows,
    });
  });
});

// 🔹 GET /api/students/:id - Fetch one student
router.get("/:id", (req, res) => {
  const studentId = parseInt(req.params.id);
  if (isNaN(studentId)) return res.status(400).json({ error: "Invalid student ID" });

  db.query("SELECT * FROM students WHERE id = ?", [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Student not found" });
    res.json(results[0]);
  });
});

// 🔹 PATCH /api/students/:id/attendance - Manually update ATTENDANCE %
router.patch("/:id/attendance", (req, res) => {
  const studentId = parseInt(req.params.id);
  const { ATTENDANCE } = req.body;

  if (isNaN(studentId) || ATTENDANCE === undefined || isNaN(Number(ATTENDANCE))) {
    return res.status(400).json({ error: "Valid student ID and ATTENDANCE are required" });
  }

  const sql = "UPDATE students SET ATTENDANCE = ? WHERE id = ?";
  db.query(sql, [ATTENDANCE, studentId], (err, result) => {
    if (err) {
      console.error("❌ Failed to update ATTENDANCE:", err);
      return res.status(500).json({ error: "Database update failed" });
    }
    res.json({
      message: "✅ Attendance updated successfully!",
      affectedRows: result.affectedRows,
    });
  });
});

// 🔹 POST /api/students - Add a new student
router.post("/", (req, res) => {
  const { NAME, EMAIL, PASSWORD, COLLEGE, COURSE, ATTENDANCE = 0 } = req.body;

  if (![NAME, EMAIL, PASSWORD, COLLEGE, COURSE].every(Boolean)) {
    return res.status(400).json({ error: "All fields (except ATTENDANCE) are required" });
  }

  const sql = `
    INSERT INTO students (NAME, EMAIL, PASSWORD, COLLEGE, COURSE, ATTENDANCE)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [NAME, EMAIL, PASSWORD, COLLEGE, COURSE, ATTENDANCE], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "✅ Student created", id: result.insertId });
  });
});

// 🔹 PUT /api/students/:id - Update full student record
router.put("/:id", (req, res) => {
  const studentId = parseInt(req.params.id);
  const { NAME, EMAIL, PASSWORD, COLLEGE, COURSE, ATTENDANCE } = req.body;

  if (![NAME, EMAIL, PASSWORD, COLLEGE, COURSE].every(Boolean) || isNaN(Number(ATTENDANCE))) {
    return res.status(400).json({ error: "All fields are required and ATTENDANCE must be a number" });
  }

  const sql = `
    UPDATE students
    SET NAME = ?, EMAIL = ?, PASSWORD = ?, COLLEGE = ?, COURSE = ?, ATTENDANCE = ?
    WHERE id = ?
  `;

  db.query(sql, [NAME, EMAIL, PASSWORD, COLLEGE, COURSE, ATTENDANCE, studentId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "✅ Student updated", affectedRows: result.affectedRows });
  });
});

// 🔹 DELETE /api/students/:id - Delete a student
router.delete("/:id", (req, res) => {
  const studentId = parseInt(req.params.id);
  if (isNaN(studentId)) return res.status(400).json({ error: "Invalid student ID" });

  db.query("DELETE FROM students WHERE id = ?", [studentId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "🗑️ Student deleted", affectedRows: result.affectedRows });
  });
});
// PATCH /api/students/:id/password
router.patch("/:id/password", (req, res) => {
  const studentId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both current and new passwords are required" });
  }

  const sqlSelect = "SELECT password FROM students WHERE id = ?";
  db.query(sqlSelect, [studentId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const storedPassword = results[0].password;
    if (storedPassword !== currentPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const sqlUpdate = "UPDATE students SET password = ? WHERE id = ?";
    db.query(sqlUpdate, [newPassword, studentId], (err2) => {
      if (err2) {
        return res.status(500).json({ error: "Failed to update password" });
      }
      res.json({ message: "✅ Password updated successfully" });
    });
  });
});

module.exports = router;

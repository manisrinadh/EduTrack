const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");

// Ensure the uploads/submitassignments directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "submitassignments");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// POST /api/submitassignments
router.post("/", upload.single("submission_file"), (req, res) => {
  const { student_id, assignment_id } = req.body;

  if (!student_id || !assignment_id || !req.file) {
    return res.status(400).json({ error: "Missing fields or file." });
  }

  const submissionFile = `/uploads/submitassignments/${req.file.filename}`;

  const sql = `
    INSERT INTO student_assignments (student_id, assignment_id, submission_file)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [student_id, assignment_id, submissionFile], (err, result) => {
    if (err) {
      console.error("DB insert error:", err);
      return res.status(500).json({ error: "Database error." });
    }
    res.status(201).json({ message: "✅ Submission successful." });
  });
});
// GET /api/submitassignments?student_id=123
router.get("/", (req, res) => {
  const { student_id } = req.query;

  let sql = "SELECT * FROM student_assignments";
  const params = [];

  if (student_id) {
    sql += " WHERE student_id = ?";
    params.push(student_id);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ Error fetching submissions:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

module.exports = router;

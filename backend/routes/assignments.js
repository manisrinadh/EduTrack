const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");

// Ensure the uploads/assignments directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "assignments");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ GET all assignments
router.get("/", (req, res) => {
  const sql = "SELECT * FROM assignments";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Fetch error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ✅ POST new assignment
router.post("/", upload.single("pdf"), (req, res) => {
  const { tid, course, assignment_name, assigned_date, due_date } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded." });
  }

  const pdf_path = `/uploads/assignments/${req.file.filename}`;

  console.log("📥 Received assignment:", {
    tid,
    course,
    assignment_name,
    assigned_date,
    due_date,
    pdf_path,
  });

  const sql = `
    INSERT INTO assignments (tid, course, assignment_name, assigned_date, due_date, pdf_path)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [tid, course, assignment_name, assigned_date, due_date, pdf_path],
    (err, result) => {
      if (err) {
        console.error("❌ DB Insert Error:", err);
        return res.status(500).json({ error: "Database insert failed" });
      }
      res.status(201).json({ message: "✅ Assignment uploaded successfully!" });
    }
  );
});

module.exports = router;

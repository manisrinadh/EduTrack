// backend/routes/materials.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../config/db");

// Storage config for materials
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads/materials"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ GET /api/materials
router.get("/", (req, res) => {
  const sql = "SELECT * FROM materials";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching materials:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ✅ POST /api/materials
router.post("/", upload.single("pdf"), (req, res) => {
  const { title, description, trainer_id, course } = req.body;
  const file = req.file?.filename;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const sql = `
    INSERT INTO materials (title, description, trainer_id, course, file_path)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [title, description, trainer_id, course, file], (err, result) => {
    if (err) {
      console.error("❌ Insert error:", err);
      return res.status(500).json({ error: "Failed to save material" });
    }
    res.status(201).json({ message: "✅ Material uploaded successfully!" });
  });
});

module.exports = router;

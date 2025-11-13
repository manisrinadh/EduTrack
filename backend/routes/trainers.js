const express = require("express");
const db = require("../config/db");
const router = express.Router();

router.get("/", (req, res) => {
  db.query("SELECT * FROM trainers", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  db.query("SELECT * FROM trainers WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0]);
  });
});

router.post("/", (req, res) => {
  const { NAME, EMAIL, COURSE, PASSWORD } = req.body;
  db.query(
    "INSERT INTO trainers (NAME, EMAIL, COURSE, PASSWORD) VALUES (?, ?, ?, ?)",
    [NAME, EMAIL, COURSE, PASSWORD],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, ...req.body });
    }
  );
});

router.put("/:id", (req, res) => {
  const { NAME, EMAIL, COURSE } = req.body;
  db.query(
    "UPDATE trainers SET NAME=?, EMAIL=?, COURSE=? WHERE id=?",
    [NAME, EMAIL, COURSE, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ id: req.params.id, ...req.body });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM trainers WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
});

module.exports = router;

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend files (optional: adjust path as needed)
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));

// Static file serving for uploaded content
app.use("/uploads/assignments", express.static(path.join(__dirname, "uploads/assignments")));
app.use("/uploads/materials", express.static(path.join(__dirname, "uploads/materials")));
app.use("/uploads/submitassignments", express.static(path.join(__dirname, "uploads/submitassignments")));

// --- API Route Imports ---
const studentRoutes = require("./routes/students");
const trainerRoutes = require("./routes/trainers");
const leaderboardRoutes = require("./routes/leaderboard");
const materialsRoutes = require("./routes/materials");
const assignmentRoutes = require("./routes/assignments");
const attendanceRoutes = require("./routes/attendance");
const quizRoutes = require("./routes/quizzes");
const questionRoutes = require("./routes/quizquestions");
const attemptRoutes = require("./routes/attempts");
const answerRoutes = require("./routes/answers");
const submitassignmentsRoutes = require("./routes/submitassignments");

// --- API Route Mounts ---
app.use("/api/students", studentRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/materials", materialsRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/quizquestions", questionRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/submitassignments", submitassignmentsRoutes);

// Serve a static HTML file (e.g., About Page)
app.get("/about", (req, res) => {
  res.sendFile(path.join(publicPath, "about.html"));
});

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

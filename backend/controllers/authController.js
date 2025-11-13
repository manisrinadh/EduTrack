const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");

exports.login = (req, res) => {
  const { email, password, role } = req.body;

  // Static admin
  if (role === "admin") {
    if (email === "admin@gradious.com" && password === "admin123") {
      const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET);
      return res.json({ token });
    }
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  userModel.getUserByEmail(email, role, (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];
    const validPass = bcrypt.compareSync(password, user.password);

    if (!validPass) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET);
    res.json({ token });
  });
};

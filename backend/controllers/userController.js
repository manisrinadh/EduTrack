const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");

exports.getUsers = (req, res) => {
  const role = req.params.role;
  userModel.getAll(role, (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results);
  });
};

exports.addUser = (req, res) => {
  const role = req.params.role;
  const data = req.body;
  data.password = bcrypt.hashSync(data.password, 10);

  userModel.createUser(data, role, (err, result) => {
    if (err) return res.status(500).json({ message: "Insert error" });
    res.json({ message: `${role} added`, id: result.insertId });
  });
};

exports.updateUser = (req, res) => {
  const { id, role } = req.params;
  const data = req.body;
  userModel.updateUser(id, data, role, (err) => {
    if (err) return res.status(500).json({ message: "Update error" });
    res.json({ message: "Updated successfully" });
  });
};

exports.deleteUser = (req, res) => {
  const { id, role } = req.params;
  userModel.deleteUser(id, role, (err) => {
    if (err) return res.status(500).json({ message: "Delete error" });
    res.json({ message: "Deleted successfully" });
  });
};

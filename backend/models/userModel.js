const db = require("../config/db");

exports.getUserByEmail = (email, role, callback) => {
  db.query(`SELECT * FROM ${role}s WHERE email = ?`, [email], callback);
};

exports.createUser = (data, role, callback) => {
  db.query(`INSERT INTO ${role}s SET ?`, data, callback);
};

exports.getAll = (role, callback) => {
  db.query(`SELECT * FROM ${role}s`, callback);
};

exports.updateUser = (id, data, role, callback) => {
  db.query(`UPDATE ${role}s SET ? WHERE id = ?`, [data, id], callback);
};

exports.deleteUser = (id, role, callback) => {
  db.query(`DELETE FROM ${role}s WHERE id = ?`, [id], callback);
};

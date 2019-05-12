var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var SEED = require('../config/config').SEED;

var app = express();

var DoctorRuta = require("../models/doctor");

app.post("/", (req, res) => {
  var body = req.body;

  DoctorRuta.findOne({ email: body.email }, (err, doctorDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err
      });
    }
    if (!doctorDB) {
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales incorrectas - email",
        errors: err
      });
    }
    if (!bcrypt.compareSync(body.password, doctorDB.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales incorrectas - password",
        errors: err
      });
    }
    // Crear un token
    doctorDB.password = ':)';
    var token = jwt.sign({doctor: doctorDB}, SEED,{expiresIn: 14400}) // 4 horas
    res.status(200).json({
      ok: true,
      doctor: doctorDB,
      token: token,
      id: doctorDB._id
    });
  });
});

module.exports = app;

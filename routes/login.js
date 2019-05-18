var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var SEED = require("../config/config").SEED;

var app = express();

var DoctorRuta = require("../models/doctor");

//Google
var CLIENT_ID = require("../config/config").CLIENT_ID;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

var mdAutenticacion = require("../middlewares/autenticacion");

// =======================
// Autenticación de google
// =======================
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });

  const payload = ticket.getPayload();
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];

  return {
    name: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}

app.post("/google", async (req, res) => {
  var token = req.body.token;

  var googleUser = await verify(token)
      .catch(e => {
        return res.status(403).json({
          ok: false,
          message: 'Token no válido'
        });
  });

  DoctorRuta.findOne({ email: googleUser.email }, (err, doctorDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: 'Error al buscar usuario en base de datos',
        errors: err
      });
    }

    if (doctorDB) {

      if (doctorDB.google === false) {
        return res.status(400).json({
          ok: false,
          message: "Debe entrar por correo y contraseña"
        });
      } else {
        var token = jwt.sign({ doctor: doctorDB }, SEED, { expiresIn: 14400 }); // 4 horas
        
        res.status(200).json({
          ok: true,
          doctor: doctorDB,
          token: token,
          id: doctorDB._id
        });
      }
    } else {
      // El doctor no existe, se debe crear
      var doctor = new DoctorRuta();

      doctor.name = googleUser.name;
      doctor.email = googleUser.email;
      doctor.img = googleUser.img;
      doctor.google = true;
      doctor.password = ":)";

      doctor.save((err, doctorDB) => {
        var token = jwt.sign({ doctor: doctorDB }, SEED, { expiresIn: 14400 }); // 4 horas
        
        res.status(200).json({
          ok: true,
          doctor: doctorDB,
          token: token,
          id: doctorDB._id
        });
      });
    }
  });

  // return res.status(200).json({
  //  ok: true,
  //  message: "OK!",
  //  googleUser
  // });
});

// =======================
// Autenticación normal
// =======================

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
    doctorDB.password = ":)";
    var token = jwt.sign({ doctor: doctorDB }, SEED, { expiresIn: 14400 }); // 4 horas
    res.status(200).json({
      ok: true,
      doctor: doctorDB,
      token: token,
      id: doctorDB._id
    });
  });
});

module.exports = app;

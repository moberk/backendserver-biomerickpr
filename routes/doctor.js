var express = require("express");
var bcrypt = require("bcryptjs");
// var jwt = require("jsonwebtoken");

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();


var DoctorRuta = require("../models/doctor");

// ==========================
// Obtener todos los doctores
// ==========================
app.get("/", (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  //busca en la tabla de doctores, y muestra solo name, email, img, role
  DoctorRuta.find({}, "name email img role")
    .skip(desde)
    .limit(5)
    // ejecuta la instrucción
    .exec((err, doctores) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando usuarios",
          errors: err
        });
      }

      DoctorRuta.count({}, (err, conteo)=>{
        res.status(200).json({
          ok: true,
          doctores: doctores, //importante recalcar que ambos nombres de las variables no tienen relevancia
          total: conteo
        });
      });
      
    });
});



// ==========================
// Actualizar doctor
// ==========================
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  DoctorRuta.findById(id, (err, doctorEncontrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err
      });
    }
    if (!doctorEncontrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "El usuario con el ID" + id + "no existe",
        errors: { message: "No existe un usuario con ese ID" }
      });
    }
    doctorEncontrado.name = body.name;
    doctorEncontrado.email = body.email;
    doctorEncontrado.role = body.role;

    doctorEncontrado.save((err, doctorGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar usuario",
          errors: err
        });
      }
      doctorGuardado.password = ":)";

      res.status(200).json({
        ok: true,
        doctor: doctorGuardado
      });
    });
  });
});

// ==========================
// Crear un nuevo doctor
// ==========================
app.post("/", mdAutenticacion.verificaToken,(req, res) => {
  var body = req.body;

  // creamos una referencia a una variable de tipo doctor
  var doctor = new DoctorRuta({
    name: body.name,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  });

  // para guardar el objeto que creamos en las lineas anteriores
  doctor.save((err, doctorGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear usuario",
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      doctor: doctorGuardado,
      usuariotoken: req.doctor
    });
  });
});

// ==========================
// Eliminar un doctor por ID
// ==========================
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  DoctorRuta.findByIdAndRemove(id, (err, doctorBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar usuario",
        errors: err
      });
    }
    if (!doctorBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe un usuario con ese ID",
        errors: { message: "No existe un usuario con ese ID" }
      });
    }
    res.status(200).json({
      ok: true,
      doctor: doctorBorrado
    });
  });
});

module.exports = app;
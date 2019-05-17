var express = require("express");

var mdAutenticacion = require("../middlewares/autenticacion");

var app = express();

var PacienteRuta = require("../models/paciente");

// ==========================
// Obtener pacientes
// ==========================
app.get("/", (req, res, next)=>{
var desde = req.query.desde || 0;
desde = Number(desde);

    PacienteRuta.find({})
        .skip(desde)
        .limit(5)
        .populate('doctor', 'name email role')
        .populate('clasificacion')
        .exec((err, pacientes)=>{
        if (err){
            return res.status(500).json({
                ok: false,
                mensaje: "Error cargando pacientes",
                errors: err
            });
        }

        PacienteRuta.count({}, (err, conteo)=>{
            res.status(200).json({
                ok: true,
                pacientes: pacientes,
                total: conteo
            });

        });

        
    });

});


// ==========================
// Actualizar pacientes
// ==========================
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
  
    PacienteRuta.findById(id, (err, pacienteEncontrado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar paciente",
          errors: err
        });
      }
      if (!pacienteEncontrado) {
        return res.status(400).json({
          ok: false,
          mensaje: "El paciente con el ID: " + id + " no existe",
          errors: { message: "No existe un paciente con ese ID" }
        });
      }
      pacienteEncontrado.name = body.name;
      pacienteEncontrado.doctor = req.doctor._id;
      pacienteEncontrado.clasificacion = body.clasificacion
      
      pacienteEncontrado.save((err, pacienteGuardado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar clasificación",
            errors: err
          });
        }
  
        res.status(200).json({
          ok: true,
          paciente: pacienteGuardado
        });
      });
    });
  });

// ==========================
// Crear pacientes
// ==========================
app.post("/", mdAutenticacion.verificaToken,(req, res)=>{
    var body = req.body;

    var Paciente = new PacienteRuta({
        name: body.name,
        img: body.img,
        doctor: req.doctor._id,
        clasificacion: body.clasificacion
    });

    Paciente.save((err, pacienteGuardado)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear el paciente",
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            paciente: pacienteGuardado
        });
    });
});
// ==========================
// Eliminar pacientes
// ==========================
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
  
    PacienteRuta.findByIdAndRemove(id, (err, pacienteBorrado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al borrar paciente",
          errors: err
        });
      }
      if (!pacienteBorrado) {
        return res.status(400).json({
          ok: false,
          mensaje: "No existe un paciente con ese ID",
          errors: { message: "No existe un paciente con ese ID" }
        });
      }
      res.status(200).json({
        ok: true,
        paciente: paciente
      });
    });
  });

module.exports = app;
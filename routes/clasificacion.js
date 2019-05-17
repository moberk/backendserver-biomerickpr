var express = require("express");

var mdAutenticacion = require("../middlewares/autenticacion");

var app = express();

var ClasificacionRuta = require("../models/clasificacion");

// ==========================
// Obtener clasificaciones
// ==========================
app.get("/", (req, res, next) => {
var desde = req.query.desde || 0;
desde = Number(desde);
  //busca en la tabla de doctores, y muestra solo name, email, img, role
  ClasificacionRuta.find({})
    .skip(desde)
    .limit(5)
    .populate('doctor', 'name email role')
    .exec((err, clasificaciones) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error cargando clasificaciones",
        errors: err
      });
    }

    ClasificacionRuta.count({}, (err, conteo)=>{
        res.status(200).json({
            ok: true,
            clasificaciones: clasificaciones, //importante recalcar que ambos nombres de las variables no tienen relevancia
            total: conteo
        });
    });

    
  });
});

// ==========================
// Actualizar clasificaciones
// ==========================
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
  
    ClasificacionRuta.findById(id, (err, clasificacionEncontrada) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar clasificacion",
          errors: err
        });
      }
      if (!clasificacionEncontrada) {
        return res.status(400).json({
          ok: false,
          mensaje: "La clasificacion con el ID: " + id + " no existe",
          errors: { message: "No existe una clasificación con ese ID" }
        });
      }
      clasificacionEncontrada.name = body.name;
      clasificacionEncontrada.doctor = req.doctor._id;
     
  
      clasificacionEncontrada.save((err, clasificacionGuardada) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar clasificación",
            errors: err
          });
        }
  
        res.status(200).json({
          ok: true,
          clasificacion: clasificacionGuardada
        });
      });
    });
  });
// ==========================
// Crear clasificacion
// ==========================
app.post("/", mdAutenticacion.verificaToken,(req, res) => {
    var body = req.body;
  
    // creamos una referencia a una variable de tipo class (clasificacion)
    var Class = new ClasificacionRuta({
      name: body.name,
      doctor: req.doctor._id
    });
  
    // para guardar el objeto que creamos en las lineas anteriores
    Class.save((err, classGuardada) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al crear clasificación",
          errors: err
        });
      }
      res.status(201).json({
        ok: true,
        clasificacion: classGuardada
      });
    });
  });
  
// ==========================
// Eliminar clasificacion
// ==========================
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
  
    ClasificacionRuta.findByIdAndRemove(id, (err, clasificacionBorrada) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al borrar clasificación",
          errors: err
        });
      }
      if (!clasificacionBorrada) {
        return res.status(400).json({
          ok: false,
          mensaje: "No existe una clasificación con ese ID",
          errors: { message: "No existe una clasificación con ese ID" }
        });
      }
      res.status(200).json({
        ok: true,
        clasificacion: clasificacionBorrada
      });
    });
  });

module.exports = app;

var express = require('express');

var app = express();

var Clasificaciones = require('../models/clasificacion');
var Pacientes = require('../models/paciente');
var Doctores = require('../models/doctor');

// =====================
// Búsqueda general
// =====================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([buscarClasificaciones(busqueda, regex), buscarPacientes(busqueda,regex), buscarDoctores(busqueda,regex)])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                clasificaciones: respuestas [0],
                pacientes: respuestas [1],
                doctores: respuestas[2]
                });
        })

});


// =====================
// Búsqueda por colección
// =====================
app.get('/coleccion/:tabla/:busqueda', (req,res,next)=>{
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i')

    var promesa;

    switch(tabla){
        case 'doctores':
            promesa = buscarDoctores(busqueda,regex);
        break;

        case 'clasificaciones':
            promesa = buscarClasificaciones(busqueda,regex);
        break;

        case 'pacientes':
            promesa = buscarPacientes(busqueda,regex);
        break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son doctores, clasificacion y pacientes',
                error: {message: 'Tipo de colección no válido'}
            });
    }
    promesa.then(data =>{
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});



// =====================
// Funciones para la búsqueda
// =====================

function buscarClasificaciones(busqueda, regex) {
    return new Promise ((resolve, reject)=>{
        Clasificaciones.find({name: regex})
        .populate('doctor', 'name email')
        .exec((err, clasificacion)=>{
            if (err){
                reject('Error al cargar clasificaciones', err);
            }else{
                resolve(clasificacion);
            }
        });
    });
    
}

function buscarPacientes(busqueda, regex) {
    return new Promise ((resolve, reject)=>{
        Pacientes.find({name: regex})
            .populate('doctor', 'name email')
            .exec((err, paciente)=>{
            if (err){
                reject('Error al cargar pacientes', err);
            }else{
                resolve(paciente);
            }
        });
    });
    
}

function buscarDoctores(busqueda, regex) {
    return new Promise ((resolve, reject)=>{
        Doctores.find({}, 'name email role')
                .or([{'name': regex}, {'email': regex}])
                .exec((err,doctores)=>{
                    if(err){
                        reject('Error al cargar doctores',err);
                    }else{
                        resolve (doctores);
                    }
                })
    });
    
}
module.exports = app;
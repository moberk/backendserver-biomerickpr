var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');


var app = express();

var Doctor = require('../models/doctor');
var Paciente = require('../models/paciente');

app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colección
    var tiposValidos = ['doctores','pacientes'];
    if(tiposValidos.indexOf(tipo)<0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida',
            errors: {message: 'Tipo de colección no es válida'}
        });
    }

    if (!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono algun archivo',
            errors: {message: 'Debe selecciona una imagen'}
        });
    }
    // Obtener nombre del archivo

    var archivo = req.files.imagen;
    var nombreSplit = archivo.name.split('.');
    var extensionArchivo = nombreSplit [nombreSplit.length - 1];

    // Restricción de extensiones
    var extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];

    if(extensionesValidas.indexOf(extensionArchivo) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo pesonalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover archivo del temporal a un path en específico
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        //res.status(200).json({
        //    ok: true,
        //    mensaje: 'Archivo movido',
        //    extension: extensionArchivo
        // });
    });


   
});

function subirPorTipo (tipo, id, nombreArchivo, res){
    if(tipo === 'doctores'){
        Doctor.findById(id,(err, doctor)=>{
            if (!doctor) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Doctor no existe',
                    errors: { message: 'Doctor no existe' }
                });
            }
            
            
            var pathViejo = './uploads/doctores/' + doctor.img;
            // Si existe, elimina la imagen anterior
            if(fs.statSync(pathViejo).isFile()){
                fs.unlinkSync(pathViejo,(err)=>{
                    if(err){
                        return res.status(400).json({
                            ok: false,
                            message: 'Error al reemplazar imagen',
                            errors: err
                        });
                    }
                });
            }

            doctor.img = nombreArchivo;

            doctor.save((err, doctorActualizado)=>{

                doctorActualizado.password = ':)';

                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen de doctor',
                        errors: err
                    });
                }
                
                return res.status(200).json({
                ok: true,
                mensaje: 'Imagen de doctor actualizada',
                doctor: doctorActualizado
                });
            });
        });
    }

    if(tipo === 'pacientes'){
        Paciente.findById(id,(err, paciente)=>{
            if (!paciente) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Paciente no existe',
                    errors: { message: 'Paciente no existe' }
                });
            }
            
            
            var pathViejo = './uploads/pacientes/' + paciente.img;
            // Si existe, elimina la imagen anterior
            if(fs.statSync(pathViejo).isFile()){
                fs.unlinkSync(pathViejo,(err)=>{
                    if(err){
                        return res.status(400).json({
                            ok: false,
                            message: 'Error al reemplazar imagen',
                            errors: err
                        });
                    }
                });
            }

            paciente.img = nombreArchivo;

            paciente.save((err, pacienteActualizado)=>{

                pacienteActualizado.password = ':)';

                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen del paciente',
                        errors: err
                    });
                }
                
                return res.status(200).json({
                ok: true,
                mensaje: 'Imagen de paciente actualizada',
                doctor: pacienteActualizado
                });
            });
        });
    }

    
}


module.exports = app;
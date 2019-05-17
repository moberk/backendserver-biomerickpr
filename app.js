// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


// Inicializar variables
var app = express ();

// Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar rutas
var appRoutes = require ('./routes/app');
var doctorRoutes = require ('./routes/doctor');
var loginRoutes = require('./routes/login');
var clasificacionesRoutes = require('./routes/clasificacion');
var pacienteRoutes = require('./routes/paciente');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');


// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/biomerickprDB', (err, res) => {
    if(err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m' ,'online');
})


//======= Esto es para que puedan entrar a ver las imagenes por carpetas
// server index config
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
//app.use('/uploads', serveIndex(__dirname + '/uploads'));


// Rutas (middleware, esto es   algo que se ejecuta antes de que se resuelvan otras rutas)
app.use('/clasificaciones', clasificacionesRoutes);
app.use('/pacientes', pacienteRoutes);
app.use('/doctores', doctorRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/login', loginRoutes);
app.use('/upload', uploadRoutes)
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, ()=> {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m' ,'online');
});
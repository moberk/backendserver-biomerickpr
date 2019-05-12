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


// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/biomerickprDB', (err, res) => {
    if(err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m' ,'online');
})

// Rutas (middleware, esto es   algo que se ejecuta antes de que se resuelvan otras rutas)
app.use('/doctores', doctorRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, ()=> {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m' ,'online');
});
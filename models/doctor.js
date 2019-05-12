var mongoose = require ('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

// Funcion de mongoose que permite definir esquema
var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['DOCTOR_ROLE', 'ADMIN_ROLE', 'PATIENT_ROLE'],
    message: '{VALUE} no es un role permitido'
}


// Funcion que recibe un objeto de js con la config del esquema que definimos
var doctorSchema = new Schema({

    name: { type: String, required: [true, 'El nombre es necesario'] },
    email: {type: String, unique:true, required: [true, 'El correo es necesario']},
    password: {type: String, required: [true, 'La contraseña es necesaria']},
    img: {type: String, required: false},
    role: {type: String, required: true, default: 'PATIENT_ROLE', enum: rolesValidos}

});

doctorSchema.plugin(uniqueValidator, {message: '{PATH} debe ser único'});

// Exportamos el esquema para que lo usemos, nombre y objeto a usar
module.exports = mongoose.model('Doctor', doctorSchema);
// The first argument is the singular name of the collection your model is for. Mongoose automatically looks for the plural, lowercased version of your model name. 
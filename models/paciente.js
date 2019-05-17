var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pacienteSchema = new Schema({
    name: {type: String, required:[true, 'El nombre es obligatorio']},
    img:{type: String, required: false},
    doctor:{type: Schema.Types.ObjectId,ref:'Doctor', required: true},
    clasificacion:{type: Schema.Types.ObjectId, ref:'Clasificacion', required: [true,'El id de clasificacion es obligatorio']}
});

module.exports = mongoose.model('Paciente', pacienteSchema);
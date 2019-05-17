var mongoose = require ('mongoose');
var Schema = mongoose.Schema;

var classicationSchema = new Schema ({
    name: {type: String, required:[true, 'El nombre es necesario']},
    doctor: {type: Schema.Types.ObjectId, ref: 'Doctor'}
},{collection: 'classes'});

module.exports = mongoose.model('Clasificacion', classicationSchema);
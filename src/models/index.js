const mongoose = require('mongoose');

// Importar todos los esquemas
const User = require('./User');
const Artist = require('./Artist');
const Album = require('./Album');
const Genre = require('./Genre');
const Review = require('./Review');
const List = require('./List');

// Registrar todos los modelos con Mongoose
mongoose.model('User', User.schema);
mongoose.model('Artist', Artist.schema);
mongoose.model('Album', Album.schema);
mongoose.model('Genre', Genre.schema);
mongoose.model('Review', Review.schema);
mongoose.model('List', List.schema);

// Exportar los modelos para uso directo
module.exports = {
  User: mongoose.model('User'),
  Artist: mongoose.model('Artist'),
  Album: mongoose.model('Album'),
  Genre: mongoose.model('Genre'),
  Review: mongoose.model('Review'),
  List: mongoose.model('List')
};
const mongoose = require('mongoose');

// Nombre de la base de datos: teamflow_db
const URI = 'mongodb://localhost/teamflow_db';

mongoose.connect(URI)
    .then(db => console.log('DB is connected to teamflow_db'))
    .catch(err => console.error('Error connecting to DB:', err));

module.exports = mongoose;
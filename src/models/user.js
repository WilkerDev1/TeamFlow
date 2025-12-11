const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: 'https://ui-avatars.com/api/?background=random' }
});

// Encriptar contraseña antes de guardar
UserSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para comparar contraseñas
UserSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// IMPORTANTE: Esta línea es la que faltaba o estaba mal
module.exports = mongoose.model('User', UserSchema);
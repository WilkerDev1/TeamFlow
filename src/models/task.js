const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    // Estado crucial para el Kanban: Por hacer, En progreso, Hecho
    status: {
        type: String,
        enum: ['todo', 'progress', 'done'], 
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['baja', 'media', 'alta'],
        default: 'media'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', TaskSchema);
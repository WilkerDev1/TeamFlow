const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false // Opcional, para flexibilidad
    },
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
    project: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project' 
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', TaskSchema);
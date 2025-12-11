const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();

// 1. Conexión a Base de Datos
require('./database');

// 2. Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 3. Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false })); // Para recibir datos de formularios HTML
app.use(express.json()); // Para recibir JSON (útil para drag & drop futuro)

// 4. Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// 5. Rutas
const Task = require('./models/task');

// Ruta Principal: Renderiza el tablero
app.get('/', async (req, res) => {
    try {
        // Consultas separadas para organizar las columnas del Kanban
        const todos = await Task.find({ status: 'todo' });
        const inProgress = await Task.find({ status: 'progress' });
        const done = await Task.find({ status: 'done' });

        res.render('index', { 
            titulo: 'Team Flow - Tablero Scrum',
            todos,
            inProgress,
            done
        });
    } catch (error) {
        console.error(error);
        res.send("Error al cargar el tablero");
    }
});

// Ruta para crear tareas (POST)
app.post('/add', async (req, res) => {
    const task = new Task(req.body);
    await task.save();
    res.redirect('/');
});

// 6. Iniciar Servidor
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
    console.log(`Visita: http://localhost:${app.get('port')}`);
});
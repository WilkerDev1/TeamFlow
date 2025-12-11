const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');

// Modelos
const User = require('./models/user');
const Project = require('./models/project');
const Task = require('./models/task');

// Inicialización
const app = express();
require('./database');

// Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
    secret: 'teamflow_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Middleware de Autenticación Propio
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) return next();
    res.redirect('/login');
};

// Variable global para la vista (Usuario actual)
app.use(async (req, res, next) => {
    res.locals.user = req.session.userId ? await User.findById(req.session.userId) : null;
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// --- RUTAS ---

// AUTH (TF-001, TF-002)
app.get('/login', (req, res) => res.render('auth/login'));
app.get('/register', (req, res) => res.render('auth/register'));
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/login'); });

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.redirect('/login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await user.matchPassword(password)) {
        req.session.userId = user._id;
        res.redirect('/');
    } else {
        res.render('auth/login', { error: 'Credenciales inválidas' });
    }
});

// DASHBOARD (TF-003)
app.get('/', isAuthenticated, async (req, res) => {
    const projects = await Project.find({ 
        $or: [{ owner: req.session.userId }, { members: req.session.userId }] 
    }).populate('owner');
    res.render('dashboard', { projects });
});

app.post('/projects/add', isAuthenticated, async (req, res) => {
    const project = new Project({
        title: req.body.title,
        description: req.body.description,
        owner: req.session.userId,
        members: [req.session.userId]
    });
    await project.save();
    res.redirect('/');
});

// KANBAN BOARD (TF-004, TF-005, TF-010)
app.get('/project/:id', isAuthenticated, async (req, res) => {
    const project = await Project.findById(req.params.id).populate('members');
    
    // Filtro "Mis Tareas" (TF-010)
    let query = { project: project._id };
    if (req.query.filter === 'my') {
        query.assignedTo = req.session.userId;
    }

    const tasks = await Task.find(query).populate('assignedTo');
    
    // Clasificar tareas
    const todos = tasks.filter(t => t.status === 'todo');
    const progress = tasks.filter(t => t.status === 'progress');
    const done = tasks.filter(t => t.status === 'done');

    res.render('board', { project, todos, progress, done, filter: req.query.filter });
});

// CREAR TAREA (TF-004)
app.post('/project/:id/tasks/add', isAuthenticated, async (req, res) => {
    const task = new Task({
        ...req.body,
        project: req.params.id,
        assignedTo: req.body.assignedTo || req.session.userId // Asignar a uno mismo por defecto
    });
    await task.save();
    res.redirect(`/project/${req.params.id}`);
});

// DRAG AND DROP API (TF-006)
app.post('/api/tasks/move', isAuthenticated, async (req, res) => {
    const { taskId, newStatus } = req.body;
    await Task.findByIdAndUpdate(taskId, { status: newStatus });
    res.json({ success: true });
});

// ELIMINAR TAREA (TF-009)
app.get('/task/delete/:id/:projectId', isAuthenticated, async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.redirect(`/project/${req.params.projectId}`);
});

// Iniciar
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});
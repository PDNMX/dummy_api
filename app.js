var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var s1Router = require('./routes/s1');


// inicio declaraciones
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var ciudadesRouter = require('./routes/ciudades');
var entidadesRouter = require('./routes/entidades');
var estadoscivilesRouter = require('./routes/estadosciviles');
var regimenmatrimonialRouter = require('./routes/regimenmatrimonial');
var municipiosRouter = require('./routes/municipios');
var localidadesRouter = require('./routes/localidades');
var tipovialidadRouter = require('./routes/tipovialidad');
var declaracionesRouter = require('./routes/declaraciones');
//fin declaraciones


var app = express();
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/s1', s1Router);

// inicio declaraciones
app.use('/users', usersRouter);
app.use('/ciudades', ciudadesRouter);
app.use('/entidades', entidadesRouter);
app.use('/estadosciviles', estadoscivilesRouter);
app.use('/regimenmatrimonial', regimenmatrimonialRouter);
app.use('/municipios', municipiosRouter);
app.use('/localidades', localidadesRouter);
app.use('/tipovialidad', tipovialidadRouter);
app.use('/declaraciones', declaracionesRouter);
//fin declaraciones



module.exports = app;

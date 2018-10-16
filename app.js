const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const locationRoutes = require('./api/routes/locations');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Routes
app.use('/locations', locationRoutes);

//Catch
app.use((req, res, next) =>{
    const error = new Error('not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) =>{
    res.status(error.status || 500);
    res.json({
        error: error.message
    });
});

module.exports = app;
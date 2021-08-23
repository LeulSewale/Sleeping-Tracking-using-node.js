var express = require('express');
var routes = require('./routes');
var session = require('express-session');
var path = require('path');
var cons = require('consolidate');
var app = express();
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100 
});

app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(session({
    name: 'session',
    secret: 'my_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600 * 1000, // 1hr
    }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(routes);
app.use(helmet());
app.use(limiter);
app.use(express.static(path.join(__dirname, 'public')));
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
        message: err.message,
    });
});
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});
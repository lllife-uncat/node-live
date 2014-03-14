var express = require('express');
var app = express();
var mongoose = require('mongoose');
var path = require("path");

var db = require('./config/db');
var port = process.env.PORT || 8080;

require('./app/routes')(app);

app.configure(function () {
    app.use(express.static(path.join(__dirname, '/public')));
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
});


app.listen(port);
console.log('Magic happends on port ' + port);
exports = module.exports = app;

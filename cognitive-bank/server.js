var express = require('express');
var engine = require('ejs-locals');
var bodyParser = require("body-parser");

var app = express();
var routes = require('./routes');
var config = require('./lib/config');

app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

//Routes
app.get('/', routes.index);
app.post('/predict', routes.predict);

app.listen(process.env.PORT || config.port);
console.log(config.appname + " listening on port: " + (process.env.PORT || config.port));

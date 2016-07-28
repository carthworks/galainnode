var express = require('express');
var bodyParser = require('body-parser');
var session = require("express-session");

var app = express();

app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(session({resave: true, saveUninitialized: true, secret: 'avocadonode', cookie: { maxAge: null }}));
app.use('/assets',express.static(__dirname + "/public"));

app.use('/', require('./routes/loginController'));
app.use('/login', require('./routes/loginController'));
app.use('/logout', require('./routes/logoutController'));
app.use('/home', require('./routes/homeController'));
app.use('/clients', require('./routes/clientController'));
app.use('/device', require('./routes/deviceController'));
app.use('/ajax', require('./routes/ajaxController'));

app.listen(9090,function(){
	console.log('Galaxy Application listening on port 3000!');
});
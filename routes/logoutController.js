var express = require('express');
var router = express.Router();
var http = require("http");
var bodyParser = require('body-parser');

router.get('/',function(req,res){
	console.log(req.session.user);
	console.log(req.session.authToken);
	req.session.destroy();
	res.redirect('/login');
	alert('logging out');
});

module.exports = router;
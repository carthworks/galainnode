var express = require('express');
var router = express.Router();
var http = require("http");
var bodyParser = require('body-parser');

router.get('/',function(req,res){
		
	if(req.session.user){
		res.render('home',{"VarLogoImagePath":"","VarTenantName":""});
	} else {
		res.redirect('/login');
	}
});

module.exports = router;
var express = require('express');
var router = express.Router();
var http = require("http");
var bodyParser = require('body-parser');

var APPCONF = require('../configs/appconfig');
var APICONF = require('../configs/apiproperties');

var service = require('../routes/serviceController');

router.get('/*',function(req,res){
	console.log('Ajax GET Method Request');
	var VarRequestUri = req.params[0];
	var ObjQuery = req.query;
	var VarServicePath = service.FnBuildServiceUrl(VarRequestUri, ObjQuery);
	var VarInputData = '';
	service.FnMakeRequestCall('GET',VarServicePath,VarInputData,req,res);	
});

module.exports = router;
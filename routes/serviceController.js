var express = require('express');
var router = express.Router();
var http = require("http");
var bodyParser = require('body-parser');

var APPCONF = require('../configs/appconfig');
var APICONF = require('../configs/apiproperties');

var service = function(){

	var FnBuildServiceUrl = function(VarRequestUri, ObjQuery){
		var ArrQuery = [];
		for(var key in ObjQuery){
			if(ObjQuery.hasOwnProperty(key)){
				ArrQuery.push(key + '=' + ObjQuery[key]);
			}
		}
		var VarQryStr = ArrQuery.join('&');
		VarQryStr = (VarQryStr != '') ? '?' + VarQryStr : '';
		return '/' + VarRequestUri + VarQryStr;
	}
	
	var FnMakeRequestCall = function(VarMethod, VarServicePath, VarInput, req, res){
		var VarBasicAuthCode = req.session.authToken;
		
		var options = {
			hostname: APICONF.server.host,
			port: APICONF.server.port,
			path: VarServicePath,
			method: VarMethod,
			headers: {
			  'Content-Type': 'application/json',
			  'Accept' : 'application/json',
			  'Authorization' : 'Bearer '+ VarBasicAuthCode
			}
		};
		
		var xhr = http.request(options, function(xhrres) {
			//console.log('Status: ' + xhrres.statusCode);
			//console.log('Headers: ' + JSON.stringify(xhrres.headers));
			var body = "";
			xhrres.on('data', function (resData) {
				body += resData;
			});
			xhrres.on('end', function() {
				res.json(JSON.parse(body));
			});
		});
	
		xhr.on('error', function(e) {
		  console.log('problem with request: ' + e.message);
		});
		// write data to request body
		xhr.write(VarInput);
		xhr.end();
	}
	
	var FnMakeGetRequestCall = function(VarApiServicePath, req, res){
		var VarEndPointUrl = (APICONF.server.scheme) + "://" + (APICONF.server.host) + ":" + (APICONF.server.port);
		var VarApiUrl = VarEndPointUrl + VarApiServicePath;
		var VarBasicAuthCode = req.session.authToken;
		console.log(VarApiUrl);
		var VarResponse = '';
		request.get(VarApiUrl,{'auth': {'bearer': VarBasicAuthCode}},function(error,response,body){
			if (!error && response.statusCode == 200) {
				console.log(body);
				res.json(JSON.parse(body));
			}
		});
		
	}
		
	return {
        FnBuildServiceUrl: FnBuildServiceUrl,
		FnMakeRequestCall : FnMakeRequestCall
    }

}();

module.exports = service;
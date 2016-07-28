var express = require('express');
var router = express.Router();
var http = require("http");
var bodyParser = require('body-parser');

var APPCONF = require('../configs/appconfig');
var APICONF = require('../configs/apiproperties');

router.get('/',function(req,res){
	console.log(req.session.user);
	console.log(req.session.authToken);
	if(req.session.user){
		res.redirect('/home');
	} else {
		res.render('login',{"message":"","APPCONF":APPCONF,"APICONF":APICONF});
	}
});

router.post('/',function(req,res){
	console.log(JSON.stringify(req.body));
	var VarPostData = {"userName":req.body.username+".galaxy","password":req.body.password};
	console.log(VarPostData);
	var options = {
					hostname: '10.234.31.158',
					port: 9763,
					path: '/avocado-user-management-1.0.0/services/um/authenticate',
					method: 'POST',
					headers: {
					  'Content-Type': 'application/json',
					  'Accept' : 'application/json'
					}
				};
				
	var xhr = http.request(options, function(xhrres) {
			console.log('Status: ' + xhrres.statusCode);
			console.log('Headers: ' + JSON.stringify(xhrres.headers));
			xhrres.on('data', function (body) {
				console.log(JSON.parse(body));
				var ObjResponse = JSON.parse(body);
				if(ObjResponse['accessToken'] != null && ObjResponse['userName'] != null){
					var ObjUser = {
						"name": ObjResponse['userName'],
						"domain" : ObjResponse['tenant']['currentDomain'],
						"username" : ObjResponse['userName'],
						"roles" : ObjResponse['roleNames'],
						"expiresin" : ObjResponse['expireIn'],
						"permissions" : ObjResponse['premissions'],
						"tenantName" : ObjResponse['tenant']['tenantName'],
						"tenantId" : ObjResponse['tenant']['tenantId'],
						"tenantDomain" : ObjResponse['tenant']['currentDomain'],
						"parentDomain" : ObjResponse['tenant']['domainName']
					};
					console.log(req.session.authToken);
					req.session.user = ObjUser;
					req.session.authToken = ObjResponse['accessToken'];
					//var ObjParent = {"tenantName":ObjResponse['tenant']['tenantName'],"tenantDomain":ObjResponse['tenant']['currentDomain'],"parentDomain":ObjResponse['tenant']['domainName'],"tenantId":ObjResponse['tenant']['tenantId']};
					//req.session.PARENT_CLIENT = ObjParent;
					
					if((ObjResponse['roleNames']).indexOf(APPCONF.SUPER_ADMIN_ROLE) != -1){
						console.log('Super Admin');		
						console.log(req.session.authToken);
						res.redirect('/home');
					} else if((ObjResponse['roleNames']).indexOf(APPCONF.CLIENT_ADMIN_ROLE) != -1){
						console.log('Tenant Admin');
						res.redirect('/clienthome');
					} else {
						console.log('Normal User');
						res.redirect('/userhome');
					}
				} else {
					res.render('login',{"message":"Invalid credentials. Please try again.","APPCONF":APPCONF,"APICONF":APICONF});
				}
			});
	});
	
	xhr.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	// write data to request body
	xhr.write(JSON.stringify(VarPostData));
	xhr.end();
	
});

module.exports = router;
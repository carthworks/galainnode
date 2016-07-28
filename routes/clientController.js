var express = require('express');
var router = express.Router();
var http = require("http");
var bodyParser = require('body-parser');

var APPCONF = require('../configs/appconfig');
var APICONF = require('../configs/apiproperties');

router.get('/list',function(req,res){
	if(req.session.user){
		console.log('-------Client List---------');
		console.log(req.session.tenantinfo);
		if(req.session.tenantinfo){
			
		} else {
			var ObjUserInfo = req.session.user;
			var VarCurrentTenantInfo = {'tenantName':ObjUserInfo.tenantName,'tenantDomain':ObjUserInfo.tenantDomain,'parentDomain':ObjUserInfo.parentDomain,'tenantId':ObjUserInfo.tenantId};
		}		
		res.render('clients/list',{'APPCONF': APPCONF,'APICONF' :APICONF,'VarCurrentTenantInfo': VarCurrentTenantInfo});
	} else {
		res.redirect('/login');
	}
});

router.get('/create',function(req,res){
	if(req.session.user){
		console.log('-------Client Create---------');
		if(req.session.tenantinfo){
			
		} else {
			var ObjUserInfo = req.session.user;
			var VarCurrentTenantInfo = {'tenantName':ObjUserInfo.tenantName,'tenantDomain':ObjUserInfo.tenantDomain,'parentDomain':ObjUserInfo.parentDomain,'tenantId':ObjUserInfo.tenantId};
		}
		res.render('clients/add',{'APPCONF': APPCONF,'APICONF' :APICONF,'VarCurrentTenantInfo': VarCurrentTenantInfo});
	} else {
		res.redirect('/login');
	}
});

module.exports = router;
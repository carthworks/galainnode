"use strict";

class tenantinfoclass {

	constructor(ObjTenantInfo){
		
		this.tenantName	=	ObjTenantInfo.tenantName;
		this.tenantDomain	=	ObjTenantInfo.tenantDomain;
		this.parentDomain	=	ObjTenantInfo.parentDomain;
		this.tenantId	=	ObjTenantInfo.tenantId;
	}
	
	getTenantName(){
		return this.tenantName;
	}
	
	getTenantDomain(){
		return this.tenantDomain;
	}
	
	getParentDomain(){
		return this.parentDomain;
	}
	
	getTenantId(){
		return this.tenantId;
	}
	
}
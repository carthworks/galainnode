"use strict";
$(document).ready(function(){
	
	// Form Validation
	$("#gapp-adduser-form").kendoValidator({
		validateOnBlur : true,
		errorTemplate: "<span class='help-block'><code>#=message#</code></span>",
		rules : {
			available:function(input){
				var validate = input.data('available');
				var VarExist = true;
				if (typeof validate !== 'undefined' && validate !== false) {
					var url = input.data('available-url');
					var VarParam = {"domain": {"domainName": VarCurrentTenantInfo.tenantDomain},"fieldValues": [{"key": "userName","value": FnTrim(input.val())}]};
					$.ajax({
						type:'POST',
						cache: true,
						async: false,
						contentType: 'application/json; charset=utf-8',
						url: GblAppContextPath+"/ajax" + url,
						data: JSON.stringify(VarParam),
						dataType: 'json',
						success: function(result) {
							//console.log(result);
							var ObjExistStatus = result;
							
							if(ObjExistStatus.status == 'SUCCESS'){ // Exist in db
								VarExist = true;
							} else if(ObjExistStatus.status == 'FAILURE') { // Does not exist in db
								VarExist = false;
							}
						},
						error : function(xhr, status, error) {
						
						}
					});
				}
				return VarExist;
			}
		},
		messages : {
			available: function(input) { 
				return input.data("available-msg");
			}
		}
	});
	
	$("#roleName").kendoMultiSelect({
		dataTextField : "name",
		dataValueField : "name",
		animation: false,
		placeholder: "Select Roles...",
		enable: true
	});
	FnGetRoleList();
	
	//---For name-tag List--//
		$("#name-tag-placeholder").kendoMultiSelect({
			dataTextField : "name",
			dataValueField : "value",
			animation: false,
			enable: true
		});
		FnGetTagList();
	//---//
	
	if(VarEditUserId != ''){
		FnGetUserDetails(VarEditUserId);
	}
	
	$('#gapp-user-save').prop('disabled', true);
	FnCheckEmptyFrmFields('#userName, #lastName, #emailId, #roleName', '#gapp-user-save');	
	
	$("#user-image").change(function(){
		readURL(this,$(this).attr('id'));			
        
    });
	
});

function FnGetTagList(){
	var VarUrl = GblAppContextPath+'/ajax' + VarFetchAllTagsUrl;
	//alert(VarUrl);
	var VarMainParam = {
	  "actorType": "TEMPLATE",
	  "actor": {
		"template": {
		  "domain": {
			"domainName": VarCurrentTenantInfo.tenantDomain
		  },
		  "entityTemplateName": "DefaultUser",
		  "platformEntityType": "USER"
		}
	  }
	};
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResTagList);	
}
function FnResTagList(response){
	var ArrResponse = response;
	var ArrResData = [];
	if($.isArray(ArrResponse)){
		$.each(ArrResponse,function(key,val){
			var ObjRole = {};
				ObjRole.name = val.name;
				ObjRole.value = val.name;
				ObjRole.tagType = val.tagType;
			ArrResData.push(ObjRole);
			/*
			var ObjRole = {};
			$.each(val.dataprovider,function(key,val){ 
				if(val.key == 'name'){
					ObjRole.name = val.value;
					ObjRole.value = val.value;
				}
			});
			ObjRole.Identifier = val.identifier.value;
			ObjRole.entityTemplateName = val.entityTemplate.entityTemplateName;
			ArrResData.push(ObjRole);
			*/
		});
	}	
	
	var dataNameTag = $("#name-tag-placeholder").data("kendoMultiSelect");
	dataNameTag.setDataSource(ArrResData);
}

function readURL(input,id) {
	var ArrAllowedImgTypes = ["image/jpeg","image/png","image/gif"];
	var VarImageType = input.files[0]['type'];
	if(ArrAllowedImgTypes.indexOf(VarImageType) != -1){
		if (input.files && input.files[0]) {
			var reader = new FileReader();			
			reader.onload = function (e) {
				$('#user-image-preview').attr('src', e.target.result);
				$('#user-image-preview').css('background-color','whitesmoke');
			}			
			reader.readAsDataURL(input.files[0]);
		}		
	} else {
		alert('Invalid File');		
	}
}

function FnGetFormFieldValues(VarFrmId,VarAllowCond){
	var ArrFieldValuesJSONObj = {};
	$('#'+VarFrmId).find(VarAllowCond).each(function(){
		
		var VarFieldName = $(this).attr('name');
		var VarFieldValue = FnTrim($(this).val());		
		
		if (!(typeof VarFieldValue === "undefined") && VarFieldValue!='' ) {
			if ($(this).is("[type='text']") || $(this).is("[type='email']") || $(this).is("[type='url']"))  {
				ArrFieldValuesJSONObj[VarFieldName] = VarFieldValue;
			} else if($(this).is("select")){
				if($(this).attr('multiple') == undefined){
					ArrFieldValuesJSONObj[VarFieldName] = FnTrim($(this).find('option:selected').text());
				} else {						
					var ArrVal = VarFieldValue.split(',');
					ArrFieldValuesJSONObj[VarFieldName] = addslashes(JSON.stringify(ArrVal));
				}
			} else if($(this).is("[type='checkbox']")){
				if($(this).is(':checked') == true){
					ArrFieldValuesJSONObj[VarFieldName] = VarFieldValue;
				}
			}		
			
		}
	});
	
	return ArrFieldValuesJSONObj;
}

function addslashes(str) {
	str = str.replace(/\'/g, "\\'");
	//str = str.replace(/\\/g, '\\\\');
	//str = str.replace(/\'/g, '\'');
	//str = str.replace(/\"/g, '\\"');
	//str = str.replace(/\0/g, '\\0');
	return str;

}

function stripslashes(str) {
	str = str.replace(/\"/g, '"');
    //str = str.replace(/\\'/g, '\'');
    //str = str.replace(/\\0/g, '\0');
    //str = str.replace(/\\\\/g, '\\');
    return str;
}

function FnSaveUser(){

	$('#gapp-user-save, #gapp-user-cancel').attr('disabled',true);
	var validator = $("#gapp-adduser-form").data("kendoValidator");
	validator.hideMessages();
	$("#GBL_loading").show();
	if (validator.validate()) { 
	
		if(VarEditUserId == ''){ // Create User		
			var VarUrl = GblAppContextPath+'/ajax' + VarCreateUserUrl;
			var VarParam = {};
			var VarStatus = false;
			$("input[name='statusName']").each(function(){				
				if($(this).is(':checked') == true && $(this).val()=='ACTIVE'){
					VarStatus = true;
				}
			});
			
			VarParam = FnGetFormFieldValues("gapp-adduser-form","input[type=text],input[type=email],select");
			VarParam['emailLink']= VarAPPServerPath+'/resetpassword';
			VarParam['domain'] = VarCurrentTenantInfo.tenantDomain;	
			VarParam['active'] = VarStatus;
			FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResSaveUser);
		
		} else { // Update User
		
			var VarUrl =GblAppContextPath+ '/ajax' + VarUpdateUserUrl;
			VarUrl = VarUrl.replace("{user_name}",VarEditUserId);
			VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
			var VarParam = {};
			
			var VarStatus = false;
			$("input[name='statusName']").each(function(){				
				if($(this).is(':checked') == true && $(this).val()=='ACTIVE'){
					VarStatus = true;
				}
			});
					
			VarParam = FnGetFormFieldValues("gapp-adduser-form","input[type=text],input[type=email],select");
			VarParam['active'] = VarStatus;
			delete VarParam['userName']; 
			
			FnMakeAsyncAjaxRequest(VarUrl, 'PUT', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResUpdateUser);
		
		}
		
	} else {
		$('#gapp-user-save, #gapp-user-cancel').attr('disabled',false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

var GblObjUserResponse;
function FnResSaveUser(response){
	
	var ObjResponse = response;
	
	//Global response for tagging
	GblObjUserResponse = response;
	
	$('#gapp-user-save, #gapp-user-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	
	if(!$.isEmptyObject(ObjResponse)){
		
		if(ObjResponse.errorCode == undefined){
		
			var ObjImageFile = $("#user-image").prop("files")[0];
			if(!$.isEmptyObject(ObjImageFile)){ // Upload User Image
				
				var options = {
							url:GblAppContextPath+"/upload/user",
							success:FnResImageUpload
				};
				
				$('#gapp-adduser-form').ajaxSubmit(options);
			}

			
			/*
			 *------------START: Save geo tag ------------*
			 */
			var ObjResForGeoTag = response;
			var VarGeoLatitude  = $('#tag-latitude').val();
			var VarGeoLongitude = $('#tag-longitude').val();
			
			if((VarGeoLatitude =="" && VarGeoLongitude=="") || (VarGeoLatitude =='null' && VarGeoLongitude=='null') || (undefined == VarGeoLatitude && undefined==VarGeoLongitude)){ //no geo tag
				 if(undefined == $('#name-tag-placeholder').find('option:selected').val() || $('#name-tag-placeholder').find('option:selected').val()=='' || $('#name-tag-placeholder').find('option:selected').val() == 'null'){
					//No Name tags
					notificationMsg.show({
						message : 'User added successfully'
					}, 'success');
					FnFormRedirect('gapp-user-list',GBLDelayTime);
					
				 }else{
					 FnSaveNameTagDetails(GblObjUserResponse);
				 }
				 
			}else if(VarGeoLatitude !="" && VarGeoLongitude!=""){
				var VarUrl = GblAppContextPath+'/ajax' + VarCreateGeoTagUrl;
				var VarMainParam = {
					"entity": {
						"domain": {
							"domainName": ObjResForGeoTag.domain.domainName
						},
						"identifier": {
							"key": ObjResForGeoTag.identifier.key,
							"value": ObjResForGeoTag.identifier.value
						},
						"entityTemplate": {
							"entityTemplateName": ObjResForGeoTag.entityTemplate.entityTemplateName
						}
					},
					"geotag": {
						"latitude": VarGeoLatitude,
						"longitude":  VarGeoLongitude
					}
				};
				//FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResCreateGeoTag);
				FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResCreateGeoTag);
				
			} 
						
		} else {
			notificationMsg.show({
				message : ObjResponse['errorMessage']
			}, 'error');
		}
		
	} else {
		notificationMsg.show({
			message : 'Error'
		}, 'error');
	}
	
}




function FnResCreateGeoTag(response){
	var ObjResForGeoTag = response;
	if(!$.isEmptyObject(ObjResForGeoTag)){
		if(ObjResForGeoTag.errorCode == undefined){
			
			if(undefined == $('#name-tag-placeholder').find('option:selected').val() || $('#name-tag-placeholder').find('option:selected').val()=='' || $('#name-tag-placeholder').find('option:selected').val() == 'null'){

				notificationMsg.show({
					message : 'User added and tagged successfully'
				}, 'success');

				FnFormRedirect('gapp-user-list',GBLDelayTime);

			}else{
				FnSaveNameTagDetails(GblObjUserResponse);
			}	


		}else{
			
			if(undefined == $('#name-tag-placeholder').find('option:selected').val() || $('#name-tag-placeholder').find('option:selected').val()=='' || $('#name-tag-placeholder').find('option:selected').val() == 'null'){
				/*
				notificationMsg.show({
				message : 'User added successfully'
				}, 'success');
				*/
				notificationMsg.show({
					message : ObjResForGeoTag['errorMessage']
				}, 'error');
				
				FnFormRedirect('gapp-user-list',GBLDelayTime);	
			} else{
				
				notificationMsg.show({
					message : ObjResForGeoTag['errorMessage']
				}, 'error');
				
				FnSaveNameTagDetails(GblObjUserResponse);
				
			}
			
			
		}
		
	}else {

		notificationMsg.show({
			message : 'Error in Tagging'
		}, 'error');
		FnFormRedirect('gapp-user-list',GBLDelayTime);	
	}
	
	
}

function FnSaveNameTagDetails(GblObjUserResponse){
	var ObjResponse = GblObjUserResponse
	
	var roles = $("#name-tag-placeholder").data("kendoMultiSelect");
	var ArrFieldValuesJSONObj = [];
	$('#name-tag-placeholder :selected').each(function(i, selected) {

		var ObjFieldMap = {};
		/*
		ObjFieldMap["platformEntity"] = {"platformEntityType" : "MARKER"};
		ObjFieldMap["domain"] = {"domainName": VarCurrentTenantInfo.tenantDomain};
		ObjFieldMap["entityTemplate"] = {"entityTemplateName": roles.dataItem(selected.index).entityTemplateName};
		ObjFieldMap["identifier"] = {"key": "identifier", "value": roles.dataItem(selected.index).Identifier};
		*/
		ObjFieldMap["name"] = roles.dataItem(selected.index).name;
		ObjFieldMap["tagType"] = roles.dataItem(selected.index).tagType;
		ObjFieldMap["domain"] = {"domainName": VarCurrentTenantInfo.tenantDomain};
		ArrFieldValuesJSONObj.push(ObjFieldMap);
		
	});
				
	var VarMainParam = {
	  "tags": ArrFieldValuesJSONObj,
	   "entity": 
			{
			  
			  "platformEntity": {
			  "platformEntityType": "USER"
				},
			  "domain": {
				"domainName": VarCurrentTenantInfo.tenantDomain
			  },
			  "entityTemplate": {
				"entityTemplateName": "DefaultUser"
			},
			  "identifier": {
				"key": ObjResponse.identifier.key,
				"value": ObjResponse.identifier.value
			  }
			}
		 
	};
			
			
   var VarUrl = GblAppContextPath+'/ajax' + VarMapTagsEntities;		

   FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResNameTagDetails);

}

			
		
	

function FnResNameTagDetails(ObjResponse){
	
	if(!$.isEmptyObject(ObjResponse)){
		if(ObjResponse.errorCode == undefined){
			if(ObjResponse.status == 'SUCCESS'){
				notificationMsg.show({
				message : 'User added and tagged successfully'
				}, 'success');

				FnFormRedirect('gapp-user-list',GBLDelayTime);
	
			}else {
				notificationMsg.show({
				message : 'Error in Tagging'
				}, 'error');
				
				FnFormRedirect('gapp-user-list',GBLDelayTime);
			}

		}else{
			notificationMsg.show({
			message : ObjResponse['errorMessage']
			}, 'error');

			FnFormRedirect('gapp-user-list',GBLDelayTime);
		}
		
	}else{
		notificationMsg.show({
			message : 'Error in Tagging'
		}, 'error');
		
		FnFormRedirect('gapp-user-list',GBLDelayTime);
	}
	
}



function FnUpdateNameTagDetails(GblObjUserResponse){
	var ObjResponse = GblObjUserResponse
	
	var VarDataCheckFlag = false;
	var roles = $("#name-tag-placeholder").data("kendoMultiSelect");
	var ArrFieldValuesJSONObj = [];
	$('#name-tag-placeholder :selected').each(function(i, selected) {
		
		if(undefined === $("#name-tag-placeholder_listbox .k-item")[$(selected).index()].disabled){
			VarDataCheckFlag = true;
			var ObjFieldMap = {};
			/*
			ObjFieldMap["platformEntity"] = {"platformEntityType" : "MARKER"};
			ObjFieldMap["domain"] = {"domainName": VarCurrentTenantInfo.tenantDomain};
			ObjFieldMap["entityTemplate"] = {"entityTemplateName": roles.dataItem(selected.index).entityTemplateName};
			ObjFieldMap["identifier"] = {"key": "identifier", "value": roles.dataItem(selected.index).Identifier};
			*/
			ObjFieldMap["name"] = roles.dataItem(selected.index).name;
			ObjFieldMap["tagType"] = roles.dataItem(selected.index).tagType;
			ObjFieldMap["domain"] = {"domainName": VarCurrentTenantInfo.tenantDomain};
			
			ArrFieldValuesJSONObj.push(ObjFieldMap);
		}	
	});
	
	if(VarDataCheckFlag){
		var VarMainParam = {
		  "tags": ArrFieldValuesJSONObj,
		   "entity": 
				{
				  
				  "platformEntity": {
				  "platformEntityType": "USER"
					},
				  "domain": {
					"domainName": VarCurrentTenantInfo.tenantDomain
				  },
				  "entityTemplate": {
					"entityTemplateName": "DefaultUser"
				},
				  "identifier": {
					"key": ObjResponse.identifier.key,
					"value": ObjResponse.identifier.value
				  }
				}
			 
		};

		var VarUrl = GblAppContextPath+'/ajax' + VarMapTagsEntities;	
		
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResUpdateNameTagDetails);
		
	}else{
		notificationMsg.show({
				message : 'User details updated successfully'
				}, 'success');

				FnFormRedirect('gapp-user-list',GBLDelayTime);
	}
	


}





	function FnResUpdateNameTagDetails(ObjResponse){
		
		if(!$.isEmptyObject(ObjResponse)){

			if(ObjResponse.errorCode == undefined){
				if(ObjResponse.status == 'SUCCESS'){
					notificationMsg.show({
					message : 'User and tag details updated successfully'
					}, 'success');

					FnFormRedirect('gapp-user-list',GBLDelayTime);

				}else {
					notificationMsg.show({
					message : 'Error in Tagging'
					}, 'error');

					FnFormRedirect('gapp-user-list',GBLDelayTime);
				}

			}else{
				notificationMsg.show({
					message : ObjResponse['errorMessage']
				}, 'error');

				FnFormRedirect('gapp-user-list',GBLDelayTime);
			}

		}else{
			notificationMsg.show({
			message : 'Error in Tagging'
			}, 'error');

			FnFormRedirect('gapp-user-list',GBLDelayTime);
		}
	}

function FnResUpdateUser(response){
	var ObjResponse = response;
	GblObjUserResponse = response;
	$('#gapp-user-save, #gapp-user-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	if(!$.isEmptyObject(ObjResponse)){
		
		if(ObjResponse.errorCode == undefined){
		
			var ObjImageFile = $("#user-image").prop("files")[0];
			if(!$.isEmptyObject(ObjImageFile)){ // Upload User Image
				
				var options = {
					url:GblAppContextPath+"/upload/user",
					success:FnResImageUpload
				};
				$("#gapp-adduser-form :input").prop("disabled", false);
				$("#form-gapp-tag-management :input").prop("disabled", false);
				
				$('#gapp-adduser-form').ajaxSubmit(options);
			}
			
			var ObjResForGeoTag = response;
			var VarGeoLatitude  = $('#tag-latitude').val();
			var VarGeoLongitude = $('#tag-longitude').val();
			
			if((VarGeoLatitude =="" && VarGeoLongitude=="") || (VarGeoLatitude =='null' && VarGeoLongitude=='null') || (undefined == VarGeoLatitude && undefined==VarGeoLongitude)){ //no geo tag
				 if(undefined == $('#name-tag-placeholder').find('option:selected').val() || $('#name-tag-placeholder').find('option:selected').val()=='' || $('#name-tag-placeholder').find('option:selected').val() == 'null'){
					//No Name tags
					notificationMsg.show({
						message : 'User updated successfully'
					}, 'success');
					FnFormRedirect('gapp-user-list',GBLDelayTime);
					
				 }else{
					 //FnSaveNameTagDetails(GblObjUserResponse);
					  FnUpdateNameTagDetails(GblObjUserResponse);
				 }
				 
			}else if(VarGeoLatitude !="" && VarGeoLongitude!=""){
				var VarUrl = GblAppContextPath+'/ajax' + VarUpdateGeoTagUrl;
				var VarMainParam = {
					"entity": {
						"domain": {
							"domainName": $('#tag-domain-name').val()
						},
						"identifier": {
							"key": $('#tag-identifier-key').val(),
							"value": $('#tag-identifier-value').val()
						},
						"entityTemplate": {
							"entityTemplateName": $('#tag-entity-template-name').val()
						}
					},
					"geotag": {
						"latitude": VarGeoLatitude,
						"longitude":  VarGeoLongitude
					}
				};
				
				if($('#tag-update-flag').val() == 'true'){
					//alert('PUT');
					FnMakeAjaxRequest(VarUrl, 'PUT', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResUpdateGeoTag);
				}else{
					//alert('POST');
					FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResUpdateGeoTag);
				}      
				
				
			} 

		} else {
			notificationMsg.show({
				message : ObjResponse['errorMessage']
			}, 'error');
		}
		
	} else {
		notificationMsg.show({
			message : 'Error'
		}, 'error');
	}
}

function FnResUpdateGeoTag(response){
	var ObjResponse = response;
	var ObjResForGeoTag = response;
	if(!$.isEmptyObject(ObjResponse)){
		if(ObjResponse.errorCode == undefined){
			
			if(undefined == $('#name-tag-placeholder').find('option:selected').val() || $('#name-tag-placeholder').find('option:selected').val()=='' || $('#name-tag-placeholder').find('option:selected').val() == 'null'){
				notificationMsg.show({
					message : 'User and tag details updated successfully'
				}, 'success');

				FnFormRedirect('gapp-user-list',GBLDelayTime);

			}else{
				FnUpdateNameTagDetails(GblObjUserResponse);
			}	


		}else{
			
		
			
			if(undefined == $('#name-tag-placeholder').find('option:selected').val() || $('#name-tag-placeholder').find('option:selected').val()=='' || $('#name-tag-placeholder').find('option:selected').val() == 'null'){
				notificationMsg.show({
					message : 'User updated successfully'
				}, 'success');
				
				notificationMsg.show({
					message : ObjResForGeoTag['errorMessage']
				}, 'error');
				
				FnFormRedirect('gapp-user-list',GBLDelayTime);	
			} else{
				
				notificationMsg.show({
					message : ObjResForGeoTag['errorMessage']
				}, 'error');
				
				FnUpdateNameTagDetails(GblObjUserResponse);
				
			}

			
		}
	}else {

		notificationMsg.show({
			message : 'Error in Tagging'
		}, 'error');
		FnFormRedirect('gapp-user-list',GBLDelayTime);	
	}
	
}



function FnResImageUpload(response,status){
	$('#user-image').val('');
}

function FnCancelUser(){
		
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-user-list');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-user-list').submit();
	}
	
}

function FnNavigateUserList(){
	$('#gapp-user-list').submit();
}

function FnGetRoleList(){
	var VarUrl = GblAppContextPath+'/ajax' + VarListRoleUrl;
	VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResRoleList);
}

function FnResRoleList(response){
	var ArrResponse = response;
	var ArrResData = [];
	if(ArrResponse.errorCode == undefined){
		$.each(ArrResponse,function(key,obj){
			var ObjRole = {};
			ObjRole.name = obj.roleName;
			ArrResData.push(ObjRole);
		});
	}
	var roles = $("#roleName").data("kendoMultiSelect");
	roles.setDataSource(ArrResData);
}

function FnGetUserDetails(VarUserName){	
	var VarUrl = GblAppContextPath+'/ajax' + VarViewUserUrl;
	VarUrl = VarUrl.replace("{user_name}",VarUserName);
	VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResUserDetails);
	
}

function FnResUserDetails(response){
	var ArrResponse = response;
	
	if(!$.isEmptyObject(ArrResponse)){
		$("#gapp-adduser-form :input").prop("disabled", true);
		
		$('#gapp-user-save').attr('disabled',true);
		$("#gapp-user-cancel").prop("disabled", false);
	
		$.each(ArrResponse['fieldValues'],function(key,obj){
			
			if($('#gapp-adduser-form #'+obj['key'])){
				if(obj['key'] == 'roleName'){				
					var multiselect = $("#roleName").data("kendoMultiSelect");
					try {
						var ArrUR = JSON.parse(stripslashes(obj['value']));
						if(ArrUR.length == 0){
							if(VarAppSuperAdminRole === VarLoggerUserRole){
								var ArrUR = [VarAppSuperAdminRole];
								throw ArrUR;
							}
						} else {
							var ArrURNew = ArrUR;
						}
					} catch(err){
						var ArrURNew = err;
					}
					
					multiselect.value(ArrURNew);
					multiselect.enable(false);
					
				} else {
					$('#gapp-adduser-form #'+obj['key']).val(obj['value']);
				}
			}
		});
		
		if(ArrResponse['entityStatus']['statusName'] == 'ACTIVE'){
			$('#gapp-adduser-form #statusName_active').attr('checked',true);
		} else {
			$('#gapp-adduser-form #statusName_inactive').attr('checked',true);
		}
	

		//---Find geo-tag---//	
		$("#form-gapp-tag-management :input").prop("disabled", true);
		
		$('#tag-domain-name').val(response.domain.domainName);
		$('#tag-identifier-key').val(response.identifier.key);
		$('#tag-identifier-value').val(response.identifier.value);
		$('#tag-entity-template-name').val(response.entityTemplate.entityTemplateName);
		
		var VarUrl = GblAppContextPath+'/ajax' + VarFindGeoTagUrl;
		
		var VarMainParam = {
			"domain": {
				"domainName": response.domain.domainName
			},
			"identifier": {
				"key": response.identifier.key,
				"value": response.identifier.value
			},
			"entityTemplate": {
				"entityTemplateName": response.entityTemplate.entityTemplateName
			}
		};
		
		FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResFindGeoTag);
		
		//---//		
		
		//---Find name-tags---//	
		
		var VarUrl = GblAppContextPath+'/ajax' + VarFetchAllTagsUrl;
		
		var VarMainParam ={
			  "actorType": "ENTITY",
			  "actor": {
				"entity": {
				  "platformEntity": {
					"platformEntityType": "USER"
				  },
				  "domain": {
					"domainName": response.domain.domainName
				  },
				  "entityTemplate": {
					"entityTemplateName": "DefaultUser"
				  },
				  "identifier": {
					"key": response.identifier.key,
					"value": response.identifier.value
				  }
				}
			  }
			};
		
		FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResFindNameTags);
		
		
		//---//		
		
	}	
}

function FnResFindGeoTag(response){
	var ObjResponse = response;
	if(!$.isEmptyObject(ObjResponse)){
		if(ObjResponse.errorCode == undefined){
			//console.log(ObjResponse);
	
			//$('#tag-latitude-display-value').html(ObjResponse.geotag.latitude);
			//$('#tag-longitude-display-value').html(ObjResponse.geotag.longitude);
			$('#tag-latitude-longitude-display-value').html(ObjResponse.geotag.latitude+' , '+ObjResponse.geotag.longitude);
			
			$('#gllpLatitude').val(ObjResponse.geotag.latitude);
			$('#gllpLongitude').val(ObjResponse.geotag.longitude);
			$('#tag-update-flag').val("true");	
		}
	}
}

function FnResFindNameTags(response){
	var ArrResponse = response;
	var ArrResData = [];
	
	var name_tag_multiselect = $("#name-tag-placeholder").data("kendoMultiSelect");
	
	if($.isArray(ArrResponse)){
		var arrVal=[];
		$.each(ArrResponse,function(key,val){
			arrVal.push(val.name);
			/*	
			$.each(val.dataprovider,function(key,val){		
					if(val.key == 'name'){					
						arrVal.push(val.value);			
					}
			});
			*/	
		});
		//console.log(arrVal);
		
		name_tag_multiselect.value(arrVal);
		
		$('#name-tag-placeholder :selected').each(function(i, selected) {
			$("#name-tag-placeholder_listbox .k-item")[$(selected).index()].disabled = true;
				//$("#roleName_listbox .k-item").addClass("k-state-disabled");
			$(".k-multiselect-wrap.k-floatwrap").find('.k-icon.k-i-close').remove();
				//$(".k-multiselect-wrap.k-floatwrap").find('.k-button').addClass("k-state-disabled");
			$(".k-multiselect-wrap.k-floatwrap").find('.k-select').remove();
		});
		
		$('#nametag-update-flag').val("true");
	}
	name_tag_multiselect.enable(false);	
}

function FnEditUser(){	
	$("#gapp-adduser-form :input").prop("disabled", false);
	var roles = $("#roleName").data("kendoMultiSelect");
	roles.enable(true);
	$('#caption-display-subject').text('Edit User');
	$('#caption-display-breadcrumb').text('Edit User');
	$('#userName').prop("disabled", true);
	$("#gapp-user-save").prop("disabled", false);
	$('#gapp-user-edit').hide();
	
	//geo tag: label change // name-tag enable
	$("#form-gapp-tag-management :input").prop("disabled", false);
	if($('#tag-update-flag').val() == 'true'){
		$('#geo-tag-label').html('Update Tag');
	}
	
	var name_tags = $("#name-tag-placeholder").data("kendoMultiSelect");
	name_tags.enable(true);
}
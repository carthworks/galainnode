"use strict";

$(document).ready(function(){
		
	// Form Validation
	$("#gapp-addclient-form").kendoValidator({
											validateOnBlur : true,
											errorTemplate: "<span class='help-block'><code>#=message#</code></span>",
											rules : {
												available:function(input){
													var validate = input.data('available');
													var VarExist = true;
													if (typeof validate !== 'undefined' && validate !== false) {
														var url = input.data('available-url');
														if (input.is('[name=tenantId]')) {
															$('#tenantId').val((input.val()).toLowerCase());
															var VarParam = {"domain": {"domainName": VarCurrentTenantInfo.tenantDomain},"fieldValues": [{"key": "tenantId","value": FnTrim((input.val()).toLowerCase())}],"uniqueAcross":"Application"};
														}
														
														$.ajax({
															type:'POST',
															cache: true,
															async: false,
															contentType: 'application/json; charset=utf-8',
															url: GblAppContextPath+"/ajax" + url,
															data: JSON.stringify(VarParam),
															dataType: 'json',
															success: function(result) {
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
	
	FnGetFeaturesList();
	$('#tenantFeatures').multiSelect({
		selectableHeader: "<div class='features-header'>Features Available</div>",
		selectionHeader: "<div class='features-header'>Features Selected</div>",
		
	});
	
	
	//---For name-tag --//
	$("#name-tag-placeholder").kendoMultiSelect({
		dataTextField : "name",
		dataValueField : "value",
		animation: false,
		enable: true
	});
	FnGetTagList();
	//---//
	
	

	$('#gapp-client-save').prop('disabled', true);
	FnCheckEmptyFrmFields('#tenantName, #tenantId, #firstName, #lastName, #contactEmail', '#gapp-client-save');
	
	$("#client-logo").change(function(){
		readURL(this,$(this).attr('id'));			
        
    });
	
   
	if(VarEditClientId != '' && VarEditClientId != 'null'){
			FnGetClientDetails(VarEditClientId);
		}
	
	
	
});

function FnGetFeaturesList(){
	var VarUrl2 = GblAppContextPath+'/ajax' + VarListFeaturesUrl;
	VarUrl2 	   = VarUrl2.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
	FnMakeAjaxRequest(VarUrl2, 'GET', '', 'application/json; charset=utf-8', 'json', FnResFeaturesList);	
}

function FnResFeaturesList(response){
	
	
	var ArrResponse = response;
	var ArrResData = [];
	var select = document.getElementById("tenantFeatures");
	if($.isArray(ArrResponse)){
		$.each(ArrResponse,function(key,val){
			var option = document.createElement('option');
			option.value = val;
			option.text = val;
			if(val == 'Geo-service Management' || val == 'Tag Management' || val == 'Tenant Management' || val == 'User Management'){
				option.selected = val;
				option.style="pointer-events: none;opacity:0.8"; 
			}
			select.add(option,null);	
		});
	}	
	var my_options = $("#tenantFeatures option");
	
	my_options.sort(function(a,b) {
		if (a.text > b.text && a.value!="") return 1;
		else if (a.text < b.text && a.value!="") return -1;
		else return 0
	})
	$("#tenantFeatures").append(my_options);
}

function FnGetTagList(){
	var VarUrl = GblAppContextPath+'/ajax' + VarFetchAllTagsUrl;
	var VarMainParam = {
	  "actorType": "TEMPLATE",
	  "actor": {
		"template": {
		  "domain": {
			"domainName": VarCurrentTenantInfo.tenantDomain
		  },
		  "entityTemplateName": "DefaultTenant",
		  "platformEntityType": "TENANT"
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
			/*$.each(val.dataprovider,function(key,val){ 
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
				$('#client-logo-preview').attr('src', e.target.result);
				$('#client-logo-preview').css('background-color','whitesmoke');
			}			
			reader.readAsDataURL(input.files[0]);
		}		
	} else {
		alert('Invalid File');		
	}
	
}

function FnGetFormFieldValues(VarFrmId,VarAllowCond){
	var ArrFieldValuesJSONObj = [];
	$('#'+VarFrmId).find(VarAllowCond).each(function(){
		var ObjFieldMap = {};
		var VarFieldName = $(this).attr('name');
		var VarFieldValue = FnTrim($(this).val());
		if (!(typeof VarFieldValue === "undefined") && VarFieldValue!='') {
			if ($(this).is("[type='text']") || $(this).is("[type='email']") || $(this).is("[type='url']")) {
				ObjFieldMap["key"] = VarFieldName;
	            ObjFieldMap["value"] = VarFieldValue;
			}
			
			ArrFieldValuesJSONObj.push(ObjFieldMap);
		}
	});
	
	return ArrFieldValuesJSONObj;
}

function FnGetClientTemplates(){
	var ArrTemplates = [];
	var ArrTmp = VarClientTemplates.split(',');
	$.each(ArrTmp,function(key,template){
		var element = {};
		element['entityTemplateName'] = template;
		element['platformEntityType'] = "MARKER";
		ArrTemplates.push(element);
	});
	return ArrTemplates;
}

function FnSaveClient(){
	/*
	var VarArrTenantFeatures = $.map(VarObjTenantFeatures, function(value, index) {
		return [value];
	});
	*/
	
	$('#gapp-client-save, #gapp-client-cancel').attr('disabled',true);
	var validator = $("#gapp-addclient-form").data("kendoValidator");
	validator.hideMessages();
	$("#GBL_loading").show();
	
	if (validator.validate()) {
		if(VarEditClientId == ''){ // Create Client
			var VarUrl = GblAppContextPath+'/ajax' + VarCreateClientUrl;
			var VarParam = {};
			var VarStatus = 'ACTIVE';
			$("input[name='statusName']").each(function(){
				if($(this).is(':checked') == true){
					VarStatus = $(this).val();
				}
			});
			
			
			VarParam["domain"] = {"domainName" : VarCurrentTenantInfo.tenantDomain};			
			VarParam['entityStatus'] = {"statusName" : VarStatus};
			VarParam['fieldValues'] = FnGetFormFieldValues("gapp-addclient-form","input[type=text],input[type=email]");
			var ObjImageFile = $("#client-logo").prop("files")[0];
			if(!$.isEmptyObject(ObjImageFile)){
				var VarImageName = '';
				var VarClientId = FnTrim($('#tenantId').val());
				VarImageName = VarClientId +'.png';			
				VarParam['fieldValues'].push({"key":"image","value":VarImageName});				
			}
			//VarParam['templates'] = FnGetClientTemplates();
			var VarObjTenantFeatures = $('#tenantFeatures').val();
			VarParam['features'] = VarObjTenantFeatures;
			
			FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResSaveClient);
		} else { // Update Client
				
			var VarUrl = GblAppContextPath+'/ajax' + VarUpdateClientUrl;
			VarUrl = VarUrl.replace("{tenant_id}",VarEditClientId);
			VarUrl = VarUrl.replace("{domain}",GblClientDomain);
			var VarParam = {};
			var VarStatus = 'ACTIVE';
			$("input[name='statusName']").each(function(){
				if($(this).is(':checked') == true){
					VarStatus = $(this).val();
				}
			});
			VarParam['domain'] = {"domainName" : VarCurrentTenantInfo.tenantDomain};
			VarParam['entityStatus'] = {"statusName" : VarStatus};
			VarParam['fieldValues'] = FnGetFormFieldValues("gapp-addclient-form","input[type=text],input[type=email]");
			//console.log(JSON.stringify(VarParam));
			//return false;
			FnMakeAsyncAjaxRequest(VarUrl, 'PUT', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResUpdateClient);
		}
		
	} else {
		$('#gapp-client-save, #gapp-client-cancel').attr('disabled',false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

var GblObjUserResponse;
function FnResSaveClient(response){	
	var ObjResponse = response;
	GblObjUserResponse = response;
	$('#gapp-client-save, #gapp-client-cancel').attr('disabled',false);
	$("#GBL_loading").hide();

	if(!$.isEmptyObject(ObjResponse)){
		if(ObjResponse.errorCode == undefined){
			var ObjImageFile = $("#client-logo").prop("files")[0];
			if(!$.isEmptyObject(ObjImageFile)){ // Upload Client Logo
				
				var options = {
							url:GblAppContextPath+"/upload/client",
							success:FnResImageUpload
				};
				
				$('#gapp-addclient-form').ajaxSubmit(options);
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
						message : 'Client added successfully'
					}, 'success');

					FnFormRedirect('gapp-client-list',GBLDelayTime);
					
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
					message : 'Client added and tagged successfully'
				}, 'success');

				FnFormRedirect('gapp-client-list',GBLDelayTime);

			}else{
				FnSaveNameTagDetails(GblObjUserResponse);
			}	


		}else{
			
			if(undefined == $('#name-tag-placeholder').find('option:selected').val() || $('#name-tag-placeholder').find('option:selected').val()=='' || $('#name-tag-placeholder').find('option:selected').val() == 'null'){
				/*
				notificationMsg.show({
				message : 'Client added successfully'
				}, 'success');
				*/
				notificationMsg.show({
					message : ObjResForGeoTag['errorMessage']
				}, 'error');
				
				FnFormRedirect('gapp-client-list',GBLDelayTime);
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
		FnFormRedirect('gapp-client-list',GBLDelayTime);
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
			  "platformEntityType": "TENANT"
				},
			  "domain": {
				"domainName": VarCurrentTenantInfo.tenantDomain
			  },
			  "entityTemplate": {
				"entityTemplateName": "DefaultTenant"
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
				message : 'Client  added and tagged successfully'
				}, 'success');

				FnFormRedirect('gapp-client-list',GBLDelayTime);
	
			}else {
				notificationMsg.show({
				message : 'Error in Tagging'
				}, 'error');
				
				FnFormRedirect('gapp-client-list',GBLDelayTime);
			}

		}else{
			notificationMsg.show({
			message : ObjResponse['errorMessage']
			}, 'error');

			FnFormRedirect('gapp-client-list',GBLDelayTime);
		}
		
	}else{
		notificationMsg.show({
			message : 'Error in Tagging'
		}, 'error');
		
		FnFormRedirect('gapp-client-list',GBLDelayTime);
	}
	
}





function FnResUpdateClient(response){
	var ArrResponse = response;
	GblObjUserResponse = response;
	$('#gapp-client-save, #gapp-client-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	if(ArrResponse.status == 'SUCCESS'){
		var ObjImageFile = $("#client-logo").prop("files")[0];
		if(!$.isEmptyObject(ObjImageFile)){ // Upload Client Logo
			var options = {
						url:GblAppContextPath+"/upload/client",
						success:FnResImageUpload
			};
			$("#gapp-addclient-form :input").prop("disabled", false);
			$('#gapp-addclient-form').ajaxSubmit(options);
		}
		
		//Update geo-tag
		var ObjResForGeoTag = response;
			var VarGeoLatitude  = $('#tag-latitude').val();
			var VarGeoLongitude = $('#tag-longitude').val();
			
			if((VarGeoLatitude =="" && VarGeoLongitude=="") || (VarGeoLatitude =='null' && VarGeoLongitude=='null') || (undefined == VarGeoLatitude && undefined==VarGeoLongitude)){ //no geo tag
				 if(undefined == $('#name-tag-placeholder').find('option:selected').val() || $('#name-tag-placeholder').find('option:selected').val()=='' || $('#name-tag-placeholder').find('option:selected').val() == 'null'){
					//No Name tags
					notificationMsg.show({
						message : 'Client updated successfully'
					}, 'success');
					FnFormRedirect('gapp-client-list',GBLDelayTime);
					
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
			message : ArrResponse['errorMessage']
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
					message : 'Client and tag details updated successfully'
				}, 'success');

				FnFormRedirect('gapp-client-list',GBLDelayTime);

			}else{
				FnUpdateNameTagDetails(GblObjUserResponse);
			}	


		}else{
			
		
			
			if(undefined == $('#name-tag-placeholder').find('option:selected').val() || $('#name-tag-placeholder').find('option:selected').val()=='' || $('#name-tag-placeholder').find('option:selected').val() == 'null'){
				notificationMsg.show({
					message : 'Client updated successfully'
				}, 'success');
				
				notificationMsg.show({
					message : ObjResForGeoTag['errorMessage']
				}, 'error');
				
				FnFormRedirect('gapp-client-list',GBLDelayTime);
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
		FnFormRedirect('gapp-client-list',GBLDelayTime);	
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
				  "platformEntityType": "TENANT"
					},
				  "domain": {
					"domainName": VarCurrentTenantInfo.tenantDomain
				  },
				  "entityTemplate": {
					"entityTemplateName": "DefaultTenant"
				},
				  "identifier": {
					"key": $('#tag-identifier-key').val(),
					"value": $('#tag-identifier-value').val()
				  }
				}
		 
		 
		};

		var VarUrl = GblAppContextPath+'/ajax' + VarMapTagsEntities;	
		
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResUpdateNameTagDetails);
		
	}else{
		notificationMsg.show({
				message : 'Client details updated successfully'
				}, 'success');

				FnFormRedirect('gapp-client-list',GBLDelayTime);
	}
	


}

	function FnResUpdateNameTagDetails(ObjResponse){
		
		if(!$.isEmptyObject(ObjResponse)){

			if(ObjResponse.errorCode == undefined){
				if(ObjResponse.status == 'SUCCESS'){
					notificationMsg.show({
					message : 'Client and tag details updated successfully'
					}, 'success');

					FnFormRedirect('gapp-client-list',GBLDelayTime);

				}else {
					notificationMsg.show({
					message : 'Error in Tagging'
					}, 'error');

					FnFormRedirect('gapp-client-list',GBLDelayTime);
				}

			}else{
				notificationMsg.show({
					message : ObjResponse['errorMessage']
				}, 'error');

				FnFormRedirect('gapp-client-list',GBLDelayTime);
			}

		}else{
			notificationMsg.show({
			message : 'Error in Tagging'
			}, 'error');

			FnFormRedirect('gapp-client-list',GBLDelayTime);
		}
	}

function FnResImageUpload(response,status){
	$('#client-logo').val('');
}

function FnCancelClient(){
		
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-client-list');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-client-list').submit();
	}
}

function FnNavigateClientList(){
	$('#gapp-client-list').submit();
}

function FnGetClientDetails(VarClientId){
	$("#gapp-addclient-form :input").prop("disabled", true);
	$('#gapp-client-save').attr('disabled',true);
	$("#gapp-client-cancel").prop("disabled", false);
	var VarUrl = GblAppContextPath+'/ajax' + VarViewClientUrl;
	VarUrl = VarUrl.replace("{tenant_id}",VarClientId);
	VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);	
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResClientDetails);
	
	
}

var GblClientDomain = '';
function FnResClientDetails(response){
	var ArrResponse = response;
	if(!$.isEmptyObject(ArrResponse)){
		$.each(ArrResponse['fieldValues'],function(key,obj){
			if($('#gapp-addclient-form #'+obj['key'])){
				$('#gapp-addclient-form #'+obj['key']).val(obj['value']);
			}
			
			if(obj['key'] == 'domain'){
				GblClientDomain = obj['value'];
			}
			
		});
		
		if(ArrResponse['entityStatus']['statusName'] == 'ACTIVE'){
			$('#gapp-addclient-form #statusName_active').attr('checked',true);
		} else {
			$('#gapp-addclient-form #statusName_inactive').attr('checked',true);
		}
		
		//---Find assigned features--//
		var VarUrl2 = GblAppContextPath+'/ajax' + VarListFeaturesUrl;
		VarUrl2     = VarUrl2.replace("{domain}",GblClientDomain);
		
		FnMakeAjaxRequest(VarUrl2, 'GET', '', 'application/json; charset=utf-8', 'json', FnResSavedFeaturesList);
		//---//
		
		//---Find geo-tag//	
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
					"platformEntityType": "TENANT"
				  },
				  "domain": {
					"domainName": response.domain.domainName
				  },
				  "entityTemplate": {
					"entityTemplateName": "DefaultTenant"
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
			/*$.each(val.dataprovider,function(key,val){	
				if(val.key == 'name'){
					arrVal.push(val.value);
					
				}
			});*/			
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

function FnResSavedFeaturesList(response){
	var ArrResponse = response;
	var ArrSaveFeatureData = [];
	if($.isArray(ArrResponse)){
		$.each(ArrResponse,function(key,val){
			ArrSaveFeatureData.push(val)
		});
		
		$("#tenantFeatures > option").each(function() {
			if($.inArray(this.value, ArrSaveFeatureData) >= 0){
				$(this).attr("selected","selected");
			}
		});
	}	
	$('#tenantFeatures').multiSelect('refresh');
	/*
	$( "#tenantFeatures" ).prop( "disabled", true );
	$('.ms-selectable').css({"pointer-events": "none","opacity": 0.8});
	*/
}

function FnEditClient(){
	$("#gapp-addclient-form :input").prop("disabled", false);
	$("#gapp-client-save").prop("disabled", false);
	$('#tenantId').prop("disabled", true);
	$('.pageTitleTxt').text('Edit Client');
	$('#gapp-client-edit').hide();
	
	//geo tag: label change // name-tag enable
	$("#form-gapp-tag-management :input").prop("disabled", false);
	if($('#tag-update-flag').val() == 'true'){
		$('#geo-tag-label').html('Update Tag');
	}
	
	var name_tags = $("#name-tag-placeholder").data("kendoMultiSelect");
	name_tags.enable(true);

}

function FnAllowAlphaNumericSmallcaseOnly(e) {
	var keyCode = e.keyCode == 0 ? e.charCode : e.keyCode;
	return (keyCode == 43 || (keyCode >= 48 && keyCode <= 57)
			|| (keyCode >= 97 && keyCode <= 122) || (ArrSpecialKeys
			.indexOf(e.keyCode) != -1 && e.charCode != e.keyCode));
}
"use strict";

$(document).ready(function(){
	$('#fieldsSection').hide();
	$('#fContainer').hide();
	
	FnGetPoiTypes();	
	$('#gapp-asset-save').prop('disabled', true);
	
	
	$('#deviceLocModel').click(function(){
	$('#draggable').modal('show');
//$("#draggable").css("z-index", "9999999999");
	setTimeout(
		  function() {					  
						$(".gllpLatlonPicker").each(function() {
							$(document).gMapsLatLonPicker().init( $(this) );
						});				  
					
					}, 1000);

});
		
	if(VarEditAssetId == ''){		
		$('#gapp-poi-delete').hide();
		
	} else{		
		$('#gapp-poi-delete').show();		
	}
	//$('#gapp-asset-save, #gapp-asset-cancel').attr('disabled',false);

	// Form Validation
	$("#gapp-asset-form").kendoValidator({
										validateOnBlur : true,
										errorTemplate: "<span class='help-block'><code>#=message#</code></span>",
										rules : {
											available:function(input){
												var validate = input.data('available');
												var VarExist = true;
												if (typeof validate !== 'undefined' && validate !== false) {
													var VarThisFieldValue = FnTrim(input.val());
													if(VarEditAssetId != '' && VarThisFieldValue === GblEditAssetName){
														return VarExist;
													}
													
													var url = input.data('available-url');
													var VarParam = {"domain": {"domainName": VarCurrentTenantInfo.tenantDomain},"fieldValues": [{"key": "poiName","value": VarThisFieldValue}]};
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
															if(ObjExistStatus.status == 'SUCCESS'){ // Does not exist in db 
																VarExist = true;
															} else if(ObjExistStatus.status == 'FAILURE') { // Exist in db
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
	
		
	if(VarEditAssetId != ''){
		FnGetAssetDetails(VarEditAssetId);
	}

	$('#gapp-asset-save').prop('disabled', true);
	FnCheckEmptyFrmFields('#poiName, #poiType,#latitude, #longitude, #poiRadius ', '#gapp-asset-save');

	$("#asset-logo").change(function(){
		readURL(this,$(this).attr('id'));			
        
    });
});

function readURL(input,id) {
	var ArrAllowedImgTypes = ["image/jpeg","image/png","image/gif"];
	var VarImageType = input.files[0]['type'];
	if(ArrAllowedImgTypes.indexOf(VarImageType) != -1){
		if (input.files && input.files[0]) {
			var reader = new FileReader();			
			reader.onload = function (e) {
				$('#asset-logo-preview').attr('src', e.target.result);
				$('#asset-logo-preview').css('background-color','whitesmoke');
			}			
			reader.readAsDataURL(input.files[0]);
		}		
	} else {
		alert('Invalid File');		
	}
	
}

function FnGetPoiTypes(){	
	var VarUrl = GblAppContextPath+'/ajax' + VarListTemplateUrl + "?domain_name="+ VarCurrentTenantInfo.tenantDomain;
	//console.log('ll >'+VarUrl);
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResPoiTypes);
}

function FnResPoiTypes(response){
	//console.log(response);
	var ArrResponse = response;
	if(!$.isEmptyObject(ArrResponse)){
		
			if($.isArray(ArrResponse)){
				var VarPoiTypesTxt = '<option value=""> Please select POI type </option>';
				$.each(ArrResponse,function(key,val){
					VarPoiTypesTxt += '<option value="'+val.poiType+'">'+val.poiType+'</option>';
				});
				$('#poiType').html(VarPoiTypesTxt);
			}
		
		
	}
	

	
}

/*   create poi : POI type change dropdown*/
function FnGetAssetFields(){
	var VarAssetType = $('#poiType').val();
	if(VarAssetType != ''){
		var VarUrl = GblAppContextPath+'/ajax' + VarViewTemplateUrl + "?domain_name="+ VarCurrentTenantInfo.tenantDomain;
		VarUrl = VarUrl.replace("{poi_type_name}",VarAssetType);
		FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResAssetFields);
	} else {
		$('#fieldsContainer').html('');
		$('#fieldsSection').hide();
	}
}

function FnResAssetFields(response){
	var ObjResponse = response;
	if(!$.isEmptyObject(ObjResponse)){
		$('#fieldsSection').show();
		var VarAssetFieldTxt = '';
		var VarTabIndex = 4;
		$.each(ObjResponse.poiTypeValues,function(key,val){
			
			VarAssetFieldTxt += '<div class="form-group form-md-line-input col-md-6"><input type="text" class="form-control input-sm" name="'+val+'" id="'+val+'" tabindex="'+VarTabIndex+'"/><label class="col-md-12 control-label capitalize" for="'+val+'"> '+val+' </label><div class="form-control-focus"></div></div>';
			
			VarTabIndex++;
		});
		$('#fieldsContainer').html(VarAssetFieldTxt);
	} else {
		if(ArrResponse.errorCode != undefined){
			FnShowNotificationMessage(ArrResponse);
		}
	}

}

var GblAssetTypeId = '';
var GblEditAssetName = '';
function FnGetAssetDetails(VarAssetIdentifier){
	$("#GBL_loading").show();	
	var VarUrl = GblAppContextPath+'/ajax' + VarViewAssetUrl;
	var VarParam = {};
	VarParam['domain'] = {"domainName" : VarCurrentTenantInfo.tenantDomain};
	VarParam['entityTemplate'] = {"entityTemplateName" : "Poi"};
	VarParam['identifier'] = {"key": "identifier","value": VarAssetIdentifier};
	FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResAssetDetails);
}

function FnResAssetDetails(response){
	$("#GBL_loading").hide();
	var ArrResponse = response;
	//console.log(JSON.stringify(ArrResponse));	
	//{"errorCode":"500","errorMessage":"Requested data is not available"}
	
	if(!$.isEmptyObject(ArrResponse)){
		
		if(ArrResponse.errorCode == undefined){
			//alert('no error');
			$('#gapp-asset-form #poiName').val(ArrResponse['poiName']);
			$('#gapp-asset-form #poiType').val(ArrResponse['poiType']);
			$('#gapp-asset-form #description').val(ArrResponse['description']);
			$('#gapp-asset-form #latitude').val(ArrResponse['latitude']);
			$('#gapp-asset-form #longitude').val(ArrResponse['longitude']);
			$('#gapp-asset-form #poiRadius').val(ArrResponse['radius']);		
			GblAssetTypeId = ArrResponse['poiTypeIdentifier']['value'];
			GblEditAssetName = ArrResponse['poiName'];
			
			var VarStatus = ArrResponse['status'];
			
			if(ArrResponse['status'] == 'ACTIVE'){
				$('#gapp-asset-form #status_active').attr('checked',true); console.log(ArrResponse.status);
			} else {
				$('#gapp-asset-form #status_inactive').attr('checked',true); console.log(ArrResponse.status);
			}
		
		
			/*
			var lat=$("#gllpLatitude").val();
			var long=$("#gllpLongitude").val();
			lat =precise_round(lat,7);
			long =precise_round(long,7);
			*/
			$('#gllpLatitude').val(ArrResponse['latitude']);
			$('#gllpLongitude').val(ArrResponse['longitude']);
		
			var VarAssetFieldTxt = '';
			var VarTabIndex = 4;
			$.each(ArrResponse['poiTypeValues'],function(key,obj){
				if(obj['key'] != 'identifier'){
					var VarValue = (obj['value'] != undefined) ? obj['value'] : '';
					VarAssetFieldTxt += '<div class="form-group form-md-line-input col-md-4"><input type="text" class="form-control input-sm" name="'+obj['key']+'" id="'+obj['key']+'" tabindex="'+VarTabIndex+'" value="'+VarValue+'"/><label class="col-md-12 control-label capitalize" for="'+obj['key']+'"> '+obj['key']+' </label><div class="form-control-focus"></div></div>';
					
					VarTabIndex++;
				}
			});
			
			$('#fieldsContainer').html(VarAssetFieldTxt);
			$('#fieldsSection').show();
			
			$("#gapp-asset-form :input").prop("disabled", true);
			$('#gapp-asset-save').attr('disabled',true);
			$("#gapp-asset-cancel").prop("disabled", false);
			
			var ArrPoints = [];
			if(ArrResponse['points'] != undefined){
				$.each(ArrResponse['points'],function(){
					var element = {};
					$(this.dataprovider).each(function() {
						var key = this.key;
						var value = ((this.value != undefined)? this.value : "");
						element[key] = value;
					});
					element["identifier"] = this.identifier.value;
					element["status"] = this.entityStatus.statusName;
					ArrPoints.push(element);
				});
			}
			
			FnDisplayAssetImage(ArrResponse['assetName']);		
			FnResAssetPointList(ArrPoints);
		
			
		} 
		else{			
			notificationMsg.show({
				message : ArrResponse['errorMessage']
			}, 'error');
			FnFormRedirect('gapp-asset-list',GBLDelayTime);
			
		}

	}	
}

function FnDisplayAssetImage(VarAssetName){
	var ObjImage = new Image;
	ObjImage.src= GblAppContextPath + VarAppImagePath + "/" + VarCurrentTenantInfo.tenantDomain + VarAppAssetImagePath + "/" + VarAssetName+".png";
	ObjImage.onload=function(){
		$('#asset-logo-preview').attr('src',ObjImage.src);
		$('#asset-logo-preview').css('background-color','whitesmoke');
	}
	ObjImage.onerror=function(){
		//$('#asset-logo-preview').attr('src',GblAppContextPath + VarAppImagePath + VarAppDefaultImagePath + VarAppAssetImagePath + "/" + "assets.jpg");
		$('#asset-logo-preview').attr('src','');
	}
}

function FnCheckForUnitless(VarUnit){		
	if (VarUnit =='unitless') {VarUnit=' - '};
	return VarUnit;
}

function FnResAssetPointList(ArrPoints){
		
	var ArrColumns = [{field: "pointId",title: "Point Id"},{field: "pointName",title: "Point Name"},{field: "dataSourceName",title: "Data Source Id"},{field: "dataType",title: "Data Type"},{field: "physicalQuantity",title: "Physical Quantity"},{field: "unit",title: "Unit of Measurement",template :"#: FnCheckForUnitless(unit)#"}];
	var ObjGridConfig = {
		"scrollable" : false,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : false,
		"editable": false
	};
	
	
	var objDatasource = {};
	objDatasource['data']=ArrPoints;
	objDatasource['sort']={field: "pointId", dir: "asc"}
	
	var dataSource = new kendo.data.DataSource({
		  data: ArrPoints,
		  schema   : {
				model: {
					pointId : "pointId",
					fields: {
						pointId        : { type: 'string' },
						pointName      : { type: 'string' },
						dataSourceName : { type: 'string' },
						dataType       : { type: 'string' },
						physicalQuantity: { type: 'string' },
						unit : { type: 'string' }
					}
				}
			}
		});
	
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-assetpoint-list',objDatasource,ArrColumns,ObjGridConfig);
			
}

function FnGetAssetFieldValues(){
	var ArrFieldValuesJSONObj = [];
	$('#fieldsContainer').find('input[type=text]').each(function(){
		var ObjFieldMap = {};
		var VarFieldName = $(this).attr('name');
		var VarFieldValue = FnTrim($(this).val());
		if (!(typeof VarFieldValue === "undefined")) {
			if ($(this).is("[type='text']")){
				ObjFieldMap["key"] = VarFieldName;
				ObjFieldMap["value"] = VarFieldValue;
			}
			
			ArrFieldValuesJSONObj.push(ObjFieldMap);
		}
	});
	
	return ArrFieldValuesJSONObj;
}

function FnSavePoi(){
	$('#gapp-asset-save, #gapp-asset-cancel').attr('disabled',true);
	var validator = $("#gapp-asset-form").data("kendoValidator");
	validator.hideMessages();
	$("#GBL_loading").show();
	
	if (validator.validate()) {
			
		var VarParam = {};	
			/*
			var VarStatus = false;
				$("input[name='status']").each(function(){
					if($(this).is(':checked') == true && $(this).val()=='ACTIVE'){
						//VarStatus = $(this).val();
						VarStatus = true;
					}
				});
			*/
			var VarStatus = 'ACTIVE';
			$("input[name='status']").each(function(){
				if($(this).is(':checked') == true){
					VarStatus = $(this).val();
				}
			});
			
		VarParam['domainName'] = VarCurrentTenantInfo.tenantDomain;
		VarParam['poiType'] = $('#poiType').val();
		VarParam['poiName'] = $('#poiName').val();
		VarParam['description'] = $('#description').val();
		VarParam['latitude'] = $('#latitude').val();
		VarParam['longitude'] = $('#longitude').val();
		VarParam['radius'] = $('#poiRadius').val();		
		VarParam['status'] = VarStatus;		
		VarParam['poiTypeValues'] = FnGetAssetFieldValues();
		
		if(VarEditAssetId == ''){		
			var VarUrl = GblAppContextPath+'/ajax' + VarCreateAssetUrl;				
			FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResSaveAsset);
			
		} else {				
						
			var VarUrl = GblAppContextPath+'/ajax' + VarUpdateAssetUrl;
			VarUrl = VarUrl.replace("{poi_name}",GblEditAssetName);	
			VarParam['poiIdentifier'] = { "key": "identifier","value": VarEditAssetId};	
			//VarParam['poiIdentifier'] = { "key": "key","value": VarEditAssetId};
			//VarParam['poiTypeIdentifier'] = { "key": "key","value": GblAssetTypeId};
	
			//console.log('--update');
			//console.log(JSON.stringify(VarParam));
			//return false;
			FnMakeAsyncAjaxRequest(VarUrl, 'PUT', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResUpdateAsset);
			
		}
	} else {
		$('#gapp-asset-save, #gapp-asset-cancel').attr('disabled',false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnResSaveAsset(response){
	var ObjResponse = response;
	$('#gapp-asset-save, #gapp-asset-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	if(!$.isEmptyObject(ObjResponse)){
	
		if(ObjResponse.errorCode == undefined){
		
			var ObjImageFile = $("#asset-logo").prop("files")[0];
			if(!$.isEmptyObject(ObjImageFile)){ // Upload Asset Image
			
				var fd = new FormData();
				fd.append("asset-logo", ObjImageFile);
				fd.append("assetName", $('#assetName').val());
				fd.append("gapp-tenant-domain", $('#gapp-tenant-domain').val());
				
				$.ajax({
					url: GblAppContextPath+"/upload/asset",
					type: "POST",
					processData: false,
					contentType: false,
					enctype: 'multipart/form-data',
					data: fd,
					success:FnResImageUpload
				});	
			
			}
		
			notificationMsg.show({
				message : 'POI created successfully.'
			}, 'success');
						
			
		} else {
			FnShowNotificationMessage(ObjResponse);
		}
//	FnFormRedirect('gapp-poi-list',GBLDelayTime);
      FnFormRedirect('gapp-asset-list',GBLDelayTime);
	} else {
		
		notificationMsg.show({
			message : 'Error'
		}, 'error');
		
	}
	
}

function FnResImageUpload(response,status){
	$('#asset-logo').val('');
}

function FnResUpdateAsset(response){

	var ArrResponse = response;
	$('#gapp-asset-save, #gapp-asset-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	if(ArrResponse.status == 'SUCCESS'){	
		var ObjImageFile = $("#asset-logo").prop("files")[0];
		if(!$.isEmptyObject(ObjImageFile)){ // Upload Asset Image
		
			var fd = new FormData();
			fd.append("asset-logo", ObjImageFile);
			fd.append("assetName", $('#assetName').val());
			fd.append("gapp-tenant-domain", $('#gapp-tenant-domain').val());
			
			$.ajax({
				url: GblAppContextPath+"/upload/poi",
				type: "POST",
				processData: false,
				contentType: false,
				enctype: 'multipart/form-data',
				data: fd,
				success:FnResImageUpload
			});	
		
		} else if(GblEditAssetName != FnTrim($('#assetName').val()) && $('#asset-logo-preview').attr('src') != ''){
			
			var fd = new FormData();
			fd.append("assetName", $('#assetName').val());
			fd.append("editassetName", GblEditAssetName);
			fd.append("gapp-tenant-domain", $('#gapp-tenant-domain').val());
			$.ajax({
				url: GblAppContextPath+"/upload/asset",
				type: "POST",
				processData: false,
				contentType: false,
				enctype: 'multipart/form-data',
				data: fd,
				success:FnResImageUpload
			});
		}
				
		notificationMsg.show({
			message : 'POI updated successfully'
		}, 'success');
		
		//FnFormRedirect('gapp-poi-list',GBLDelayTime);
		FnFormRedirect('gapp-asset-list',GBLDelayTime);
		
	} else {
		notificationMsg.show({
			message : ArrResponse['errorMessage']
		}, 'error');
	}

}

function FnCreateTenantEntity(){

	var ObjTenantEntity = {};
	ObjTenantEntity['domain'] = {"domainName" : VarCurrentTenantInfo.parentDomain};
	ObjTenantEntity['entityTemplate'] = {"entityTemplateName" : "DefaultTenant"};
	ObjTenantEntity['platformEntity'] = {"platformEntityType" : "TENANT"};
	ObjTenantEntity['identifier'] = {"key": "tenantId","value": VarCurrentTenantInfo.tenantId};
	
	return ObjTenantEntity;
}


function FnAttachChildrenEntity(ObjEquipmentEntity){
	var VarUrl = GblAppContextPath+'/ajax' + VarAttachChildrenUrl;
	var VarParam = {};
	VarParam['actor'] = FnCreateTenantEntity();
	VarParam['subjects'] = [ObjEquipmentEntity];
	
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResAttachChildrenEntity);
}

function FnResAttachChildrenEntity(response){
	var ObjResponse = response;
	if(ObjResponse.status == 'SUCCESS'){
		notificationMsg.show({
			message : 'created successfully'
		}, 'success');
		
		FnFormRedirect('gapp-genset-list',GBLDelayTime);
	} else {
		notificationMsg.show({
			message : ObjResponse['errorMessage']
		}, 'error');
	}
}

function FnAttachParentChildEntity(ObjEquipmentEntity){
	var VarUrl = GblAppContextPath+'/ajax' + VarAttachParentUrl;
	var VarParam = {};
	VarParam['actor'] = ObjEquipmentEntity;
	VarParam['subjects'] = FnConstructSubjectsEntity();
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResAttachParentChildEntity);
}

function FnResAttachParentChildEntity(response){
	var ObjResponse = response;
	if(ObjResponse.status == 'SUCCESS'){
		notificationMsg.show({
			message : 'created successfully'
		}, 'success');
		
		FnFormRedirect('gapp-genset-list',GBLDelayTime);
	} else {
		notificationMsg.show({
			message : ObjResponse['errorMessage']
		}, 'error');
	}
}

function FnConstructSubjectsEntity(){
	var ArrSubjects = [];
	var ObjTenant = {};
	ObjTenant['platformEntity'] = {"platformEntityType" : "TENANT"};
	ObjTenant["domain"] = {"domainName" : VarCurrentTenantInfo.tenantDomain};
	ObjTenant["entityTemplate"] = {"entityTemplateName": "DefaultTenant"};
	ObjTenant["identifier"] = {"key": "tenantId","value": VarCurrentTenantInfo.tenantId};
	ArrSubjects.push(ObjTenant);
	
	return ArrSubjects;
}

function FnCancelAsset(){
	//alert('FnCancelAsset');
		
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-asset-list');
		$('#GBLModalcancel').modal('show');
		$('.modal-backdrop').css({"display":"none"});
		
	} else {
		$('#gapp-asset-list').submit();
	}
}

function FnNavigateAssetList(){
	$('#gapp-asset-list').submit();
}

function FnEditAsset(){
	$("#gapp-asset-form :input").prop("disabled", false);
	$("#gapp-asset-save").prop("disabled", false);
	$('#poiName').prop("disabled", true);
	$('#poiType').prop("disabled", true);
	$('#assetType').prop("disabled", true);
	$('.pageTitleTxt').text('Edit POI');
	$('#gapp-asset-edit').hide();
}

function FnDeletePoi(){	
	//alert('FnDeletePoi');	
	var VarParam = {"domain":{"domainName":VarCurrentTenantInfo.tenantDomain},"entityTemplate":{"entityTemplateName":"Poi"},"platformEntity":{"platformEntityType":"MARKER"},"identifier":{"key":"identifier","value":VarEditAssetId}};
	console.log(JSON.stringify(VarParam));
	
	
	var kendoWindow = $("<div />").kendoWindow({
						title: "Confirm",
						height:100,
						width: 240,
						resizable: false,
						modal: true
		});
	kendoWindow.data("kendoWindow").content($("#delete-confirmation").html()).center().open();
		$('.delete-message').text('Are you sure want to delete '+GblEditAssetName+' ?');
		
	kendoWindow.find(".delete-confirm,.delete-cancel").click(function() {
								if ($(this).hasClass("delete-confirm")) {
									$("#GBL_loading").show();
								//	var VarDeleteUserId = ObjSelUser.userName;
									var VarUrl = GblAppContextPath + '/ajax' + VarDeletePoisUrl;
									
									//VarUrl = VarUrl.replace("{user_name}",VarDeleteUserId);
									//VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
									console.log(VarUrl);
									//return false;
									FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResDeletePoi);
									
								} else {
									kendoWindow.data("kendoWindow").close();
								}
							}).end();
		

	
	
}


function FnResDeletePoi(response){	
	var ObjResponse = response;
	$("#GBL_loading").hide();
	$('#gapp-poi-delete').hide();	
	
		if(!$.isEmptyObject(ObjResponse)){
				if(ObjResponse.errorCode == undefined){
					notificationMsg.show({
						message : 'POI deleted successfully'
					}, 'success');
					
					//setTimeout(function(){ location.reload(); }, GBLDelayTime);
					//var dialog = $("#delete-confirmation").data("kendoWindow");
					//kendoWindow.data("kendoWindow").close();
					
					FnFormRedirect('gapp-asset-list',GBLDelayTime);
					
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



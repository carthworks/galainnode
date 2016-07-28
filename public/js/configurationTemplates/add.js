"use strict";

var GblEditDeviceType='';
var GblEditModel = '';
var GblEditProtocol = '';
var GblEditVersion = '';

$(document).ready(function(){

	// Form Validation
	$("#gapp-conftemplate-form").kendoValidator({
											validateOnBlur : true,
											errorTemplate: "<span class='help-block'><code>#=message#</code></span>",
											messages : {
												available: function(input) { 
													return input.data("available-msg");
												}
											}
	});
	
	// Form Validation
	$("#gapp-confdevice-form").kendoValidator({
											validateOnBlur : true,
											errorTemplate: "<span class='help-block'><code>#=message#</code></span>",
											messages : {
												available: function(input) { 
													return input.data("available-msg");
												}
											}
	});
	
	$('#gapp-conftemplate-save').prop('disabled', true);
	FnCheckEmptyFrmFields('#name, #deviceMake, #deviceType, #deviceModel, #deviceProtocol, #deviceProtocolVersion', '#gapp-conftemplate-save');
	
	FnInitializeTemplateGrid();
	if(VarEditTemplateName == ''){
		FnGetMakeList(FnMakeAsyncAjaxRequest);
	} else {
		FnGetMakeList(FnMakeAjaxRequest);
		FnGetConfTemplateDetails(VarEditTemplateName);
	}
	FnGetDataTypeList();
});

function FnInitializeTemplateGrid(){
	
	var ArrColumns = [{field: "pointId",title: "Device I/O"},{field: "displayName",title: "Display Name"},{field: "dataType",title: "Data Type"},{field: "physicalQuantity",title: "Physical Quantity"},{field: "unit",title: "Unit"},{field: "expression",title: "Expression",filterable:false},{title:"Action",filterable:false,template: "<a class='grid-editconfdevice' style='text-transform: capitalize;'><span class='smicon sm-editicon'></span></a>"}];
	
	var ObjGridConfig = {
		"scrollable" : false,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"height" : 0,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : true,
		"editable" : "popup"
	};
	

	FnDrawGridView('#templateconfgrid',[],ArrColumns,ObjGridConfig);
	
	var grid = $("#templateconfgrid").data("kendoGrid");
    //grid.bind("save", FnDeviceinputSaveEvent);
	//grid.bind("edit", FnDeviceinputEditEvent);
	
	$("#templateconfgrid").data("kendoGrid").tbody.on("click", ".grid-editconfdevice", function (e) {
		var tr = $(this).closest("tr");
		var data = $("#templateconfgrid").data('kendoGrid').dataItem(tr);
		console.log(data);
		$('#deviceIO').val(data.pointId);
		$('#displayName').val(data.displayName);
		$('#dataType').val(capitalizeEachWord(data.dataType));
		$('#expression').val(data.expression);
		GblEditUnit = data.unit;
		GblEditPhysicalQuantity = data.physicalQuantity;
		FnGetPhysicalQuantityList();
	});
}

function capitalizeEachWord(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

/*---------------Get make list -------------------*/
  
function FnGetMakeList(FnMakeAjaxCall){		
	var VarUrl = GblAppContextPath+'/ajax' + VarPopulateMakeListUrl;	
	FnMakeAjaxCall(VarUrl, 'GET','' , 'application/json; charset=utf-8', 'json', FnResMakeList);	
}
	
function FnResMakeList(response){	
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;	
	if(VarResLength > 0){
		var VarMakeTxt = '';
		VarMakeTxt += '<option value="">Select Make</option>';
		$.each(ArrResponse,function(key,val){
			VarMakeTxt += '<option value="'+val.name+'"> <span style="padding-left:5px !important;">&nbsp&nbsp&nbsp</span>'+val.name+'</option>';
		});			
		$('#deviceMake').html(VarMakeTxt);
	}
}
/*---------------End Get make list -------------------*/

/*---------------Get FnGetDeviceTypeList -------------------*/
	
function FnGetDeviceTypeList(VarFlag){			
	var VarMake = $('#deviceMake').val();	
		
	if(VarFlag == 1){		
		GblEditDeviceType = '';
		GblEditModel = '';
		GblEditProtocol = '';
		GblEditVersion = '';
		
		$('#deviceType').html('<option value="">Select device type</option>');
		$('#deviceModel').html('<option value="">Select model </option>');
		$('#deviceProtocol').html('<option value="">Select protocol </option>');
		$('#deviceProtocolVersion').html('<option value="">Select protocol version </option>');
	
	}	
	
	if(VarMake !=''){
		var VarUrl = GblAppContextPath+'/ajax' + VarPopulateDeviceType;
		VarUrl = VarUrl.replace("{make_name}",VarMake);
		FnMakeAsyncAjaxRequest(VarUrl, 'GET','' , 'application/json; charset=utf-8', 'json', FnResDeviceTypeList);
	} else {
		var VartDeviceType = '<option>Please select device Type</option>';
		$('#deviceType').html(VartDeviceType);				
	}
}
	
function FnResDeviceTypeList(response){	
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;	
	if(VarResLength > 0){
		
		var VarMakeTxt = '';
		VarMakeTxt += '<option value="">Select the device type</option>';
		$.each(ArrResponse,function(key,val){
			VarMakeTxt += '<option value="'+val.name+'">'+val.name+'</option>';
		});			
		$('#deviceType').html(VarMakeTxt);
		
		if(GblEditDeviceType != ''){
			$('#deviceType').val(GblEditDeviceType);
			if(GblEditModel != ''){
				FnGetModelList();
			}
		};
	}
}	
/*---------------End FnGetDeviceTypeList -------------------*/

/*---------------End FnGetModelList -------------------*/		
function FnGetModelList(VarFlag) {	
	var VarMake = $('#deviceMake').val();	
	var VarDeviceType = $('#deviceType').val();
	
	if(VarFlag == 1){		
		GblEditModel = '';
		GblEditProtocol = '';
		GblEditVersion = '';			
		
		$('#deviceModel').html('<option value="">Select model </option>');
		$('#deviceProtocol').html('<option value="">Select protocol </option>');
		$('#deviceProtocolVersion').html('<option value="">Select protocol version </option>');
	}
	
	var objGetModel ={"make":VarMake,"deviceType":VarDeviceType};
	var VarUrl = GblAppContextPath+'/ajax' + VarPopulateModelListUrl;		
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(objGetModel), 'application/json; charset=utf-8', 'json', FnResModelList);		
}
	
function FnResModelList(response){			
	var ArrResponse = response;			
	var VarResLength = ArrResponse.length;		
	if(VarResLength > 0){
		if(!$.isEmptyObject(ArrResponse)){
			var VarModelList = '';
			VarModelList += '<option value="">Select model </option>';
				
			$.each(ArrResponse,function(key,obj){						
				VarModelList += '<option value="'+obj.name+'">'+obj.name+'</option>';
				
			});
			$('#deviceModel').html(VarModelList);				
			if(GblEditModel != ''){
				$('#deviceModel').val(GblEditModel);
				if(GblEditProtocol != ''){
					FnGetProtocolList();
				}
				
			}
		}
	}
}
/*---------------End FnGetModelList -------------------*/

/*---------------End FnGetProtocolList -------------------*/		
function FnGetProtocolList(VarFlag) {		

	var VarDeviceModel = $('#deviceModel').val();
	var VarMake = $('#deviceMake').val();	
	var VarDeviceType = $('#deviceType').val();
	
	if(VarFlag == 1){	
	
		GblEditProtocol = '';
		GblEditVersion = '';
		
		$('#deviceProtocol').html('<option value="">Select protocol </option>');
		$('#deviceProtocolVersion').html('<option value="">Select protocol version </option>');
	}
	
	var objGetModel = {"make":VarMake,"deviceType":VarDeviceType,"model":VarDeviceModel};		
	var VarUrl = GblAppContextPath +'/ajax' + VarPopulateDeviceProtocolListUrl;		
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(objGetModel), 'application/json; charset=utf-8', 'json', FnResProtocolList);		
}
			
function FnResProtocolList(response){			
	var ArrResponse = response;			
	var VarResLength = ArrResponse.length;		
	if(VarResLength > 0){
		if(!$.isEmptyObject(ArrResponse)){
			var VarProtocolList = '';
			VarProtocolList += '<option value="">Select protocol </option>';						
			$.each(ArrResponse,function(key,obj){				
				VarProtocolList += '<option value="'+obj.name+'">'+obj.name+'</option>';						
			});
			$('#deviceProtocol').html(VarProtocolList);
		
			if(GblEditProtocol != ''){
				$('#deviceProtocol').val(GblEditProtocol);
				if(GblEditVersion != ''){				
					FnGetProtocolVersionList();
				}
			
			}
		
		}
	}
}
/*---------------End FnGetProtocolList -------------------*/

/*---------------End FnGetProtocolVersionList -------------------*/		
function FnGetProtocolVersionList(VarFlag) {	
	
	var VarMake = $('#deviceMake').val();	
	var VarDeviceType = $('#deviceType').val();
	var VarDeviceModel = $('#deviceModel').val();
	var VarProtocol = $('#deviceProtocol').val();
	
	if(VarFlag == 1){			
		GblEditVersion = '';
				
		$('#deviceProtocolVersion').html('<option value="">Select protocol version </option>');
	}
		
	var objGetModel = {"make":VarMake,"deviceType":VarDeviceType,"model":VarDeviceModel,"protocol":VarProtocol};
	var VarUrl = GblAppContextPath+'/ajax' + VarPopulateVersionsListUrl;		
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(objGetModel), 'application/json; charset=utf-8', 'json', FnResProtocolVersionList);		
}


function FnResProtocolVersionList(response){			
	var ArrResponse = response;			
	var VarResLength = ArrResponse.length;		
	if(VarResLength > 0){
		if(!$.isEmptyObject(ArrResponse)){
			var VarProtocolVersionList = '';
			VarProtocolVersionList += '<option value="">Select a protocol version </option>';						
			$.each(ArrResponse,function(key,obj){
				VarProtocolVersionList += '<option value="'+obj.name+'">'+obj.name+'</option>';
			
			});
			$('#deviceProtocolVersion').html(VarProtocolVersionList);
			if(GblEditVersion != ''){
				$('#deviceProtocolVersion').val(GblEditVersion);
			}
		}
	}
}
/*---------------End FnGetProtocolVersionList -------------------*/

function FnGetDeviceIOList(){

	var VarMake = $('#deviceMake').val();
	var VarDeviceType = $('#deviceType').val();
	var VarModel = $('#deviceModel').val();
	var VarDeviceProtocol = $('#deviceProtocol').val();
	var VarDeviceProtocolVersion = $('#deviceProtocolVersion').val();
	
	if(VarMake != '' && VarDeviceType != '' && VarModel != '' && VarDeviceProtocol != '' && VarDeviceProtocolVersion != ''){
		var VarParam = {
			"make" : VarMake,
			"deviceType" : VarDeviceType,
			"model" : VarModel,
			"protocol" : VarDeviceProtocol,
			"version" : VarDeviceProtocolVersion
		};
		
		var VarUrl = GblAppContextPath+'/ajax' + VarProtocolPointsUrl;		
		FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResDeviceIOList);	
	}
}

function FnResDeviceIOList(response){
	var VarDeviceIOList = '';
	VarDeviceIOList += '<option value="">Select Device I/O </option>';
	if(!$.isEmptyObject(response) && response.points != undefined && (response.points).length > 0){
		$.each(response.points,function(){
			VarDeviceIOList += '<option value="'+this.pointId+'">'+this.pointName+'</option>';
		});
	}	
	$('#deviceIO').html(VarDeviceIOList);
}

function FnGetDataTypeList(){

	var VarUrl = GblAppContextPath+'/ajax' + VarGetAllDataTypeUrl;		
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResDataTypeList);	
	
}

function FnResDataTypeList(response){
	var VarDataTypeList = '';
	VarDataTypeList += '<option value="">Select Data Type </option>';
	if(response.length > 0){
		$.each(response,function(){
			VarDataTypeList += '<option value="'+this.name+'">'+this.name+'</option>';
		});
	}	
	$('#dataType').html(VarDataTypeList);
}

function FnGetPhysicalQuantityList(){
	var VarDataType = $('#dataType').val();
	if(VarDataType != ''){
		var VarUrl = GblAppContextPath+'/ajax' + VarGetPhysicalQuantityUrl + "?data_type="+VarDataType;		
		FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResPhysicalQuantityList);	
	} else {
		$('#physicalQuantity').html('<option value="">select Physical Quantity </option>');
	}
}

function FnResPhysicalQuantityList(response){
	var VarPhysicalQuantityList = '';
	VarPhysicalQuantityList += '<option value="">select Physical Quantity </option>';
	if(response.length > 0){
		$.each(response,function(){
			VarPhysicalQuantityList += '<option value="'+this.name+'">'+this.name+'</option>';
		});
	}	
	$('#physicalQuantity').html(VarPhysicalQuantityList);
	
	if(GblEditPhysicalQuantity != ''){
		$('#physicalQuantity').val(GblEditPhysicalQuantity);
		if(GblEditUnit != ''){
			FnGetUnitList();
		}
	}
}

function FnGetUnitList(){
	var VarPhysicalQuantity = $('#physicalQuantity').val();
	if(VarPhysicalQuantity != ''){
		var VarUrl = GblAppContextPath+'/ajax' + VarGetUnitsUrl + VarPhysicalQuantity;		
		FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResUnitList);	
	} else {
		$('#unit').html('<option value="">select Unit </option>');
	}
}

function FnResUnitList(response){
	var VarUnitList = '';
	VarUnitList += '<option value="">select Unit </option>';
	if(response.length > 0){
		$.each(response,function(){
			VarUnitList += '<option value="'+this.name+'">'+this.name+'</option>';
		});
	}	
	$('#unit').html(VarUnitList);
	
	if(GblEditUnit != ''){
		$('#unit').val(GblEditUnit);
	}
}

function FnSaveConfDevice(){
	
	$('#gapp-confdevice-save, #gapp-confdevice-cancel').attr('disabled',true);
	var validator = $("#gapp-confdevice-form").data("kendoValidator");
	validator.hideMessages();
	kendo.ui.progress($("#gapp-confdevice-form"), true);
	if (validator.validate()) {
		
		var grid = $('#templateconfgrid').data("kendoGrid");
		grid.dataSource.add({
			"pointId": $('#deviceIO').val(),
			"pointName": $('#deviceIO option:selected').text(),
			"dataType": $('#dataType').val(),
			"unit": $('#unit').val(),
			"displayName": $('#displayName').val(),
			"physicalQuantity": $('#physicalQuantity').val(),
			"systemTag": "",
			"precedence" : "",
			"expression" : $('#expression').val(),
		});
		
		$('#gapp-confdevice-save, #gapp-confdevice-cancel').attr('disabled',false);
		kendo.ui.progress($("#gapp-confdevice-form"), false);
		$('#deviceIO, #displayName, #dataType, #physicalQuantity, #unit, #expression').val('');
		
	} else {
		$('#gapp-confdevice-save, #gapp-confdevice-cancel').attr('disabled',false);
		kendo.ui.progress($("#gapp-confdevice-form"), false);
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnCancelConfDevice(){
	$('#deviceIO, #displayName, #dataType, #physicalQuantity, #unit, #expression').val('');
}

function FnGetTemplateDevicePoints(){
	var ArrDevicePoints = [];
	var ArrData = $('#templateconfgrid').data("kendoGrid").dataSource.data();
	console.log(ArrData);
	for(var i=0; i<ArrData.length; i++){
		var element = {
			"pointId": ArrData[i]['pointId'],
			"pointName": ArrData[i]['pointName'],
			"dataType": ArrData[i]['dataType'],
			"unit": ArrData[i]['unit'],
			"displayName": ArrData[i]['displayName'],
			"physicalQuantity": ArrData[i]['physicalQuantity'],
			"systemTag": "",
			"precedence" : (i+1),
			"expression" : ArrData[i]['expression']
		};
		ArrDevicePoints.push(element);
	}
	
	return ArrDevicePoints;
}

function FnSaveConfTemplate(){
	$('#gapp-conftemplate-save, #gapp-conftemplate-cancel').attr('disabled',true);
	var validator = $("#gapp-conftemplate-form").data("kendoValidator");
	validator.hideMessages();
	$("#GBL_loading").show();
	
	if (validator.validate()) {
		var ArrData = $('#templateconfgrid').data("kendoGrid").dataSource.data();
		if(ArrData.length > 0){
			if(VarEditTemplateName == ''){
				var VarUrl = GblAppContextPath+'/ajax' + VarCreateConfTemplatesUrl;
				var VarParam = {};
				VarParam = {
					"deviceMake" : $('#deviceMake').val(),
					"deviceType" : $('#deviceType').val(),
					"deviceModel" : $('#deviceModel').val(),
					"deviceProtocol" : $('#deviceProtocol').val(),
					"deviceProtocolVersion" : $('#deviceProtocolVersion').val(),
					"name" : $('#name').val(),
					"configPoints" : FnGetTemplateDevicePoints()
				};
				console.log(JSON.stringify(VarParam));
				FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResSaveConfTemplate);
			} else {
			
				var VarUrl = GblAppContextPath+'/ajax' + VarUpdateConfTemplatesUrl;
				var VarParam = {};
				VarParam = {
					"deviceMake" : $('#deviceMake').val(),
					"deviceType" : $('#deviceType').val(),
					"deviceModel" : $('#deviceModel').val(),
					"deviceProtocol" : $('#deviceProtocol').val(),
					"deviceProtocolVersion" : $('#deviceProtocolVersion').val(),
					"name" : $('#name').val(),
					"description" : $('#description').val(),
					"configPoints" : FnGetTemplateDevicePoints()
				};
				console.log(JSON.stringify(VarParam));
				FnMakeAsyncAjaxRequest(VarUrl, 'PUT', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResUpdateConfTemplate);
			}
			
		} else {
			$("#alertModal").modal('show').find(".modalMessage").text("Please add at least one device I/O.");
			$('#gapp-conftemplate-save, #gapp-conftemplate-cancel').attr('disabled',false);
			$("#GBL_loading").hide();
			return false;
		}
	} else {
		$('#gapp-conftemplate-save, #gapp-conftemplate-cancel').attr('disabled',false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnResSaveConfTemplate(response){
	console.log(response);
	var ObjResponse = response;
	$('#gapp-conftemplate-save, #gapp-conftemplate-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	if(!$.isEmptyObject(ObjResponse)){
		if(ObjResponse.errorCode == undefined){
			notificationMsg.show({
				message : 'Template created successfully'
			}, 'success');
	
			FnFormRedirect('gapp-congtemplate-list',GBLDelayTime);
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

function FnResUpdateConfTemplate(response){
	console.log(response);
	var ObjResponse = response;
	$('#gapp-conftemplate-save, #gapp-conftemplate-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	if(!$.isEmptyObject(ObjResponse)){
		if(ObjResponse.errorCode == undefined){
			notificationMsg.show({
				message : 'Template updated successfully'
			}, 'success');
	
			FnFormRedirect('gapp-congtemplate-list',GBLDelayTime);
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

function FnCancelConfTemplate(){		
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-congtemplate-list');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-congtemplate-list').submit();
	}
}

function FnNavigateConfTemplateList(){
	$('#gapp-congtemplate-list').submit();
}

function FnGetConfTemplateDetails(VarTemplateName){
	$("#gapp-conftemplate-form :input").prop("disabled", true);
	$("#gapp-confdevice-form :input").prop("disabled", true);
	
	console.log(VarTemplateName);
	
	var VarUrl = GblAppContextPath+'/ajax' + VarViewConfTemplatesUrl;	
	VarUrl = VarUrl.replace("{template_name}",VarTemplateName);
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResConfTemplateDetails);
}

function FnResConfTemplateDetails(response){
	console.log(response);
	var ObjResponse = response;
	if(!$.isEmptyObject(ObjResponse)){
		$('#gapp-conftemplate-form #name').val(VarEditTemplateName);
		$('#gapp-conftemplate-form #deviceMake').val(ObjResponse.deviceMake);
		GblEditDeviceType = ObjResponse.deviceType;
		GblEditModel = ObjResponse.deviceModel;
		GblEditProtocol = ObjResponse.deviceProtocol;
		GblEditVersion = ObjResponse.deviceProtocolVersion;
		
		var grid = $('#templateconfgrid').data("kendoGrid");
		$.each(ObjResponse.configPoints,function(){
			grid.dataSource.add({
				"pointId": this.pointId,
				"pointName": this.pointName,
				"dataType": this.dataType,
				"unit": this.unit,
				"displayName": this.displayName,
				"physicalQuantity": this.physicalQuantity,
				"systemTag": this.systemTag,
				"precedence" : this.precedence,
				"expression" : this.expression,
			});
		});
		
		$('#templateconfgrid a').prop("disabled", true);
		
		FnGetDeviceTypeList();
	}
}

var GblEditUnit;
var GblEditPhysicalQuantity;
function FnEditTemplate(){
	$("#gapp-conftemplate-form :input").prop("disabled", false);
	$("#gapp-confdevice-form :input").prop("disabled", false);
	$("#gapp-conftemplate-save").prop("disabled", false);
	$('.pageTitleTxt').text('Edit Template');	
	$('#gapp-conftemplate-edit').hide();
	$('#templateconfgrid a').prop("disabled", false);
	FnGetDeviceIOList();
}
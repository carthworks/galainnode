"use strict";

var $uploadCrop;
$(document).ready(function(){

	$("#categoryName").bind("input",function(){
        this.value= this.value.toUpperCase();
	});
	
	$("#fieldsContainer").find('input[type=text]').bind("input",function(){
        this.value= this.value.toLowerCase();
	});
	
	// Form Validation
	$("#gapp-template-form").kendoValidator({
										validateOnBlur : true,
										errorTemplate: "<span class='help-block'><code>#=message#</code></span>"											
	});
		
	$('#gapp-template-save').prop('disabled', true);
	FnCheckEmptyFrmFields('#categoryName', '#gapp-template-save');
	if(VarEditEntityId != ''){
		FnGetTagTypeDetails(VarEditEntityId);
	}
		
});

function FnDisplayAssetTypeImage(){
		
	$uploadCrop.croppie('bind', {
		url: VarEditImage
	});
}

function readFile(input) {
	
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		
		reader.onload = function (e) {
			$uploadCrop.croppie('bind', {
				url: e.target.result
			});
			$('.upload-demo').addClass('ready');
		}
		
		reader.readAsDataURL(input.files[0]);
	}
	else {
		swal("Sorry - you're browser doesn't support the FileReader API");
	}
}

function FnGetTagTypeDetails(VarEditEntityId){
	var VarUrl =GblAppContextPath+ '/ajax' + VarViewTemplateUrl + "?domain_name="+ VarCurrentTenantInfo.tenantDomain;
	VarUrl = VarUrl.replace("{tag_type_name}",VarEditEntityId);
	
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResAssetTypeDetails);

}

function FnResAssetTypeDetails(response){
	var ObjResponse = response;
	if(!$.isEmptyObject(ObjResponse)){
		$('#gapp-template-form #categoryName').val(ObjResponse['tagType']);
		var i=0;
		$.each(ObjResponse.tagTypeValues,function(key,val){
			if(i==0){
				$('#fieldsContainer').find ('input:first').val(val);
			} else {
				
				var fieldHTML = '<div class="formelement_addition col-md-6"><input type="text" class="form-control" name="categoryFields[]" value="'+val+'" onkeypress="return FnAllowAlphabetsOnly(event)"/><a href="javascript:void(0);" class="remove_button" title="Remove field"><i class="fa fa-minus-circle"></i></a></div>'; 
				$('.field_wrapper').append(fieldHTML);
			}
			i++;
		});
		
		$("#gapp-template-form :input").prop("disabled", true);
		$('#gapp-template-save, .add_button, .remove_button').attr('disabled',true);
		$("#gapp-template-cancel").prop("disabled", false);
		$('#gapp-template-edit').hide();
		
		//FnDisplayAssetTypeImage();
	}	
}

function FnGetTemplateFields(){
	var ArrTemplateFields = [];
	$('#fieldsContainer').find('input[type=text]').each(function(){
		var VarFieldValue = FnTrim($(this).val());
		if(VarFieldValue != ''){
			VarFieldValue = VarFieldValue.toLowerCase();
			ArrTemplateFields.push(VarFieldValue);
		}
	});
	
	return ArrTemplateFields;
}

function FnSaveAssetType(){
	$('#gapp-template-save, #gapp-template-cancel').attr('disabled',true);
	var validator = $("#gapp-template-form").data("kendoValidator");
	validator.hideMessages();
	if (validator.validate()) {
		if(VarEditEntityId == ''){
		
			var VarUrl = GblAppContextPath+'/ajax' + VarCreateTemplateUrl;
			var ArrTemplateFields = FnGetTemplateFields();
			if(ArrTemplateFields.length > 0){
				$("#GBL_loading").show();
				var VarParam = {};
				
				var VarStatus = 'ACTIVE';
				$("input[name='status']").each(function(){
					if($(this).is(':checked') == true){
						VarStatus = $(this).val();
					}
				});
				//alert(VarStatus);
				VarParam['tagType'] = (FnTrim($('#categoryName').val())).toUpperCase();
				VarParam['tagTypeValues'] = ArrTemplateFields;
				VarParam['domainName'] = VarCurrentTenantInfo.tenantDomain;
				VarParam['status'] = VarStatus;				
				console.log(JSON.stringify(VarParam));
				//return  false;
				FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResSaveAssetType);
			} else {
				$("#alertModal").modal('show').find(".modalMessage").text("Please enter at least one tag type field.");
				$('#gapp-template-save, #gapp-template-cancel').attr('disabled',false);
				return false;
			}
			
		} else {
		
			/*var VarUrl = GblAppContextPath+'/ajax' + VarCreateTemplateUrl;
			var VarParam = {};
			VarParam['equipment'] = FnGetEquipmentTemplate();
			VarParam['fieldValues'] = FnGetFormFieldValues("gapp-genset-form","input[type=text]");
			
			FnMakeAsyncAjaxRequest(VarUrl, 'PUT', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResUpdateAssetType);*/
			
		}
	} else {
		$('#gapp-template-save, #gapp-template-cancel').attr('disabled',false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnResSaveAssetType(response){
	
	var ObjResponse = response;
	$('#gapp-template-save, #gapp-template-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	if(!$.isEmptyObject(ObjResponse)){
	
		if(ObjResponse.errorCode == undefined){
			notificationMsg.show({
				message : 'Tag Type created successfully.'
			}, 'success');
			
			FnFormRedirect('gapp-template-list',GBLDelayTime);
						
		} else {
			//FnShowNotificationMessage(ObjResponse);
		}
	
	} else {
	
		notificationMsg.show({
			message : 'Error'
		}, 'error');
		
	}
	
}

function dataURItoBlob(dataURI) {
	var split = dataURI.split(','),
		dataTYPE = split[0].match(/:(.*?);/)[1],
		binary = atob(split[1]),
		array = []
	for(var i = 0; i < binary.length; i++) array.push(binary.charCodeAt(i))
	return new Blob([new Uint8Array(array)], {
		type: dataTYPE
	})
}

function FnResUpdateAssetType(response){

	var ArrResponse = response;
	$('#gapp-template-save, #gapp-template-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	if(ArrResponse.status == 'SUCCESS'){
				
		notificationMsg.show({
			message : 'Asset Type updated successfully'
		}, 'success');
		
		FnFormRedirect('gapp-template-list',GBLDelayTime);
		
	} else {
		FnShowNotificationMessage(ArrResponse);
	}

}

function FnResImageUpload(response,status){
	$('#assettype-logo').val('');
	$('#assettype-logo-info').html('');
}

function FnCancelTagType(){
	
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-template-list');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-template-list').submit();
	}
}

function FnNavigateTemplateList(){
	$('#gapp-template-list').submit();
}

function FnEditAssetType(){
	$("#gapp-template-form :input").prop("disabled", false);
	$("#gapp-template-save").prop("disabled", false);
	$('#gapp-template-edit').hide();
}

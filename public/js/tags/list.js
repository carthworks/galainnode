"use strict";

$(document).ready(function(){
	$(".k-grid-content").css("overflow", "scroll").css("overflow-x", "auto").scroll(function() {
		var left = $(this).scrollLeft();
		var wrap = $(".k-grid-header-wrap");
		if (wrap.scrollLeft() != left) wrap.scrollLeft(left);
	});
});

$(window).load(function() {
	//FnInitializeAssetListGrid();
	FnGetTagTypes();
	//FnGetTagList();
});	

function FnInitializeAssetListGrid(){
	var ArrGridColumns = FnGetGridColumns();
	
	var PointMapLink = (ObjPageAccess['mappoint']=='1') ? " &nbsp;<a class='grid-asset-mappoints btn btn-sm btn-raised default' data-toggle='tooltip' data-placement='left' title='Map points'><i class='smicon sm-linkicon'></i></a>" : "";
	var Actionlink = (ObjPageAccess['dashboard']=='1') ? '<a  href="javascript:void(0);" class="grid-asset-dashboard btn btn-sm btn-raised default"  data-toggle="tooltip" data-placement="bottom"  title="Asset dashboard"><i class="smicon sm-metericon"></i></a>' : "";
	var VarActionsLink = '<div class="asset-actions">';
	
	VarActionsLink +=  Actionlink +PointMapLink;
	
	VarActionsLink += '</div>';
	
	
	var ObjGridConfig = {
		"scrollable" : true,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : true
	};
	FnDrawGridView('#gapp-asset-list',[],ArrGridColumns,ObjGridConfig);
}

function FnGetTagTypes(){
	var VarUrl = GblAppContextPath+'/ajax' + VarListTemplateUrl + "?domain_name="+ VarCurrentTenantInfo.tenantDomain;
	FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResTagTypes);
}

function FnResTagTypes(response){
	var ArrResponse = response;
	if($.isArray(ArrResponse)){
		var VarTagTypesTxt = '<option value="">Please select a tag type</option>';
		$.each(ArrResponse,function(key,val){
			VarTagTypesTxt += '<option value="'+val.entityTemplateName+'">'+val.entityTemplateName+'</option>';
		});
		$('#assetCategory').html(VarTagTypesTxt);
	}
	
}
//-----------------------------------------------------------------------//
function FnGetTagList(VarAssetType){
	$("#GBL_loading").show();
	if(VarAssetType != undefined){
		if(VarAssetType != ''){
			var VarUrl = GblAppContextPath+'/ajax' + VarFetchAllByTemplateUrl + "?domain_name="+ VarCurrentTenantInfo.tenantDomain;
			VarUrl = VarUrl.replace("{tag_type}",VarAssetType);
			FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResTagList);
		}else{
			$("#GBL_loading").hide();
			
			$('#gapp-asset-list').removeClass("k-grid k-widget");
			var grid = $("#gapp-asset-list").data("kendoGrid");
			if(grid != undefined){ grid.destroy(); $('#gapp-asset-list').html(''); }
			$(".k-grid-content").mCustomScrollbar('destroy');
		} 
	}else {
		$("#GBL_loading").hide();
		
		$('#gapp-asset-list').removeClass("k-grid k-widget");
		var grid = $("#gapp-asset-list").data("kendoGrid");
		if(grid != undefined){ grid.destroy(); $('#gapp-asset-list').html(''); }
		$(".k-grid-content").mCustomScrollbar('destroy');
	}	
}

function FnResAssetFields(response){
	$("#GBL_loading").hide();
	var ObjResponse = response;
	if(!$.isEmptyObject(ObjResponse)){
	
		$.each(ObjResponse.tagTypeValues,function(key,val){
			
			VarAssetFieldTxt += '<div class="form-group form-md-line-input col-md-4"><input type="text" class="form-control input-sm" name="'+val+'" id="'+val+'" tabindex="'+VarTabIndex+'"/><label class="col-md-12 control-label capitalize" for="'+val+'"> '+val+' </label><div class="form-control-focus"></div></div>';
			
			VarTabIndex++;
		});
		$('#fieldsContainer').html(VarAssetFieldTxt);
	} else {
		if(ArrResponse.errorCode != undefined){
			FnShowNotificationMessage(ArrResponse);
		}
	}

}



function FnResTagList(response){
	$("#GBL_loading").hide();
	var ArrResponse = response;
	var ArrGridColumns = FnGetGridColumns();
	if($.isArray(ArrResponse)){
		var ArrResponseData = [];
		if($('#assetCategory').val() != ''){
			var i=0;
			var column_count = 0;
		
			$.each(ArrResponse,function(key1,val1){
				var element = {};
				
				if(val1 != undefined){
					$.each(val1,function(key,val){		
						element[key] = val;
						if(column_count < 1 ){	
							if(key !='name' && key !='domain'){
								//ArrGridColumns.push({title:key,field:key});
							}
							
						}
						
					});
					i++;
				}
				
				column_count++;	
				ArrResponseData.push(element);
				
			});
			
			console.log(ArrGridColumns);
			console.log(ArrResponseData);
		} 
	} else {
		var ArrResponseData = [];
	}
	

	
				
	var ObjGridConfig = {
		"scrollable" : true,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : true
	};
	
	var objDatasource = {};
	objDatasource['data']=ArrResponseData;
	objDatasource['sort']={field: "assetName", dir: "asc"}
	
	var grid = $("#gapp-asset-list").data("kendoGrid");
	if(grid != undefined){ grid.destroy(); $('#gapp-asset-list').html(''); }
	
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-asset-list',objDatasource,ArrGridColumns,ObjGridConfig);
		
	$("#gapp-asset-list").data("kendoGrid").tbody.on("click", ".grid-asset-view", function(e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-asset-list").data('kendoGrid').dataItem(tr);
		
		$("#gapp-asset-view #entity_id").val(data.name);
		$("#gapp-asset-view #tag_type").val(data.tagType);
		$("#gapp-asset-view").submit();
	});
	
	
	
}

function FnGetGridColumns(){
	
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a href='Javascript:void(0)' class='grid-asset-view capitalize' data-toggle='tooltip' title='View #=name# details'>#=name#</a>" : "<a href='Javascript:void(0)' class='capitalize'>#=name#</a>";
	
	var ArrColumns = [
						{
							field: "name",
							title: "name",
							template: ViewLink
							
							
						}
					];
					
	return ArrColumns;
}

function FnSubmitEquipmentMapPoints(ObjEquipment){
		
	var ObjEquipmentEntity = {};
	ObjEquipmentEntity['equipment'] = {};
	ObjEquipmentEntity['equipment']['identifier'] = {"key": "identifier","value": ObjEquipment.identifier};
	ObjEquipmentEntity['equipment']['domain'] = {"domainName": VarCurrentTenantInfo.tenantDomain};
	ObjEquipmentEntity['equipment']['entityTemplate'] = {"entityTemplateName": "Asset"};
	ObjEquipmentEntity['equipment']['globalEntity'] = {"globalEntityType": "MARKER"};
	ObjEquipmentEntity['equipName'] = ObjEquipment.assetName;
	
	$("#gapp-asset-pointmapping #equip_entity").val(JSON.stringify(ObjEquipmentEntity));
	$("#gapp-asset-pointmapping").submit();
}

function FnCreateTag(){
	$('#gapp-asset-create').submit();
}
	
	

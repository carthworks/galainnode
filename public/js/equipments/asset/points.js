"use strict";

$(document).ready(function(){
	$(".k-grid-content").css("overflow", "scroll").css("overflow-x", "auto").scroll(function() {
		var left = $(this).scrollLeft();
		var wrap = $(".k-grid-header-wrap");
		if (wrap.scrollLeft() != left) wrap.scrollLeft(left);
	});
	/*
	$('body').tooltip({
		selector: '.grid-asset-mappoints,.grid-asset-dashboard,.grid-asset-view'
	});
	*/
	//---For name-tag --//
	$("#name-tag-placeholder").kendoMultiSelect({
		dataTextField : "name",
		dataValueField : "value",
		animation: false,
		enable: true
	});
	FnGetTagList();
	//---//
	
	if(VarEditAssetId != ''){
		FnGetAssetDetails(VarEditAssetId);
	}
	
});

$(window).load(function() {
	//FnInitializeAssetListGrid();
	//FnGetAssetTypes();
	//FnGetAssetList();
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
		  "entityTemplateName": "Point",
		  "platformEntityType": "MARKER"
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
			$.each(val.dataprovider,function(key,val){ 

				if(val.key == 'name'){
					ObjRole.name = val.value;
					ObjRole.value = val.value;
				}

			});
			
			ObjRole.Identifier = val.identifier.value;
			ObjRole.entityTemplateName = val.entityTemplate.entityTemplateName;
			ArrResData.push(ObjRole);
			
		});
	}	
	
	var dataNameTag = $("#name-tag-placeholder").data("kendoMultiSelect");
	dataNameTag.setDataSource(ArrResData);
}

/*********************************************************************************/
var GblAssetTypeId = '';
var GblEditAssetName = '';
function FnGetAssetDetails(VarAssetIdentifier){
	$("#GBL_loading").show();	
	var VarUrl = GblAppContextPath+'/ajax' + VarViewAssetUrl;
	//alert('Assets ='+VarUrl);
	var VarParam = {};
	VarParam['domain'] = {"domainName" : VarCurrentTenantInfo.tenantDomain};
	VarParam['entityTemplate'] = {"entityTemplateName" : "Asset"};
	VarParam['identifier'] = {"key": "identifier","value": VarAssetIdentifier};
	FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResAssetDetails);
}

function FnResAssetDetails(response){
	$("#GBL_loading").hide();
	var ArrResponse = response;
	if(!$.isEmptyObject(ArrResponse)){
		
		$.each(ArrResponse.asset.fieldValues,function(key,obj){
			$('#gapp-asset-form #'+obj.key).val(obj.value);
			if(obj['key']=='assetName'){
				GblEditAssetName = obj['value'];
			}
		});
		$("#pointmap_asset_name").html(GblEditAssetName);
		
		var ArrPoints = [];
		if(ArrResponse['points'] != undefined){
			$.each(ArrResponse['points'],function(){
				var element = {};
				$(this.dataprovider).each(function() {
					var key = this.key;
					var value = ((this.value != undefined)? this.value : "");
					element[key] = value;
					
					if(key == 'pointId'){
						element['rowid'] = value;
					}
				});
				element["identifier"] = this.identifier.value;
				element["status"] = this.entityStatus.statusName;
				ArrPoints.push(element);
			});
		}
	
		FnResAssetPointList(ArrPoints);
	}	
	
	//---Find name-tags---//	
		
		var VarUrl = GblAppContextPath+'/ajax' + VarFetchAllTagsUrl;
		
		var VarMainParam ={
			  "actorType": "Entity",
			  "actor": {
				"entity": {
				  "platformEntity": {
					"platformEntityType": "MARKER"
				  },
				  "domain": {
					"domainName": response.asset.domain.domainName
				  },
				  "entityTemplate": {
					"entityTemplateName": "Point"
				  },
				  "identifier": {
					"key": response.asset.identifier.key,
					"value": response.asset.identifier.value
				  }
				}
			  }
			};
		
		FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResFindNameTags);
		
		
		//---//	
		
}

function FnResAssetPointList(ArrPoints){
	/*
	if(ArrPoints.length > 0){
		$("#btn-asset-points").prop("disabled", false);
	}else{
		$("#btn-asset-points").prop("disabled", true);
	}
	*/
		
	var ArrColumns = [{headerTemplate: '<input type="checkbox" name="checkAll" id="checkAll" onClick="">',
					   template: "<input type='checkbox' id='#=rowid#' ' onClick=''>",
					   width: 30
					  },
					  {field: "pointId",title: "Point Id"},
					  {field: "pointName",title: "Point Name"},
					  {field: "displayName",title: "Display Name"},
					  {field: "dataSourceName",title: "Data Source Id"},
					  {field: "dataType",title: "Data Type"},
					  {field: "physicalQuantity",title: "Physical Quantity"},
					  {field: "unit",title: "Unit of Measurement",template :"#: FnCheckForUnitless(unit)#"}];
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

function FnCheckForUnitless(VarUnit){		
	if (VarUnit =='unitless') {VarUnit=' - '};
	return VarUnit;
}

function FnResFindNameTags(response){
	var ArrResponse = response;
	var ArrResData = [];
	var name_tag_multiselect = $("#name-tag-placeholder").data("kendoMultiSelect");
	
	if($.isArray(ArrResponse)){
		var arrVal=[];
		$.each(ArrResponse,function(key,val){
			$.each(val.dataprovider,function(key,val){
					if(val.key == 'name'){
						arrVal.push(val.value);					
					}			
			});		
		});
		//console.log(arrVal);
		name_tag_multiselect.value(arrVal);
		$('#name-tag-placeholder :selected').each(function(i, selected) {
			$("#name-tag-placeholder_listbox .k-item")[$(selected).index()].disabled = true;
			//$("#roleName_listbox .k-item").addClass("k-state-disabled");
			$(".k-multiselect-wrap.k-floatwrap").find('.k-icon.k-i-close').remove();
			//$(".k-multiselect-wrap.k-floatwrap").find('.k-button').addClass("k-state-disabled");
			
		});
		
		$('#nametag-update-flag').val("true");
	}
	//name_tag_multiselect.enable(false);	
}



/********************************************************************************/






function FnInitializeAssetListGrid(){
	var ArrGridColumns = FnGetGridColumns();
	
	var PointMapLink = (ObjPageAccess['mappoint']=='1') ? " &nbsp;<a class='grid-asset-mappoints btn btn-sm btn-raised default' data-toggle='tooltip' data-placement='left' title='Map points'><i class='smicon sm-linkicon'></i></a>" : "";
	var Actionlink = (ObjPageAccess['dashboard']=='1') ? '<a  href="javascript:void(0);" class="grid-asset-dashboard btn btn-sm btn-raised default"  data-toggle="tooltip" data-placement="bottom"  title="Asset dashboard"><i class="smicon sm-metericon"></i></a>' : "";
	var VarActionsLink = '<div class="asset-actions">';
	
	VarActionsLink +=  Actionlink +PointMapLink;
	
	VarActionsLink += '</div>';
	
	ArrGridColumns.push({title: "Action",template: VarActionsLink,filterable: false,sortable: false,width:150});
	var ObjGridConfig = {
		"scrollable" : true,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : true
	};
	FnDrawGridView('#gapp-asset-list',[],ArrGridColumns,ObjGridConfig);
}

function FnGetAssetTypes(){
	var VarUrl = GblAppContextPath+'/ajax' + VarListTemplateUrl + "?domain_name="+ VarCurrentTenantInfo.tenantDomain;
	FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResAssetTypes);
}

function FnResAssetTypes(response){
	var ArrResponse = response;
	if($.isArray(ArrResponse)){
		var VarAssetTypesTxt = '<option value=""> All</option>';
		$.each(ArrResponse,function(key,val){
			VarAssetTypesTxt += '<option value="'+val.assetType+'">'+val.assetType+'</option>';
		});
		$('#assetCategory').html(VarAssetTypesTxt);
	}
	
}

function FnGetAssetList(VarAssetType){
	$("#GBL_loading").show();
	if(VarAssetType != undefined){
		if(VarAssetType != ''){
			var VarUrl = GblAppContextPath+'/ajax' + VarListAssetsUrl + "?domain_name=" + VarCurrentTenantInfo.tenantDomain + "&asset_type=" + VarAssetType;
		} else {
			var VarUrl = GblAppContextPath+'/ajax' + VarListAssetsUrl + "?domain_name=" + VarCurrentTenantInfo.tenantDomain;
		}
	} else {
		var VarUrl = GblAppContextPath+'/ajax' + VarListAssetsUrl + "?domain_name=" + VarCurrentTenantInfo.tenantDomain;
	}

	 FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResAssetList);
}

function FnResAssetList(response){
	$("#GBL_loading").hide();
	var ArrResponse = response;
	var ArrGridColumns = FnGetGridColumns();
	if($.isArray(ArrResponse)){
		var ArrResponseData = [];
		if($('#assetCategory').val() != ''){
			var i=0;
			var column_count = 0;
			$.each(ArrResponse,function(){
				var element = {};
				if(this.assetTypeValues != undefined){
					$.each(this.assetTypeValues,function(){						
						element[this.key] = this.value;
						if(column_count < 4 && i == 0){								
							ArrGridColumns.push({title:this.key,field:this.key});
							column_count++;	
						}
					});
					i++;
				}
				element['assetName'] = this.assetName;
				element['description'] = this.description;
				element['assetId'] = this.assetId;
				element['serialNumber'] = this.serialNumber;
				element['assetType'] = this.assetType;
				element['identifier'] = this.assetIdentifier.value;
				ArrResponseData.push(element);
			});
		} else {
		
			$.each(ArrResponse,function(){
				var element = {};
				element['assetName'] = this.assetName;
				element['description'] = this.description;
				element['assetId'] = this.assetId;
				element['serialNumber'] = this.serialNumber;
				element['assetType'] = this.assetType;
				element['identifier'] = this.assetIdentifier.value;
				ArrResponseData.push(element);
			});
			
		}
	} else {
		var ArrResponseData = [];
	}
	
		
	var PointMapLink = (ObjPageAccess['mappoint']=='1') ? " &nbsp;<a href='Javascript:void(0)' class='grid-asset-mappoints' data-toggle='tooltip' title='Map Points'><i class='smicon sm-linkicon'></i></a>" : "";
	var Actionlink = (ObjPageAccess['dashboard']=='1') ? '<a  href="javascript:void(0);" class="grid-asset-dashboard"  data-toggle="tooltip" title="Asset Dashboard"><i class="smicon sm-metericon"></i></a>' : "";
	var VarActionsLink = '<div class="asset-actions">';
	
	VarActionsLink +=  Actionlink +PointMapLink;
	
	VarActionsLink += '</div>';
	
	ArrGridColumns.push({title: "Action",template: VarActionsLink,filterable: false,sortable: false,width:150});
				
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
		data = data.identifier;
		$("#gapp-asset-view #entity_id").val(data);
		$("#gapp-asset-view").submit();
	});
	
	$("#gapp-asset-list").data("kendoGrid").tbody.on("click", ".grid-asset-mappoints", function(e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-asset-list").data('kendoGrid').dataItem(tr);		
		FnSubmitEquipmentMapPoints(data);
	});
	
	
	$("#gapp-asset-list").data("kendoGrid").tbody.on("click", ".grid-asset-dashboard", function(e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-asset-list").data('kendoGrid').dataItem(tr);
		var equipmentId = data.identifier;
		$('#dashboard_equip_id').val(equipmentId);		
		$('#gapp-asset-dashboard').submit();
	});
	
}

function FnGetGridColumns(){
	
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a href='Javascript:void(0)' class='grid-asset-view capitalize' data-toggle='tooltip' title='View #=assetName# details'>#=assetName#</a>" : "<a href='Javascript:void(0)' class='capitalize'>#=assetName#</a>";
	
	var PointMapLink = (ObjPageAccess['mappoint']=='1') ? " &nbsp  &nbsp &nbsp <a class='grid-asset-mappoints' data-toggle='tooltip' data-placement='left' title='Map points'>Map Points</a>" : "";
	
	var VarActionsLink = '<div class="asset-actions">';
	VarActionsLink += '<a  href="javascript:void(0);" class="grid-asset-dashboard"  data-toggle="tooltip" data-placement="bottom" title="Asset Dashboard"><i class="smicon sm-metericon"></i></a>'+PointMapLink;
	VarActionsLink += '</div>';
	
	var ArrColumns = [
						{
							field: "assetName",
							title: "Asset Name",
							template: ViewLink
						},
						{
							field: "assetType",
							title: "Asset Type"
						},
						{
							field: "description",
							title: "Description"
						},
						{
							field: "assetId",
							title: "Asset Id"
						},
						{
							field: "serialNumber",
							title: "Serial Number"
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
	ObjEquipmentEntity['equipment']['platformEntity'] = {"platformEntityType": "MARKER"};
	ObjEquipmentEntity['equipName'] = ObjEquipment.assetName;
	
	$("#gapp-asset-pointmapping #equip_entity").val(JSON.stringify(ObjEquipmentEntity));
	$("#gapp-asset-pointmapping").submit();
}

function FnCreateAsset(){
	$('#gapp-asset-create').submit();
}
function FnCancelViewPoints(){
	FnFormRedirect('gapp-asset-view',GBLDelayTime);
	//$('#gapp-asset-create').submit();
}
	
	

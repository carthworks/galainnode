"use strict";

$(document).ready(function(){
	$(".k-grid-content").css("overflow", "scroll").css("overflow-x", "auto").scroll(function() {
		var left = $(this).scrollLeft();
		var wrap = $(".k-grid-header-wrap");
		if (wrap.scrollLeft() != left) wrap.scrollLeft(left);
	});
});

$(window).load(function() {
	FnInitializeAssetListGrid();
	FnGetPoiTypes();
	FnGetPoiList();
});	

function FnInitializeAssetListGrid(){
	var ArrGridColumns = FnGetGridColumns();
	
	var PointMapLink = (ObjPageAccess['mappoint']=='1') ? " &nbsp;<a class='grid-asset-mappoints btn btn-sm btn-raised default' data-toggle='tooltip' data-placement='left' title='Map points'><i class='smicon sm-linkicon'></i></a>" : "";
	var Actionlink = (ObjPageAccess['dashboard']=='1') ? '<a  href="javascript:void(0);" class="grid-asset-dashboard btn btn-sm btn-raised default"  data-toggle="tooltip" data-placement="bottom"  title="Asset dashboard"><i class="smicon sm-metericon"></i></a>' : "";
	var VarActionsLink = '<div class="asset-actions">';
	
	//VarActionsLink +=  Actionlink +PointMapLink;
	
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

function FnGetPoiTypes(){
	var VarUrl = GblAppContextPath+'/ajax' + VarListTemplateUrl + "?domain_name="+ VarCurrentTenantInfo.tenantDomain;
	console.log('types: '+VarUrl);
	console.log(JSON.stringify(VarCurrentTenantInfo));
	FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResPoiTypes);
}

function FnResPoiTypes(response){
	var ArrResponse = response;
	if($.isArray(ArrResponse)){
		var VarAssetTypesTxt = '<option value=""> All</option>';
		$.each(ArrResponse,function(key,val){
			VarAssetTypesTxt += '<option value="'+val.poiType+'">'+val.poiType+'</option>';
		});
		$('#assetCategory').html(VarAssetTypesTxt);
	}
	
}

function FnGetPoiList(VarPoiType){
	//alert(VarPoiType);
	$("#GBL_loading").show();
	if(VarPoiType != undefined){
		if(VarPoiType != ''){
			var VarUrl = GblAppContextPath+'/ajax' + VarListAssetsUrl + "?domain_name=" + VarCurrentTenantInfo.tenantDomain + "&poi_type=" + VarPoiType;
		} else {
			var VarUrl = GblAppContextPath+'/ajax' + VarListAssetsUrl + "?domain_name=" + VarCurrentTenantInfo.tenantDomain;
		}
	} else {
		var VarUrl = GblAppContextPath+'/ajax' + VarListAssetsUrl + "?domain_name=" + VarCurrentTenantInfo.tenantDomain;
	}
	console.log('>> '+VarUrl);
	 FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResPoiList);
}

function FnResPoiList(response){
	$("#GBL_loading").hide();
	var ArrResponse = response;
	console.log('---0');
	console.log(JSON.stringify(ArrResponse));
	
	var ArrGridColumns = FnGetGridColumns();
	
	if($.isArray(ArrResponse)){
		var ArrResponseData = [];
		if($('#assetCategory').val() != ''){
			var i=0;
			var column_count = 0;
			$.each(ArrResponse,function(){
				var element = {};
				
				if(this.poiTypeValues != undefined){
					$.each(this.poiTypeValues,function(){						
						element[this.key] = this.value;
						if(column_count < 4 && i == 0){								
							ArrGridColumns.push({title:this.key,field:this.key});
							column_count++;	
						}
					});
					i++;
				}
				element['poiName'] = this.poiName;
				//element['description'] = this.description;
				//element['assetId'] = this.assetId;
				//element['serialNumber'] = this.serialNumber;
				element['poiType'] = this.poiType;
				element['identifier'] = this.poiIdentifier.value;
				element['description'] = this.description;		
				element['latitude'] = this.latitude;
				element['longitude'] = this.longitude;
				element['radius'] = this.radius;
				ArrResponseData.push(element);
				//console.log('---1');
				//console.log(JSON.stringify(ArrResponseData));
			
			});
		} else {
		
			$.each(ArrResponse,function(){
				var element = {};
				element['poiName'] = this.poiName;				
				//element['assetId'] = this.assetId;
				//element['serialNumber'] = this.serialNumber;
				element['poiType'] = this.poiType;
				element['identifier'] = this.poiIdentifier.value;
				element['description'] = this.description;				
				element['latitude'] = this.latitude;
				element['longitude'] = this.longitude;
				element['radius'] = this.radius;
				ArrResponseData.push(element);
				//console.log('---2');
				//console.log(JSON.stringify(ArrResponseData));
			});
			
		}
		
		//[{"poiName":"Ajman","poiType":"PetrolPump","identifier":"18065df1-56f1-4690-8f34-089b58f2808e"}]
		
	} else {
		var ArrResponseData = [];
	}
	
		
	var PointMapLink = (ObjPageAccess['mappoint']=='1') ? " &nbsp;<a class='grid-asset-mappoints' data-toggle='tooltip' data-placement='left' title='Map points'><i class='smicon sm-linkicon'></i></a>" : "";
	var Actionlink = (ObjPageAccess['dashboard']=='1') ? '<a  href="javascript:void(0);" class="grid-asset-dashboard"  data-toggle="tooltip" data-placement="bottom"  title="Asset dashboard"><i class="smicon sm-metericon"></i></a>' : "";
	var VarActionsLink = '<div class="asset-actions">';
	
	//VarActionsLink +=  Actionlink +PointMapLink;
	
	VarActionsLink += '</div>';
	
	//ArrGridColumns.push({title: "Action",template: VarActionsLink,filterable: false,sortable: false,width:150});
				
	var ObjGridConfig = {
		"scrollable" : true,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : true
	};
	
	var objDatasource = {};
	objDatasource['data']=ArrResponseData;
	objDatasource['sort']={field: "poiName", dir: "asc"}
	
	var grid = $("#gapp-asset-list").data("kendoGrid");
	if(grid != undefined){ grid.destroy(); $('#gapp-asset-list').html(''); }
	
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-asset-list',objDatasource,ArrGridColumns,ObjGridConfig);
		
	$("#gapp-asset-list").data("kendoGrid").tbody.on("click", ".grid-asset-view", function(e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-asset-list").data('kendoGrid').dataItem(tr);
		data = data.identifier;
		console.log(data);
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
	
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a class='grid-asset-view capitalize'>#=poiName#</a>" : "<a href='Javascript:void(0)' class='capitalize'>#=poiName#</a>";
	
	var PointMapLink = (ObjPageAccess['mappoint']=='1') ? " &nbsp  &nbsp &nbsp <a class='grid-asset-mappoints' data-toggle='tooltip' data-placement='left' title='Map points'>Map Points</a>" : "";
	
	var VarActionsLink = '<div class="asset-actions">';
	VarActionsLink += '<a  href="javascript:void(0);" class="grid-asset-dashboard"  data-toggle="tooltip" data-placement="bottom" title="Asset Dashboard"><i class="smicon sm-metericon"></i></a>'+PointMapLink;
	VarActionsLink += '</div>';
	
	var ArrColumns = [
						{
							field: "poiName",
							title: "POI Name",
							template: ViewLink
						},
						{
							field: "poiType",
							title: "POI Type"
						},
						{
							field: "description",
							title: "Description"
						},
						{
							field: "latitude",
							title: "Latitude"
						},
						{
							field: "longitude",
							title: "Longitude"
						},
						
						{
							field: "radius",
							title: "Radius"
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
	ObjEquipmentEntity['equipName'] = ObjEquipment.poiName;
	
	$("#gapp-asset-pointmapping #equip_entity").val(JSON.stringify(ObjEquipmentEntity));
	$("#gapp-asset-pointmapping").submit();
}

function FnCreateAsset(){
	$('#gapp-poi-create').submit();
}
	
	

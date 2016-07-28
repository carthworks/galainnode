"use strict";

$(document).ready(function(){
	$('body').tooltip({
		selector: '.grid-viewconftemplate'
	});
	FnInitializeGrid();
});

$(window).load(function(){
	FnGetConfTemplateList();
});

function FnInitializeGrid(){
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a class='grid-viewconftemplate' style='text-transform: capitalize;'>#=name#</a>" : "<a href='Javascript:void(0)' style='text-transform: capitalize;'>#=name#</a>";
	
	var ArrColumns = [{field: "name",title: "Template Name",template: ViewLink },{field: "deviceType",title: "Device Type"},{field: "deviceMake",title: "Make"},{field: "deviceModel",title: "Model"},{field: "deviceProtocol",title: "Protocol"},{field: "deviceProtocolVersion",title: "Protocol Version"}];
	var ObjGridConfig = {
		"scrollable" : false,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"height" : 0,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : true
	};
	FnDrawGridView('#gapp-conftemplate-list',[],ArrColumns,ObjGridConfig);
}

function FnGetConfTemplateList(){
	$("#GBL_loading").show();
	var VarUrl = GblAppContextPath+'/ajax' + VarListConfTemplatesUrl;
	var VarParam = {};
	FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResConfTemplateList);
}

function FnResConfTemplateList(response){
	$("#GBL_loading").hide();
	var ArrResponse = response;
	console.log(ArrResponse);
	var VarResLength = ArrResponse.length;
	var ArrResponseData = [];
	if(VarResLength > 0){
		$(ArrResponse).each(function(){
			var element = {};
			element["name"] = this.name;
			element["deviceMake"] = this.deviceMake;
			element["deviceType"] = this.deviceType;
			element["deviceModel"] = this.deviceModel;
			element["deviceProtocol"] = this.deviceProtocol;
			element["deviceProtocolVersion"] = this.deviceProtocolVersion;
			ArrResponseData.push(element);
		});
	}
	
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a class='grid-viewconftemplate' style='text-transform: capitalize;'>#=name#</a>" : "<a href='Javascript:void(0)' style='text-transform: capitalize;'>#=name#</a>";
	
	var ArrColumns = [{field: "name",title: "Template Name",template: ViewLink },{field: "deviceType",title: "Device Type"},{field: "deviceMake",title: "Make"},{field: "deviceModel",title: "Model"},{field: "deviceProtocol",title: "Protocol"},{field: "deviceProtocolVersion",title: "Protocol Version"}];
	
	var ObjGridConfig = {
		"scrollable" : false,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"height" : 0,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : true
	};
	
	var objDatasource = {};
	objDatasource['data']=ArrResponseData;
	objDatasource['sort']={field: "name", dir: "asc"}
	
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-conftemplate-list',objDatasource,ArrColumns,ObjGridConfig);
		
	$("#gapp-conftemplate-list").data("kendoGrid").tbody.on("click", ".grid-viewconftemplate", function(e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-conftemplate-list").data('kendoGrid').dataItem(tr);
		$("#template_name").val(data.name);
		$("#gapp-conftemplate-view").submit();
	});	
}

function FnCreateConfTemplate(){
	$('#gapp-conftemplate-create').submit();
}




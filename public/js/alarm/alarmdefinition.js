"use strict";

$(document).ready(function () {
	
	//Splitter initiation from kendo
	var splitterElement = $("#splitter").kendoSplitter({
			panes : [{
					collapsible : true,
					size : '15%'
				}
			]
	});
	
	FnInitializePointsGrid();
	$('.alarm-assetcount').hide();
});

$(window).load(function(){
	FnGetAssetList();
});

function FnSelectRootNode(){
	var el = $('#gapp-assets-list');
	var tree = el.data('kendoTreeView');
	var firstNode = el.find('.k-first');
	tree.select(firstNode);
}

function FnGetAssetList(){	
	$("#GBL_loading").show();
	var VarUrl = GblAppContextPath+'/ajax' + VarListAssetsUrl + "?domain_name=" + VarCurrentTenantInfo.tenantDomain;
	FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResAssetList);
}

function FnResAssetList(response){
	$("#GBL_loading").hide();
	if($.isArray(response)){
		var VarResLength = response.length;
		var ArrData = [];
		ArrData.push({'id':VarCurrentTenantInfo.tenantId,'text':(VarCurrentTenantInfo.tenantName).toUpperCase()});
		if(VarResLength > 0){
			ArrData[0]['items'] = [];
			$.each(response,function(){
				ArrData[0]['items'].push({'id':this.assetIdentifier.value,'text':(this.assetName).toUpperCase(),'assetName':this.assetName,'assetType':this.assetType,'assetId':this.assetId});
			});
			$(".alarm-totalassetcount").text(VarResLength);
		}
		
	} else {
		var ArrData = [];
		ArrData.push({'id':VarCurrentTenantInfo.tenantId,'text':(VarCurrentTenantInfo.tenantName).toUpperCase()});
		ArrData[0]['items'] = [];
		if(response.errorCode != undefined){
			FnShowNotificationMessage(response);
		}
	}
	
	$("#gapp-assets-list").kendoTreeView({			
		dataSource: ArrData,
		select: function(e){
			
			var tree = $("#gapp-assets-list").getKendoTreeView();
			var dataItem = tree.dataItem(e.node);
			
			if(dataItem.assetName != undefined && dataItem.assetName != ''){
				$("#gapp-points-list").data("kendoGrid").dataSource.data([]);
				$(".alarm-assetname").text(dataItem.assetName);
				$('.alarm-totalpointcount').text(0);
				$('.alarm-assetcount').show();
				FnGetAssetPoints(dataItem.id);
			} else {
				$("#gapp-points-list").data("kendoGrid").dataSource.data([]);
				$('.alarm-totalpointcount').text(0);
				$('.alarm-assetcount').hide();
			}
		}
	});
	
	$('#gapp-assets-list #'+VarCurrentTenantInfo.tenantId).attr('disabled',true);
	var treeview = $("#gapp-assets-list").data("kendoTreeView");
	treeview.expand(treeview.findByText((VarCurrentTenantInfo.tenantName).toUpperCase()));
	//FnSelectRootNode();
	
	FnInitSearch("#gapp-assets-list", "#treeViewSearchInput");
}

function FnInitSearch(treeViewId, searchInputId) {

    var tv = $(treeViewId).data('kendoTreeView');

    $(searchInputId).on('keyup', function () {

        $(treeViewId + ' li.k-item').show();

        $('span.k-in > span.highlight').each(function () {
            $(this).parent().text($(this).parent().text());
        });

        // ignore if no search term
        if ($.trim($(this).val()) === '') {
            return;
        }

        var term = this.value.toUpperCase();
        var tlen = term.length;

        $(treeViewId + ' span.k-in').each(function (index) {
            var text = $(this).text();
            var html = '';
            var q = 0;
            var p;

            while ((p = text.toUpperCase().indexOf(term, q)) >= 0) {
                html += text.substring(q, p) + '<span class="highlight">' + text.substr(p, tlen) + '</span>';
                q = p + tlen;
            }

            if (q > 0) {
                html += text.substring(q);
                $(this).html(html);

                $(this).parentsUntil('.k-treeview').filter('.k-item').each(function (index, element) {
                    tv.expand($(this));
                    $(this).data('SearchTerm', term);
                });
            }
        });

        $(treeViewId + ' li.k-item:not(:has(".highlight"))').hide();
        //$(treeViewId + ' li.k-item').expand(".k-item");
		tv.expand(".k-item");
    });
}

function FnInitializePointsGrid(){
	var dataSource = new kendo.data.DataSource({
	   pageSize: 10,
	   data: [],
	   schema: {
		   model: {
			 id: "pointName",
			 fields: {
				pointName: { editable: false, nullable: true },
				alarmName: { validation: { required: true } },
				minVal : { type: "number"},
				minAlarmMsg : {
					validation: {
						required: false,
						minalarmmsgvalidation: function (input) {
							if(input.is("[name='minAlarmMsg']") && input.val() == "" && $('[name=minVal]').val()!='') {
								input.attr("data-minalarmmsgvalidation-msg", "message is required");
								return false;
							}
							return true;
						}
					}
				},
				maxVal : { type: "number"},
				maxAlarmMsg : {
					validation: {
						required: false,
						maxalarmmsgvalidation: function (input) {
							if(input.is("[name='maxAlarmMsg']") && input.val() == "" && $('[name=maxVal]').val()!='') {
								input.attr("data-maxalarmmsgvalidation-msg", "message is required");
								return false;
							}
							return true;
						}
					}
				},
				lowerRange : { type: "number"},
				upperRange : { type: "number"},
				rangeAlarmMsg : {
				
				},
				enabled: { type: "boolean" }
			 }
		   }
	   }
	});
	
	var ArrColumns = [{field: "pointName",title: "Point Name",editable: false},{field: "alarmName",title: "Alarm Name"},{title: "Alarm Value Settings",columns:[{field:"minVal",title:"Min",filterable:false},{field:"minAlarmMsg",title:"Message",filterable:false},{field:"maxVal",title:"Max",filterable:false},{field:"maxAlarmMsg",title:"Message",filterable:false}]},{title: "Alarm Range Settings",columns:[{field:"lowerRange",title:"Min",filterable:false},{field:"upperRange",title:"Max",filterable:false},{field:"rangeAlarmMsg",title:"Message",filterable:false}]},{field:"enabled",title:"Status",filterable:false},{title:"Action",filterable:false,command: ["edit"]}];
	
	var ObjGridConfig = {
		"scrollable" : false,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"height" : 0,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : true,
		"editable" : "inline"
	};
	

	FnDrawGridView('#gapp-points-list',dataSource,ArrColumns,ObjGridConfig);
}

function FnGetAssetPoints(VarAssetIdentifier){
	$("#GBL_loading").show();
	var VarUrl = GblAppContextPath+ '/ajax' + VarAssetsPointsUrl;
	var ObjParam = {
		"actor": {
			"platformEntity": {
				"platformEntityType": "MARKER"
			},
			"domain": {
				"domainName": VarCurrentTenantInfo.tenantDomain
			},
			"entityTemplate": {
				"entityTemplateName": "Asset"
			},
			"identifier": {
				"key": "identifier",
				"value": VarAssetIdentifier
			}
		},
		"searchTemplateName": "Point",
		"searchEntityType": "MARKER"
	};
	
	FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(ObjParam), 'application/json; charset=utf-8', 'json', FnResAssetPoints);
}

function FnResAssetPoints(response){
	
	if($.isArray(response)){
		var ArrPointsList = response;
		if(ArrPointsList.length >0){
			var ObjAlarmDefinition = FnGetAlarmDefinitionList();
			var ObjSelAsset = FnGetSelectedTreeInfo();
			
			var ArrRes = [];
			$.each(ArrPointsList,function(){
				var element = {};
				$.each(this.dataprovider,function(){
					if(this.key === 'dataSourceName' || this.key === 'displayName' || this.key === 'pointName' || this.key === 'pointId' || this.key === 'dataType' || this.key === 'dataType'){
						if(this.key === 'dataSourceName'){
							element['sourceId'] = FnTrim(this.value);
						} else if(this.key === 'dataType'){
							element['unit'] = FnTrim(this.value);
						} else {
							element[this.key] = FnTrim(this.value);
						}
					}
				});

				if(!$.isEmptyObject(element) && $.inArray(element['displayName'],FnGetThresholdPointNames()) != -1){
				
					element['alarmName'] = (ObjAlarmDefinition[element['displayName']] != undefined) ? ObjAlarmDefinition[element['displayName']]['alarmName'] : '';
					element['minVal'] = (ObjAlarmDefinition[element['displayName']] != undefined) ? ObjAlarmDefinition[element['displayName']]['minVal'] : '';
					element['minAlarmMsg'] = (ObjAlarmDefinition[element['displayName']] != undefined) ? ObjAlarmDefinition[element['displayName']]['minAlarmMsg'] : '';
					element['maxVal'] = (ObjAlarmDefinition[element['displayName']] != undefined) ? ObjAlarmDefinition[element['displayName']]['maxVal'] : '';
					element['maxAlarmMsg'] = (ObjAlarmDefinition[element['displayName']] != undefined) ? ObjAlarmDefinition[element['displayName']]['maxAlarmMsg'] : '';
					element['lowerRange'] = (ObjAlarmDefinition[element['displayName']] != undefined) ? ObjAlarmDefinition[element['displayName']]['lowerRange'] : '';
					element['upperRange'] = (ObjAlarmDefinition[element['displayName']] != undefined) ? ObjAlarmDefinition[element['displayName']]['upperRange'] : '';
					element['rangeAlarmMsg'] = (ObjAlarmDefinition[element['displayName']] != undefined) ? ObjAlarmDefinition[element['displayName']]['rangeAlarmMsg'] : '';
					element['enabled'] = (ObjAlarmDefinition[element['displayName']] != undefined) ? ObjAlarmDefinition[element['displayName']]['enabled'] : '';
					
					element['isExist'] = (ObjAlarmDefinition[element['displayName']] != undefined) ? true : false;
					element['deviceId'] = "";
					element['assetId'] = ObjSelAsset['assetId'];
					element['assetName'] = ObjSelAsset['assetName'];
					element['message'] = "Temperature Out of reach";
					
					ArrRes.push(element);
				}
			});
			$(".alarm-totalpointcount").text(ArrRes.length);		
			$("#GBL_loading").hide();
			$("#gapp-points-list").data("kendoGrid").dataSource.data(ArrRes);
			
			var pointlist = $("#gapp-points-list").data("kendoGrid");
			pointlist.bind("edit", FnPointEditEvent);
			pointlist.bind("save", FnPointSaveEvent);
			
			
		}
	} else if(response.errorCode != undefined){
		$("#GBL_loading").hide();
		FnShowNotificationMessage(response);
	}
}

function FnPointEditEvent(e){
	console.log('update');
}

function FnPointSaveEvent(e){
	console.log(e.model);	
	var VarIsExist = e.model.isExist;
	var VarUrl = GblAppContextPath+ '/ajax' + VarDefinitionCreateUrl;
	var ObjParam = {};
	ObjParam = e.model;
	//delete ObjParam.dirty;
	//delete ObjParam.id;
	//delete ObjParam.isExist;
	//delete ObjParam.uid;
	console.log(JSON.stringify(ObjParam));
	$("#GBL_loading").show();
	if(VarIsExist == true){ // UPDATE
		console.log('update');
		FnMakeAsyncAjaxRequest(VarUrl, 'PUT', JSON.stringify(ObjParam), 'application/json; charset=utf-8', 'json', FnResPointUpdate);
	} else { // SAVE		
		console.log('save');
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(ObjParam), 'application/json; charset=utf-8', 'json', FnResPointSave);
	}
}

function FnResPointSave(response){
	$("#GBL_loading").hide();
	
	if(!$.isEmptyObject(response)){
		if(response.errorCode == undefined){
			var grid = $("#gapp-points-list").data("kendoGrid");
			for (var k = 0; k < grid.dataSource.view().length; k++) {
				var VarChkId = grid.dataSource.view()[k].displayName;
				if (response.displayName === VarChkId) {
					var item = grid.dataSource.view()[k];
					item.set('isExist', true);
				}
			}
			
			notificationMsg.show({
				message : 'Alarm config added successfully'
			}, 'success');
		
		} else {
			FnShowNotificationMessage(response);
		}
	}
}

function FnResPointUpdate(response){
	$("#GBL_loading").hide();
	
	if(response.status == 'SUCCESS'){
		notificationMsg.show({
			message : 'Alarm config updated successfully'
		}, 'success');
	} else if(response.errorCode != undefined){
		FnShowNotificationMessage(response);
	}
}

function FnGetThresholdPointNames(){
	var ArrPointNames = ["Engine Oil Temperature 1:n0-250","Engine Fuel Rate:n49-867","Accelerator Pedal Position 1:n49-792","Engine Speed:n0-34","Barometric Pressure:n0-323","Engine Oil Pressure:n0-255","Cruise Control Set Speed:n0-260","Wheel-Based Vehicle Speed:n49-811","Fuel Level 1:n49-873"];
	return ArrPointNames;
}

function FnGetSelectedTreeInfo(){
	var tree = $("#gapp-assets-list").getKendoTreeView();
	var selected = tree.select();
	var ObjSelAsset = tree.dataItem(selected);
	return ObjSelAsset;
}

function FnGetAlarmDefinitionList(){
	var ObjAlarmDefinition = {};
	var ObjSelAsset = FnGetSelectedTreeInfo();
		
	var VarUrl = GblAppContextPath+ '/ajax' + VarDefinitionListUrl;
	VarUrl = VarUrl.replace("{assetName}",ObjSelAsset.assetName);
		
	$.ajax({
		type: 'GET',
		cache: true,
		async: false,
		contentType: 'application/json; charset=utf-8',
		url: VarUrl,
		dataType: 'json',
		success:function(response){
			
			if(response.errorCode != undefined){
				ObjAlarmDefinition = {};
			} else {
				$.each(response,function(key,obj){
					ObjAlarmDefinition[obj['displayName']] = obj;
				});
			}
		},
		error:function(){
		
		}
	});
	
	return ObjAlarmDefinition;
}
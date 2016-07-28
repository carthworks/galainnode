var VarWebsocketType;
function FnGetSubscriptionInfo(ArrDataSources,VarType){
	console.clear();
	VarWebsocketType = VarType;
	//console.log('Websocket type: '+VarWebsocketType);
	
	switch (VarType) {
	  case "mqtt":
		var VarUrl = GblAppContextPath + '/ajax' + VarMqttLiveSubscribeUrl;
		break;
	  case "weborb":
		var VarUrl = GblAppContextPath + '/ajax' + VarLiveSubscribeUrl;
		break;
	  default:
		//console.log('ERROR: Websocket type not defined');
	}
		
	FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(ArrDataSources), 'application/json; charset=utf-8', 'json', FnResSubscriptionInfo);	
}

function FnResSubscriptionInfo(response){
	//console.log('RESPONSE FnResSubscriptionInfo');
	
	var ObjResponse = response;
	if(!$.isEmptyObject(ObjResponse)){
		if(ObjResponse.webSocketUrl != undefined && ObjResponse.destination != undefined){
			var VarWebsocketUrl = ObjResponse.webSocketUrl;
			var VarDestination = ObjResponse.destination;
			// var VarWebsocketUrl = 'ws://185.3.154.159:9001/mqtt';
			// var VarDestination = 'LiveFeeds/Data/259642460474004';
			
			FnSubscribe(VarWebsocketUrl,VarDestination);
		}
	}
}

var myConsumer;
var GblIsSubcribe = false;
var VarMqttDestination;
function FnSubscribe(Websocketurl,destination){
	//console.log('Websocketurl: ' +Websocketurl+  '/ '+' / Destination: '+destination);
	
	GblIsSubcribe = true;

	if(VarWebsocketType == 'mqtt'){
		VarMqttDestination = destination;
		var uuid = generateUUID();
		//console.log('Client ID: '+uuid);
		client = new Paho.MQTT.Client(Websocketurl, uuid);
		
		// set callback handlers
		client.onConnectionLost = onMqttConnectionLost;
		client.onMessageArrived = onMqttMessageArrived;

		// connect the client
		client.connect({
			onSuccess : onMqttConnect
		});
		
	}else if(VarWebsocketType == 'weborb'){
		webORB.defaultMessagingURL = Websocketurl;
		myConsumer = new Consumer(destination, new Async(FnHandleWebOrbMessage,FnHandleWebOrbFault));
		myConsumer.subscribe();
		
	}
}

function FnUnSubscribe(){	
	GblIsSubcribe = false;
	//console.log("Unsubscribed");

	if(VarWebsocketType == 'mqtt'){
		client.disconnect();
	}else if(VarWebsocketType == 'weborb'){
		myConsumer.unsubscribe();	
	}		
}

function FnHandleLatestData(message){
	//console.log("latest Data:" + message);
	if(message.body != undefined){
		var	data = message.body[0];
		// var VarDSName = data.datasourceName;
		// var ArrParameters = data.parameters;
		
		FnSetDataUI(data,true);
	}else{
		var ObjError = {"errorCode" : "500", "errorMessage" : "Data Undefined"};
		FnShowNotificationMessage(ObjError);
		return false;
			
	}
}


	// Mqtt callback methods
	function onMqttConnect(message) {
		//console.log("Connecting to " + VarMqttDestination);
		client.subscribe(VarMqttDestination);
	}
	
	function onMqttMessageArrived(message) {
		//console.log("onMqttMessageArrived:" + message.payloadString);
		FnHandleMqttMessage(message.payloadString);	
	}
	
	function onMqttConnectionLost(responseObject) {
		if (responseObject.errorCode !== 0) {
			//console.log("onMqttConnectionLost:" + responseObject.errorMessage);
			
			var ObjError = {"errorCode" : "500", "errorMessage" : "Live subscription has been lost!"};
			FnShowNotificationMessage(ObjError);
		}
	}

	function FnHandleMqttMessage(message){
		if(message != undefined){
			var data = $.parseJSON(message);
			// var VarDSName = data.datasourceName;
			// var ArrParameters = data.parameters;
			FnSetDataUI(data,false);
		}
	}
		
	// WebOrb callback methods
	function FnHandleWebOrbMessage(message){
		console.log("webOrbMessageArrived:" + message);
		if(message.body != undefined){
			var	content = message.body[0];
			var data = $.parseJSON(content);
			// var VarDSName = data.datasourceName;
			// var ArrParameters = data.parameters;
			FnSetDataUI(data,false);
		}
	}
	
	function FnHandleWebOrbFault(fault) {
		//console.log('WebOrb fault');
	}
	
	function generateUUID() {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
	};
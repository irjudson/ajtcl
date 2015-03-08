var alljoyn = require("../../build/Release/alljoyn");

var CONNECT_TIMEOUT     = (1000 * 60);
var UNMARSHAL_TIMEOUT   = (1000 * 5);
var SLEEP_TIME          = (1000 * 2);

var serviceName = "org.alljoyn.Bus.sample";
var servicePath = "/sample";
var servicePort = 25;
var connected = false;
var status = null;

var sampleInterfaces = alljoyn.AJ_InterfacesCreate();
var sampleInterface = alljoyn.AJ_InterfaceDescriptionCreate(serviceName);
sampleInterface = alljoyn.AJ_InterfaceDescriptionAdd(sampleInterface, '?Dummy foo<i');
sampleInterface = alljoyn.AJ_InterfaceDescriptionAdd(sampleInterface, '?Dummy2 fee<i');
sampleInterface = alljoyn.AJ_InterfaceDescriptionAdd(sampleInterface, '?cat inStr1<s inStr2<s outStr>s');
sampleInterfaces = alljoyn.AJ_InterfacesAdd(sampleInterfaces, sampleInterface);

var alljoynObject = new alljoyn.AJ_Object();
alljoynObject.path = servicePath;
alljoynObject.interfaces = sampleInterfaces;

var appObjects = alljoyn.AJ_ObjectsCreate();
appObjects = alljoyn.AJ_ObjectsAdd(appObjects, alljoynObject);

alljoyn.AJ_Initialize();
alljoyn.AJ_PrintXML(appObjects);
alljoyn.AJ_RegisterObjects(null, appObjects);
var bus = new alljoyn.AJ_BusAttachment();
var sessionOpts = new alljoyn.AJ_SessionOpts();

while (true) {
	var msg = new alljoyn._AJ_Message();
	if (!connected) {
		var sessionOpts = new alljoyn.AJ_SessionOpts();
		status = alljoyn.AJ_StartService(bus, "", CONNECT_TIMEOUT, alljoyn.FALSE, servicePort, serviceName, alljoyn.AJ_NAME_REQ_DO_NOT_QUEUE, sessionOpts);
		if (status == alljoyn.AJ_OK) {
			connected = true;
		}
	}
	status = alljoyn.AJ_UnmarshalMsg(bus, msg, UNMARSHAL_TIMEOUT);
	if (status == alljoyn.AJ_ERR_TIMEOUT) {
		continue;
	}
	if (status == alljoyn.AJ_OK) {
		switch (msg.msgId) {
			case alljoyn.AJ_METHOD_ACCEPT_SESSION:
				var port, joiner;
	            alljoyn.AJ_UnmarshalArgs(msg, "qus", port, sessionId, joiner);
	            status = alljoyn.AJ_BusReplyAcceptSession(msg, alljoyn.TRUE);
		        break;
	        case alljoyn.BASIC_SERVICE_CAT:
				var string0, string1;
				var reply = new alljoyn._AJ_Message();
			    var replyArg = new alljoyn.AJ_Arg();
			    alljoyn.AJ_UnmarshalArgs(msg, "ss", string0, string1);
			    alljoyn.AJ_MarshalReplyMsg(msg, reply);
			    alljoyn.AJ_InitArg(replyArg, alljoyn.AJ_ARG_STRING, 0, string0+string1, 0);
			    alljoyn.AJ_MarshalArg(reply, replyArg);
			    status = alljoyn.AJ_DeliverMsg(reply);
	            break;
	        case alljoyn.AJ_SIGNAL_SESSION_LOST_WITH_REASON:
	            var id, reason;
	            alljoyn.AJ_UnmarshalArgs(msg, "uu", id, reason);
	            status = alljoyn.AJ_ERR_SESSION_LOST;
	            break;
	        default:
	            status = alljoyn.AJ_BusHandleBusMessage(msg);
	            break;
		}
	}
	alljoyn.AJ_CloseMsg(msg);
    if ((status == alljoyn.AJ_ERR_SESSION_LOST || status == alljoyn.AJ_ERR_READ)) {
        alljoyn.AJ_Disconnect(bus);
        connected = alljoyn.FALSE;
        alljoyn.AJ_Sleep(SLEEP_TIME);
    }
}
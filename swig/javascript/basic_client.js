var alljoyn = require("../../build/Release/alljoyn");

var serviceName = "org.alljoyn.Bus.sample";
var servicePath = "/sample";
var servicePort = 25;
var sessionId = null;

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
status, sessionId = alljoyn.AJ_StartClient(bus, "", 6 * 1000, alljoyn.FALSE, serviceName, servicePort, sessionOpts);

console.log("---- 0 ---- ");
var msg = new alljoyn._AJ_Message();
var basic_client_cat = alljoyn.AJ_PRX_MESSAGE_ID(0,0,2);

console.log("---- 1 ---- ");
var status = alljoyn.AJ_MarshalMethodCall(bus, msg, basic_client_cat, serviceName, sessionId, 0, (1000));

console.log("---- 2 ---- ");
alljoyn.AJ_MarshalArgs(msg, 'ss', 'Hello ', 'World!');

console.log("---- 3 ---- ");
alljoyn.AJ_DeliverMsg(msg);

console.log("---- 4 ---- ");
var nextMsg = alljoyn._AJ_Message();
status = alljoyn.AJ_UnmarshalMsg(bus, nextMsg, 5000);
console.log("---- 5 ---- ");
if (nextMsg.msgId = alljoyn.AJ_REPLY_ID(basic_client_cat)) {
	var arg = alljoyn._AJ_Arg();
console.log("---- 6 ---- ");
	alljoyn.AJ_UnmarshalArg(nextMsg, arg);
console.log("---- 7 ---- ");
	console.log(serviceName+'.cat'+' (path='+servicePath+') returned: ' + arg.val.v_string);
}
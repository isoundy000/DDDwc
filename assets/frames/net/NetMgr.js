let
	G_NETTYPE = {
		httpPost: 1,
		httpGet: 3,
		pomelo: 4
	},
	netdef_reqmaxtime = 5000,
	NetMgr = function () {
		this.resetNetMgrData();
	},
	netMgr = NetMgr.prototype,
	g_instance = null;
window['G_NETTYPE'] = G_NETTYPE;
netMgr.resetNetMgrData = function () {
	this.msgindex = 0;//消息索引
	this.msgrecords = {};
	this._uid = null;
	this._token = null;
	this.timer_req = null;//请求的事件检测定时器
	this.reconnectingRecord = {};
	this.timer_req = setInterval(this.checkReq.bind(this), 1)
}
//设置登录信息
netMgr.setLoginInfo = function (uid, token) {
	this._uid = uid;
	this._token = token;
}
//高数网络管理pomelo断开了
netMgr.pomeloDisconnected = function () {
	console.log("告诉网络管理pomelo断开了")
	this.reconnectingRecord[G_NETTYPE.pomelo] = true;
}
//告诉网络管理pomelo正在连接中
netMgr.pomeloConnecting = function () {
	this.reconnectingRecord[G_NETTYPE.pomelo] = true;
}
netMgr.pomeloConnected = function () {
	if (this.reconnectingRecord[G_NETTYPE.pomelo]) {
		delete this.reconnectingRecord[G_NETTYPE.pomelo];
	}
}
//在LoginMgr重连后清空pomelo的请求
netMgr.clearPomeloReqs = function () {
	console.log("清空pomelo记录")
	//清除pomelo发送记录
	if (this.reconnectingRecord[G_NETTYPE.pomelo]) {
		delete this.reconnectingRecord[G_NETTYPE.pomelo];
	}
	for (let route in this.msgrecords) {
		let record = this.msgrecords[route];
		if (record.serverType == G_NETTYPE.pomelo) {
			delete this.msgrecords[route];
		}
	}
}
//重发pomelo的消息
netMgr.resendPomeloReqs = function () {
	console.log("重发pomelo记录")
	//说明重新连接上了去除重连pomelo的记录
	if (this.reconnectingRecord[G_NETTYPE.pomelo]) {
		delete this.reconnectingRecord[G_NETTYPE.pomelo];
	}
	//找到pomelo的发送记录重新发送
	let pomeloReSendMsgs = [];
	for (let route in this.msgrecords) {
		let record = this.msgrecords[route];
		if (record.serverType == G_NETTYPE.pomelo) {
			pomeloReSendMsgs.push(record);
		}
	}
	//重发pomelo的消息
	if (pomeloReSendMsgs.length > 0) {
		glGame.gameNet.reSendMsgs(pomeloReSendMsgs);
	}
}

//检测发送队列
netMgr.checkReq = function () {
	//超时的服务器类型
	//记录需要重新投递的http消息队列
	let httpReSendMsgs = [];
	//记录需要重连的网络
	let webNeedReconnect = {};
	for (let route in this.msgrecords) {
		let record = this.msgrecords[route];

		let date = new Date()
		let time = Date.parse(date);
		//console.log("需要显示菊花route=",route)
		if (time - record.time > netdef_reqmaxtime) {
			//如果是当前类型服务器已经停止了则直接不考虑其超时问题,直接加入到重连成功后的重发队列并移除
			//在重连前都要记录重发时间
			let date = new Date()
			let time = Date.parse(date);
			record.time = time;//重置发送时间
			switch (record.serverType) {
				case G_NETTYPE.pomelo: //表示长连接的服务器
					//说明需要重新连接
					webNeedReconnect[record.serverType] = true;
					record.waitreconnect = true;
					break;
				case G_NETTYPE.httpPost:
				case G_NETTYPE.httpGet:
					//短连接部分直接插入重新投递
					httpReSendMsgs.push(record);
					break;
			}
		}
	}
	//重发http的消息
	if (httpReSendMsgs.length > 0) {
		glGame.gameNet.reSendMsgs(httpReSendMsgs);
	}
	for (let serverType in webNeedReconnect) {
		//如果不是在重连中就去重连并且设置重连标记为true
		if (!this.reconnectingRecord[serverType]) {
			//去断开当前连接
			this.reconnectingRecord[serverType] = true;
			//console.log("需要显示菊花serverType=",serverType)
			let server_type = typeof serverType != "string" ? serverType : parseInt(serverType);
			switch (server_type) {
				case G_NETTYPE.pomelo://表示长连接的服务器
					console.log("在这里断开了")
					glGame.gameNet.disconnect();//LoginMgr里面会监听重连成功后的消息
					break;
				case G_NETTYPE.ws:
					break;
			}
		}
	}
}
//清除定时器
netMgr.clearTimer = function () {
	if (this.timer_req != null) {
		clearTimeout(this.timer_req);
		this.timer_req = null;
	}
}
netMgr.destroy = function () {
	this.clearTimer();
	this.resetNetMgrData();
}
//转换消息成带msgindex的格式
netMgr.convertMsg = function (route, msg, next) {
	let words = route.split('.');
	let wordslen = words.length
	let serverType = -1;
	let ret = null;
	let newmsg = null;
	if (wordslen <= 0) {
		return ret;
	}
	let server = words[0];
	switch (route) {
		case 'http.reqLogin':
		case 'http.reqRegister':
		case 'http.reqGameSwitch':
		case 'http.reqPoint':
		case 'http.reqPostPhoneCode':
		case 'http.reqResetPwd':
		case 'http.reqGameList':
		case 'http.ReqRegisterConfig':
		case 'http.reqUrl':
			break;
		default:
			if (this._uid == null || this._token == null) {
				return -1;
			}
			break;

	}
	switch (server) {
		case 'http':
			serverType = G_NETTYPE.httpPost;
			//判断http投递情况
			newmsg = {
				head: {
					msgindex: this.msgindex,
					token: this._token,
					route: route,
				},
				body: msg
			}

			break;
		case 'hget':
			serverType = G_NETTYPE.httpGet;
			//判断hget投递情况
			break;
		default:
			serverType = G_NETTYPE.pomelo;
			msg.msgindex = this.msgindex;
			//判断pomelo投递情况
			break;
	}
	//将消息保存下来

	let date = new Date()
	let time = Date.parse(date);
	let newRecord = {};
	newRecord['time'] = time;
	newRecord['serverType'] = serverType;
	newRecord['route'] = route;
	newRecord['next'] = next;
	newRecord['sendNum'] = 0;
	if (newmsg) {
		newRecord['msg'] = newmsg;
	}
	else {
		newRecord['msg'] = msg;
	}
	//判断这个服务器是否在重连，如果是在重连则加入重连后发送的队列
	if (this.reconnectingRecord[newRecord['serverType']]) {
		//记录成等待重连后发送
		newRecord['waitreconnect'] = true;
	}
	else {
		//已在重发列表中，需要禁止重复发包的几个协议
		if (this.msgrecords[route]) {
			switch (route) {
				case 'http.reqLogin':
					return null;
				default: break;
			}
		}
		this.msgrecords[route] = newRecord;
		ret = {
			serverType: serverType,
			msg: newRecord['msg'],
		}
	}
	this.msgindex++;
	return ret;
}
//消息回复后的处理
netMgr.doneWithRoute = function (route, code) {
	if (this.msgrecords[route]) {
		delete this.msgrecords[route];
	}
	console.log("当前消息队列的消息 this.msgrecords:", Object.keys(this.msgrecords));
	if (Object.keys(this.msgrecords).length == 0) {
		glGame.panel.closeJuHua();
	}
	glGame.panel.closeRoomJuHua();
}

module.exports = function () {
	if (!g_instance) {
		g_instance = new NetMgr();
	}
	return g_instance;
}();
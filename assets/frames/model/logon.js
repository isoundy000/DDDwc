/**
 * 登陆数据模块
 */
let
    ServerType = {
        server_gate: 1,
        server_connector: 2
    },
    PlatState = {
        state_gate: 1,
        state_connector: 2,
        state_plat: 3
    },
    Logon = function () {
        this.registerEvent();
        this.resetData();
    },
    logon = Logon.prototype,
    g_instance = null;

/**
 * 数据重置
 */
logon.resetData = function () {
    this.serverCfg = null;
    this._webRootUrl = null;
    this.m_servertype = null;
    this._uid = null;
    this._token = null;
    this.gate_host = null;
    this.gate_port = null;
    this.connector_host = null;
    this.connector_port = null;
    this.plat_state = null;
    this.b_switchAccount = null;
    this.verifiCD = 60;
    this.logondata = null;
    this.loginupdata = false;
};
/**
 * 注册事件监听
 * 数据模型的事件无需销毁
 * 理论上重启游戏后自动就不存在了
 */
logon.registerEvent = function () {
    glGame.emitter.on("updateServerCfg", this.onUpdateServerCfg, this);
    glGame.emitter.on("gate.entry.req", this.gate_entry_req, this);
    glGame.emitter.on("connector.entryHandler.enterPlat", this.connector_entryHandler_enterPlat, this);
    glGame.emitter.on("onKillOffline", this.onKillOffline, this);//玩家被踢下线监听
    glGame.emitter.on("updateUserData", this.updateUserData, this);
};

/**
 * 判定是否为ip
 * @param {String} obj
 */
logon.checkIP = function (obj) {
    var ip = obj;
    if (ip.indexOf(" ") >= 0) {
        ip = ip.replace(/ /g, "");
    }
    if (ip.toLowerCase().indexOf("http://") == 0) {
        ip = ip.slice(7);
    }
    if (ip.toLowerCase().indexOf("https://") == 0) {
        ip = ip.slice(8);
    }
    if (ip.slice(ip.length - 1) == "/") {
        ip = ip.slice(0, ip.length - 1);
    }
    var exp = null;
    let num = 0;
    // ipv4  ipv6
    for (let index in ip) { ip[index] === "." ? num++ : 0; }
    if (num <= 4)
        exp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    else
        exp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    var reg = ip.match(exp);
    if (reg == null) return false;//不合法
    else return true; //合法
};

/**
 * 更新连接服务器配置
 */
logon.onUpdateServerCfg = function () {
    this.serverCfg = glGame.servercfg.getServerCfg();
    let host = this.serverCfg["platSvrHost"],
        port = this.serverCfg["platSvrPort"];

    if (host.toLowerCase().indexOf("https://") >= 0 || host.toLowerCase().indexOf("http://") >= 0) this._webRootUrl = host;
    else this._webRootUrl = `http://${host}`;

    if (port > 0) this._webRootUrl = `${this._webRootUrl}:${port}`;
    glGame.gameNet.setWebHost(this._webRootUrl);
};
/**
 * 微信号登陆
 * @param {Object} msg
 */
logon.reqWxLogin = function (msg) {
    msg.gameSvrTag = this.serverCfg.gameSvrTag;
    msg.plat = 4;
    msg.imei = this.getMachineCode();
    if (cc.sys.isNative) {
        msg.registration_id = glGame.platform.getRegisID();
    }
    this.isAutoLogin = false;
    msg.phone_type = this.getPhoneType();
    glGame.gameNet.send_msg('http.reqLogin', msg, this.loginNext.bind(this));
    glGame.storage.setItem("loginCache", { plat: 4, pd: msg.username + msg.username, le: String(msg.username).length });
    glGame.storage.setItem("showTourist", {});
};
/**
 * 账号登陆
 * @param {Object} msg
 */
logon.reqAccLogin = function (msg) {
    this.firstlogin = false;//是否为第一次注册登录
    msg.gameSvrTag = this.serverCfg.gameSvrTag;
    msg.plat = 1;
    msg.imei = this.getMachineCode();
    this.logondata = { plat: msg.plat, password: msg.password, username: msg.username };
    this.isAutoLogin = false;
    msg.phone_type = this.getPhoneType();
    glGame.gameNet.send_msg('http.reqLogin', msg, this.loginNext.bind(this));
    glGame.storage.setItem("showTourist", {});
};
/**
 * 手机号登陆
 * @param {Object} msg
 */
logon.reqPhoneLogin = function (msg) {
    this.firstlogin = false;//是否为第一次注册登录
    msg.gameSvrTag = this.serverCfg.gameSvrTag;
    msg.plat = 5;
    msg.imei = this.getMachineCode();
    this.logondata = { plat: msg.plat, code: msg.code, username: msg.username };
    this.isAutoLogin = false;
    msg.phone_type = this.getPhoneType();
    glGame.gameNet.send_msg('http.reqLogin', msg, this.loginNext.bind(this));
    glGame.storage.setItem("showTourist", {});
};
/**
 * 游客数据获取
 */
logon.getVisitorData = function () {
    let msg = {
        gameSvrTag: this.serverCfg.gameSvrTag,
        plat: 2,
        username: "" + Date.now(),
        password: md5(Date.now().toString()),
        imei: this.getMachineCode(),
        phone_type: this.getPhoneType()
    };
    let visitorCache = glGame.storage.getItem("visitorCache");
    if (visitorCache) {
        // 判断登录缓存中的参数是否合法
        let necessary = ["plat", "pd", "le"];
        let isLegal = necessary.every(prop => {
            return typeof visitorCache[prop] !== "undefined" && visitorCache[prop] !== null;
        });
        if (isLegal) {
            msg.username = visitorCache.pd.substr(-visitorCache.le);
            msg.password = visitorCache.pd.substr(0, visitorCache.pd.length - visitorCache.le);
            msg.plat = visitorCache.plat;
        } else {
            glGame.storage.removeItemByKey("visitorCache");
            glGame.storage.setItem("visitorCache", { plat: msg.plat, pd: msg.password + msg.username, le: String(msg.username).length });
        }
    } else {
        glGame.storage.setItem("visitorCache", { plat: msg.plat, pd: msg.password + msg.username, le: String(msg.username).length });
    }
    return msg;
}

/**
 * 游客登陆
 */
logon.reqTouLogin = function () {
    let msg = this.getVisitorData();
    this.logondata = { plat: msg.plat, password: msg.password, username: msg.username };
    this.isAutoLogin = false;
    glGame.gameNet.send_msg('http.reqLogin', msg, this.loginNext.bind(this));

    glGame.storage.setItem("showTourist", {});
};
/**
 * 开发模式的账号登录
 */
logon.reqDevelopTouLogin = function (msg) {
    msg.password = md5("123456");
    msg.gameSvrTag = this.serverCfg.gameSvrTag;
    msg.plat = 3;
    msg.imei = this.getMachineCode();
    this.logondata = { plat: msg.plat, password: msg.password, username: msg.username };
    this.isAutoLogin = false;
    msg.phone_type = this.getPhoneType();
    glGame.gameNet.send_msg('http.reqLogin', msg, this.loginNext.bind(this));

    glGame.storage.setItem("showTourist", {});
};
/**
 * 自动登陆
 */
logon.autoLogin = function () {
    let loginCache = glGame.storage.getItem("loginCache");
    if (loginCache) {
        // 判断登录缓存中的参数是否合法
        let necessary = ["plat", "pd", "le"];
        let isLegal = necessary.every(prop => { return typeof loginCache[prop] !== "undefined" && loginCache[prop] !== null; });
        if (isLegal) {
            let msg = {}
            msg.gameSvrTag = this.serverCfg.gameSvrTag;
            msg.username = loginCache.pd.substr(-loginCache.le);
            msg.password = loginCache.pd.substr(0, loginCache.pd.length - loginCache.le);
            msg.plat = loginCache.plat;
            msg.imei = this.getMachineCode();
            this.isAutoLogin = true;
            msg.phone_type = this.getPhoneType();
            glGame.gameNet.send_msg('http.reqLogin', msg, this.loginNext.bind(this));
            glGame.storage.setItem("showTourist", {});
            return true;
        } else {
            glGame.storage.removeItemByKey("loginCache");
        }
    }
    return false;
};

//后台踢玩家下线操作
logon.onKillOffline = function () {
    this.timeOut = setTimeout(() => {
        //清除登录缓存
        glGame.storage.removeItemByKey("loginCache");
        // 重启游戏
        reStartGame();
    }, 5000);
    glGame.panel.showMsgBox('提示', '        网络连接异常，请稍后重新登录！',
        () => {
            if (glGame.logon.timeOut != null) {
                clearTimeout(glGame.logon.timeOut);
            }
            //清除登录缓存
            glGame.storage.removeItemByKey("loginCache");
            // 重启游戏
            reStartGame();
        });
}

logon.getMachineCode = function () {
    let machineCode = cc.sys.isNative ? glGame.platform.getMachineCode() : 0;
    console.log("reqLogin machineCode", machineCode)
    return machineCode;
};

logon.getPhoneType = function () {
    let phoneType = cc.sys.isNative ? glGame.platform.getPhoneType() : null;
    console.log("reqLogin phoneType", phoneType)
    return phoneType;
};
/**
 * 账号注册
 * @param {Object} msg
 */
logon.reqRegister = function (msg) {
    this.firstlogin = true;//是否为第一次注册登录
    msg.gameSvrTag = this.serverCfg.gameSvrTag;
    msg.imei = this.getMachineCode();
    msg.phone_type = this.getPhoneType();
    if (cc.sys.isNative) {
        msg.registration_id = glGame.platform.getRegisID();
    }
    this.logondata = { plat: 1, password: msg.psw, username: msg.acc };
    glGame.gameNet.send_msg('http.reqRegister', msg, this.reqRegisterNext.bind(this));

};

/**
 * 注册接口回调
 * @param {String} route
 * @param {Object} data
 */
logon.reqRegisterNext = function (route, data) {
    this.recordLoinData();
    this.bindAgent = true;
    if (glGame.user.get("userID")) {
        glGame.gameNet.disconnect();

        this.loginPomelo(data);
    } else this.loginPomelo(data);
};
/**
 * 账号登入数据记录
 */
logon.recordLoinData = function () {
    if (!this.logondata) return;
    let msg = this.logondata;
    glGame.storage.setItem("loginCache", { plat: msg.plat, pd: msg.password + msg.username, le: String(msg.username).length });
    //手机不让它自动登录
    if (msg.plat == 5) {
        glGame.storage.removeItemByKey("loginCache");
    }
    this.logondata = null;
}

//获取游戏当前状态
logon.ReqGameState = function (gameid, next) {
    glGame.gameNet.send_msg('http.ReqGameState', { game_id: gameid }, (route, data) => {
        switch (data.state) {
            case 1:
                next(data.id);
                break;
            case 2:
                glGame.panel.showMsgBox('', '该游戏正在维护升级中，请稍后重试！', () => {
                    if (cc.director.getScene().name != 'plaza') {
                        reStartGame();
                    }
                });
                break;
            case 3:
                glGame.panel.showMsgBox('', '本游戏已经关闭！', () => {
                    if (cc.director.getScene().name != 'plaza') {
                        reStartGame();
                    }
                });
                break;
        }
    })
};

/**
 * 获取注册配表
 */
logon.reqRegisterConfig = function () {
    cc.log("获取注册配表")
    glGame.panel.showJuHua();
    glGame.gameNet.send_msg('http.ReqRegisterConfig', null, (route, data) => {
        cc.log("reqRegisterConfig", data);
        glGame.panel.hidejuhua();
        this.RegisterConfig = data;
        glGame.emitter.emit("RegisterConfig", data);
    });
};
/**
 * 发送验证码
 * @param {Object} msg
 */
logon.sendVerificationCode = function (msg) {
    if (this.verifiState) return;
    if (cc.sys.os === cc.sys.OS_ANDROID) {
        msg.phone_type = 1;
    } else if (cc.sys.os === cc.sys.OS_IOS) {
        msg.phone_type = 2;
    } else {
        msg.phone_type = 0;
    }
    glGame.gameNet.send_msg('http.reqPostPhoneCode', msg, (route, msg) => {
        this.verifiState = true;
        let updateVerifiCD = setInterval(() => {
            if (this.verifiCD < 0) {
                clearInterval(updateVerifiCD);
                this.verifiCD = 60;
                this.verifiState = false;
            } else {
                glGame.emitter.emit("logonVerifiUpdateCD", this.verifiCD);
                this.verifiCD--;
            }
        }, 1000)
        if (msg.is_code == 0) {
            glGame.panel.showErrorTip("发送验证码间隔过短");
        }
    });
};
/**
 *  重置用户密码
 * @param msg
 * @param next
 */
logon.reqResetPwd = function (msg, next) {
    glGame.gameNet.send_msg("http.reqResetPwd", msg, (route, data) => {
        glGame.panel.showTip("重置用户密码成功");
        glGame.emitter.emit("closeForget");
    });
};
/**
 * 登陆接口回调
 * @param {String} route
 * @param {Object} data
 */
logon.loginNext = function (route, data) {
    this.recordLoinData();
    glGame.isfirstEnterPlaza = true;
    if (glGame.user.get("userID")) {
        glGame.gameNet.disconnect();
        this.loginPomelo(data);

    } else this.loginPomelo(data);

};
/**
 * 链接 pomelo
 * @param {Object} msg
 */
logon.loginPomelo = function (msg) {
    this.m_servertype = ServerType.server_gate;
    this._uid = msg.uid;
    this._token = msg.token;
    //在网络管理中记录下登录信息
    glGame.gameNet.getNetMgr().setLoginInfo(this._uid, this._token);
    //登录成功后连接gate
    let servercfg = glGame.servercfg.getServerCfg();
    this.gate_host = servercfg["gameSvrHost"];
    this.gate_port = servercfg["gameSvrPort"];
    // this.gate_host=msg.host;
    // this.gate_port=msg.port;
    glGame.gameNet.connect(this.gate_host, this.gate_port, this.connectcb.bind(this));

    //推广绑定
    if (this.bindAgent) {
        if (cc.sys.isNative) {
            let getinstallCB = function (appData) {
                let defaultBindData = { "id": "0", "chanel": "0", "type": "1" };
                if (appData.bindData == "") {
                    glGame.gameNet.send_msg("http.ReqBindAgent", defaultBindData, (route, data) => {
                    })
                    return;
                }
                let bindData = JSON.parse(appData.bindData);
                defaultBindData.id = bindData.id ? bindData.id : defaultBindData.id;
                defaultBindData.chanel = bindData.chanel ? bindData.chanel : defaultBindData.chanel;
                defaultBindData.type = bindData.type ? bindData.type : defaultBindData.type;
                glGame.gameNet.send_msg("http.ReqBindAgent", defaultBindData, (route, data) => { })
            }
            glGame.oiSdk.getInstall(10, getinstallCB);
        } else {
            let bindData = { "id": "0", "chanel": "0", "type": "1" };
            glGame.gameNet.send_msg("http.ReqBindAgent", bindData, (route, data) => { })
        }
        this.bindAgent = false;
    }
};
/**
 * pomelo 链接回调
 * @param event_type
 * @param event
 */
logon.connectcb = function (event_type, event) {
    switch (this.m_servertype) {
        case ServerType.server_gate:
            this.gateConnectCb(event_type, event);
            break;
        case ServerType.server_connector:
            this.connectConnector(event_type, event);
            break;
    }
};
/**
 * pomelo connect 服链接回调
 * @param event_type
 * @param event
 */
logon.connectConnector = function (event_type, event) {
    switch (event_type) {
        case 'connect':
            glGame.gameNet.getNetMgr().pomeloConnected();
            console.log("连接上了", this.plat_state);
            switch (this.plat_state) {
                case PlatState.state_connector:
                    this.setState(PlatState.state_plat);
                case PlatState.state_plat:
                    // 无论什么时候都要重新进入平台
                    // 就清除pomelo的发送记录,那么房间那里会自己恢复房间
                    glGame.gameNet.getNetMgr().clearPomeloReqs();
                    this.enterPlat();
                    break;
            }
            break;
        case 'disconnect':
            //发起重连
            //告诉网络管理pomelo断开了
            glGame.gameNet.getNetMgr().pomeloDisconnected();
            glGame.gameNet.connect(this.connector_host, this.connector_port, this.connectcb.bind(this));
            break;
        case 'onKick':
            this.kicked();
            break;
    }
};
/**
 * pomelo gate 服链接回调
 * @param event_type
 * @param event
 */
logon.gateConnectCb = function (event_type, event) {
    switch (event_type) {
        case 'connect':
            //清除pomelo的发送队列
            glGame.gameNet.getNetMgr().pomeloConnected();
            glGame.gameNet.getNetMgr().clearPomeloReqs();
            this.queryEntry();//获得入口
            break;
        case 'disconnect':
            //gate断开有两种情况，一种是获取到了游戏服后断开，一种是gate服连接被拒
            console.log("断开了gate");
            //告诉网络管理pomelo断开了
            glGame.gameNet.getNetMgr().pomeloDisconnected();
            switch (this.plat_state) {
                case PlatState.state_connector:
                    //如果当前状态是连接服状态则去重新连接连接服
                    this.m_servertype = ServerType.server_connector;
                    glGame.gameNet.connect(this.connector_host, this.connector_port, this.connectcb.bind(this));
                    break;
                case PlatState.state_gate:
                    //如果当前状态是gate则在这里重连gate
                    glGame.gameNet.connect(this.gate_host, this.gate_port, this.connectcb.bind(this));
                    break;
            }
            break;
        case 'onKick':
            this.kicked();
            break;
    }
};
/**
 * pomelo gate 服链接成功后
 * 在向 gate 获取 connect 服的ip和端口
 */
logon.queryEntry = function () {
    console.log("向 gate 获取 connect 服的ip和端口");
    let route = 'gate.entry.req';
    let msg = {
        'uid': this._uid,
    };
    glGame.gameNet.send_msg(route, msg);
};
logon.enterPlat = function () {
    this.loginupdata = true;
    glGame.emitter.emit("loginSuccess");
};

//登入成功后才连接plat服务
logon.updateUserData = function () {
    if (this.loginupdata) {
        let msg = {
            token: this._token,
        };
        glGame.gameNet.send_msg("connector.entryHandler.enterPlat", msg);
        this.loginupdata = false;
    }
}
/**
 * 获取到 connect 配置后断开 gate 链接
 * @param {Object} msg
 */
logon.gate_entry_req = function (msg) {
    console.log("获取到 connect 配置, 断开 gate 链接");
    this.connector_host = msg.host;
    this.connector_port = msg.port;
    this.setState(PlatState.state_connector);
    glGame.gameNet.disconnect();
};
/**
 * 进入平台
 */
logon.connector_entryHandler_enterPlat = function (msg) {
    glGame.room.reqMyRoomState();
};
//设置当前状态
logon.setState = function (plat_state) {
    this.plat_state = plat_state;
};
logon.kicked = function () {
    this.logOut();
    if (this.b_switchAccount) { //判断自己是不是切换账号，就暴力重启
        this.b_switchAccount = false;
        reStartGame();
    } else {
        glGame.panel.showContactus(false, "        您的账号在别处登录，如果不是您在操作，可能已经被盗号，请及时联系客服！", reStartGame, reStartGame);
    }
};
logon.reLogon = function () {
    let loginCache = glGame.storage.getItem("loginCache");
    if (loginCache) {
        let username = loginCache.pd.substr(-loginCache.le);
        glGame.storage.setItem("number", { data: username })
    }
    //清除登录缓存
    glGame.storage.removeItemByKey("loginCache");
    // 重启游戏
    reStartGame();
};
/**
 * 退出登陆
 */
logon.logout = function () {
    this.b_switchAccount = true;
    glGame.gameNet.send_msg('connector.entryHandler.logout');
};
/**
 * 注销登陆
 */
logon.logOut = function () {
    glGame.storage.removeItemByKey("loginCache");
    // this.destroy();
    glGame.gameNet.destroy();
};
logon.destroy = function () {
    console.log("logon 清空了自己");
    this.resetData();
};
logon.set = function (key, value) {
    this[key] = value;
};
logon.get = function (key) {
    return this[key];
};

module.exports = function () {
    if (!g_instance) {
        g_instance = new Logon();
    }
    return g_instance;
};

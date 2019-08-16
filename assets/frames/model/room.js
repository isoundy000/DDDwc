

const ServerGameName = {
    15: "zjh", 18: "qznn",
    22: "brnn", 27: "sg", 28: "hh",
    29: "sgj", 30: "lhd", 31: "lb777",
    32: "bjl", 33: "pj", 34: "xydzp",
    35: "dzpk", 36: "ddz", 37: "jszjh", 39: "ebg", 38: "esyd", 40: "fish", 41: "qhbjl", 42: "sss", 43: "hcpy", 44: "slwh"
}

const ServerGameDict = {
    15: "炸金花", 18: "抢庄牛牛",
    22: "百人牛牛", 27: "三公", 28: "红黑大战", 29: "水果机",
    30: "龙虎斗", 31: "拉霸", 32: "百家乐", 33: "抢庄牌九", 34: "幸运大转盘",
    35: "德州扑克", 36: "斗地主", 37: "极速炸金花", 38: "二十一点", 39: "二八杠", 40: "捕鱼", 41: "红包接龙", 42: "十三水", 43: "豪车漂移", 44: "森林舞会"
}

const BET_TYPE = {
    1: '初级房',
    2: '中级房',
    3: '高级房',
    4: '贵宾房',
    5: '富豪房',
    99: '体验房'
}

const HUNDRE_GAME = {
    22: "brnn", 28: "hh", 29: "sgj", 30: "lhd", 32: "bjl", 43: "hcpy", 34: "xydzp", 41: "qhbjl", 44: "slwh"
}

const ROOM_TYPE = {
    GOLD: 1,       //金币场类型
    HUNDREDS: 5,   //百人场类型
    FISH: 6,         //捕鱼场类型
}

let
    Room = function () {
        this.changeTableState = false;
        this.resetData();
        this.registerEvent();
    },
    room = Room.prototype,
    g_instance = null;

room.resetData = function () {
    this.roominfo = null;
    this.GOLDTYPE = 1;
    this.HUNDREROOM = 5;
    this.curEnterGameID = 0;
    this.curEnterRoomID = 0;
    this.curEnterRoomServer = "";
    this.curEnterRoomType = 0;
    this.curEnterBetType = 0;
    this.curEnterGameRank = null;
    this.users = {};
    this.cutGameTime = 0;
    this.openNetCut = true;      //作用服务器，分服入口
    this.gameId = null;
    this.betType = null;
};

/**
 * 进入房间的网络参数
 */
room.getEnterRoom = function (gameId) {
    let gameid = gameId ? gameId : this.curEnterGameID;
    let gameName = ServerGameName[gameid];
    if (!gameid || !gameName) return;
    let netTt = ""
    if (this.openNetCut) netTt = `${gameName}Room.${gameName}RoomHandler.enterRoom`;
    else netTt = "connector.entryHandler.enterRoom";
    return netTt;
}
/**
 * 进入房间的参数配置
 */
room.getInitRoom = function (gameId) {
    let gameid = gameId ? gameId : this.curEnterGameID;
    let gameName = ServerGameName[gameid];
    if (!gameid || !gameName) return;
    let netTt = ""
    if (this.openNetCut) netTt = `${gameName}Room.${gameName}RoomHandler.initRoomData`;
    else netTt = "connector.entryHandler.initRoomData";
    return netTt;
}
/**
 * 退出房间的网络参数
 */
room.getExitRoom = function (gameId) {
    let gameid = gameId ? gameId : this.curEnterGameID;
    let gameName = ServerGameName[gameid];
    if (!gameid || !gameName) return;
    let netTt = ""
    if (this.openNetCut) netTt = `${gameName}Room.${gameName}RoomHandler.exitRoom`;
    else netTt = "room.roomHandler.exitRoom";
    return netTt;
}
/**
 * 发包的网络参数
 */
room.getPlayerOp = function (gameId) {
    let gameid = gameId ? gameId : this.curEnterGameID;
    let gameName = ServerGameName[gameid];
    if (!gameid || !gameName) return;
    let netTt = ""
    if (this.openNetCut) netTt = `${gameName}Room.${gameName}RoomHandler.playerOp`;
    else netTt = "room.roomHandler.playerOp";
    return netTt;
}
/**
 * 发送GM的网络参数
 */
room.getPlayerGmOp = function (gameId) {
    let gameid = gameId ? gameId : this.curEnterGameID;
    let gameName = ServerGameName[gameid];
    if (!gameid || !gameName) return;
    let netTt = ""
    if (this.openNetCut) netTt = `${gameName}Room.${gameName}RoomHandler.playerGmOp`;
    else netTt = "room.roomHandler.playerGmOp";
    return netTt;
}
/**
 * 网络数据监听
 */
room.registerEvent = function () {
    glGame.emitter.on("EnterBackground", this.EnterBackground, this);
    glGame.emitter.on("EnterForeground", this.EnterForeground, this);
    glGame.emitter.on("onDisbandRoom", this.onDisbandRoom, this);
    glGame.emitter.on("onGameFinished", this.onGameFinished, this);


    for (let key in ServerGameName) {
        if (!ServerGameName.hasOwnProperty(key)) continue;
        let name = ServerGameName[key];
        glGame.emitter.on(`${name}Room.${name}RoomHandler.vaildateRoomCondition`, this.vaildateRoomCondition, this);
        glGame.emitter.on(`${name}Room.${name}RoomHandler.enterRoom`, this.connector_entryHandler_enterRoom, this);
        glGame.emitter.on(`${name}Room.${name}RoomHandler.exitRoom`, this.room_roomHandler_exitRoom, this);
        glGame.emitter.on(`${name}Room.${name}RoomHandler.initRoomData`, this.room_roomHandler_initRoomData, this);
    }
};
/**
 * 网络数据监听销毁
 */
room.unRegisterEvent = function () {
    glGame.emitter.off("EnterBackground", this);
    glGame.emitter.off("EnterForeground", this);
    glGame.emitter.off("onDisbandRoom", this);
    glGame.emitter.off("onGameFinished", this);
    for (let key in ServerGameName) {
        if (!ServerGameName.hasOwnProperty(key)) continue;
        let name = ServerGameName[key];
        glGame.emitter.off(`${name}Room.${name}RoomHandler.vaildateRoomCondition`, this);
        glGame.emitter.off(`${name}Room.${name}RoomHandler.enterRoom`, this);
        glGame.emitter.off(`${name}Room.${name}RoomHandler.exitRoom`, this);
        glGame.emitter.off(`${name}Room.${name}RoomHandler.initRoomData`, this);
    }
};
/**
 * 加入金币场
 * @param {number} gameid   游戏id
 * @param {number} bettype  游戏场次
 */
room.reqGoldRoomVerify = function (gameid, bettype) {
    this.gameId = gameid;
    this.betType = bettype;
    let name = ServerGameName[gameid];
    glGame.gameNet.send_msg(`${name}Room.${name}RoomHandler.vaildateRoomCondition`, {
        "gameId": gameid,
        "betType": bettype,
    });
};

room.vaildateRoomCondition = function (msg) {
    console.log("加入金币场房间 ...", msg);
    glGame.room.logicDestroy();
    this.curEnterGameID = this.gameId;
    this.curEnterRoomType = ROOM_TYPE.GOLD;
    this.curEnterBetType = this.betType;
    this.enterGameRoom();
}
/**
 * 新
 * 加入金币场
 * @param {number} gameid   游戏id
 * @param {number} bettype  游戏场次
 */
room.setGoldRoomInfo = function (gameId, type) {
    glGame.room.logicDestroy();
    this.curEnterGameID = gameId;
    this.curEnterBetType = type;
    this.curEnterRoomType = ROOM_TYPE.GOLD;
    this.curEnterRoomServer = "";
    this.enterGameRoom();
};

/**
 * 加入百人场
 * @param {number} gameid 游戏id
 */
room.reqHundredsRoom = function (gameid, roomid, roomserver) {
    console.log("加入百人场房间 ...");
    glGame.room.logicDestroy();
    this.curEnterGameID = gameid;
    this.curEnterRoomID = roomid;
    this.curEnterRoomServer = roomserver;
    this.curEnterRoomType = ROOM_TYPE.HUNDREDS;
    this.curEnterBetType = 1;
    this.enterGameRoom();
};

/**
 * 加入捕鱼场
 * @param {number} roomType 房间类型
 */
room.sendEnterRoom = function (roomType) {
    this.curFishRoomType = roomType;
    this.logicDestroy();
    this.curEnterGameID = glGame.scenetag.FISH;
    this.curEnterRoomType = ROOM_TYPE.FISH;
    this.logicCreate();

    glGame.scene.setNextSceneTag(this.curEnterGameID);
    glGame.scene.enterNextScene().then(() => {
        let gunRate = cc.sys.localStorage.getItem(`${this.curFishRoomType}gunRate`) ? Number(cc.sys.localStorage.getItem(`${this.curFishRoomType}gunRate`)) : 1;
        let msg = {
            roomType: this.curFishRoomType,
            gunRate: gunRate
        };
        let _route = this.getEnterRoom();
        if (_route) {
            glGame.gameNet.send_msg(_route, msg);
        }
    });

};
/**
 * 设置进入房间参数
 * @param data
 */
room.setEnterGameInfo = function (data) {
    glGame.room.logicDestroy();
    this.curEnterGameID = data.gameid;
    this.curEnterRoomID = data.roomid;
    this.curEnterRoomType = data.roomtype;
    this.curEnterBetType = data.bettype;
    this.curEnterRoomServer = data.serviceid;
};
/**
 * 获取我的房间状态
 */
room.reqMyRoomState = function () {
    glGame.gameNet.send_msg("http.reqMyRoomState", null, (route, data) => {
        this.roomUserInfo = data.roomUserInfo;
        // 在房间内
        if (this.roomUserInfo && this.roomUserInfo.rid > 0) {
            glGame.room.logicDestroy();
            this.curEnterGameID = this.roomUserInfo.gameid;
            this.curEnterRoomType = this.roomUserInfo.roomtype;
            this.curEnterBetType = this.roomUserInfo.bettype;
            this.curEnterRoomID = this.roomUserInfo.rid;
            this.curEnterRoomServer = this.roomUserInfo.serviceid;
            this.enterGameRoom();
        } else {
            if (cc.director.getScene().name != 'login') {
                glGame.audio.stopAllMusic();
                glGame.isPlayPlazaBGM = true;
            }
            if (cc.director.getScene().name != 'plaza' && cc.director.getScene().name != 'login' && cc.director.getScene().name != '') {
                if (!this.reconenctPanel) {
                    glGame.panel.showMsgBoxZMax('提示', '网络连接异常，请重新进入房间!', (() => {
                        glGame.room.logicDestroy();
                        glGame.scene.setNextSceneTag(glGame.scenetag.PLAZA);
                        glGame.scene.enterNextScene();
                        this.reconenctPanel = false;
                    }));
                    this.reconenctPanel = true;
                }
            } else {
                glGame.scene.setNextSceneTag(glGame.scenetag.PLAZA);
                glGame.scene.enterNextScene();
            }
        }

    });
};
//进入房间前先确认一下是否还有其他游戏正在进行
room.reqMyGameState = function (_gameID, _roomType, _roomID) {
    return new Promise(function (resolve, reject) {
        glGame.gameNet.send_msg("http.reqMyRoomState", null, (route, data) => {
            if (data.roomUserInfo && data.roomUserInfo.rid > 0) {
                if (_gameID == data.roomUserInfo.gameid && _roomType == data.roomUserInfo.bettype && (!_roomID || _roomID == data.roomUserInfo.rid)) {
                    return resolve();
                }
                if (HUNDRE_GAME[data.roomUserInfo.gameid]) {
                    glGame.panel.showDialog('提示', `您在${ServerGameDict[data.roomUserInfo.gameid]}（${BET_TYPE[data.roomUserInfo.bettype]}-${data.roomUserInfo.rid}）的游戏还未结束，无法开始新游戏！`, () => {
                        glGame.room.reqHundredsRoom(data.roomUserInfo.gameid, data.roomUserInfo.rid, data.roomUserInfo.serviceid);
                    }, false, false, '回到游戏', false, true);
                } else {
                    glGame.panel.showDialog('提示', `您在${ServerGameDict[data.roomUserInfo.gameid]}（${BET_TYPE[data.roomUserInfo.bettype]}）的游戏还未结束，无法开始新游戏！`, () => {
                        glGame.room.setGoldRoomInfo(data.roomUserInfo.gameid, data.roomUserInfo.bettype);
                    }, false, false, '回到游戏', false, true);
                }
                return reject();
            }
            resolve();
        });
    })
};

/**
 * 进入房间
 */
room.enterGameRoom = function () {
    if (!cc.sys.isNative) {
        this.enterRoom();
    } else {
        let gameId = this.curEnterGameID;
        let gameName = glGame.scene.getSceneNameByID(gameId)
        let update_data = glGame.storage.getItem('update_data');
        if (update_data && update_data[gameName]) {
            this.enterRoom();
        } else {
            this.downloadGame(gameId, null, () => { this.enterRoom(); });
        }
    }
}

/**
 * 退出房间
 */

room.exitGameRoom = function () {
    glGame.scene.setNextSceneTag(glGame.scenetag.PLAZA);
    glGame.scene.enterNextScene().then(() => {
        this.logicDestroy();
        glGame.notice.resetData();
        if (this.curEnterGameID == glGame.scenetag.PLAZA) this.resetData();
    });
}


//临时清理下载
room.downloadGame = function (gameid, manifestUrl, call) {
    let assetsManager = new glGame.assets(glGame.scene.getSceneNameByID(gameid), manifestUrl, (process) => {
    }, () => {    // 成功回调
        call(gameid);
        assetsManager.destroy();
        assetsManager = null;
        let gameName = glGame.scene.getSceneNameByID(gameid)
        let hotUpdateURL = glGame.servercfg.getHotupdateVersionUrl();
        let url = `${hotUpdateURL}${gameName}/${gameName}version.manifest`
        glGame.gamelistcfg.getGameVersion(url).then(verdata => {
            let data = glGame.storage.getItem('update_data');
            if (data) {
                data[gameName] = verdata.version;
            } else {
                data = {};
                data[gameName] = verdata.version;
            }
            glGame.storage.setItem('update_data', data);
        })
    }, () => {    // 失败回调
        assetsManager.destroy();
        assetsManager = null;
    });
};

/**
 * 游戏结束的游戏状态
 * matchid
 * gameStatus 1 正常 2维护 3关闭
 */
room.onGameFinished = function (msg) {
    if (msg.gameStatus != 1) {
        setTimeout(() => {
            glGame.panel.showMsgBox('提示', '游戏已关闭，无法继续进行游戏！', () => { this.exitRoom(); })
        }, 2000)
    }
    //异常情况
    else if (glGame.user.get("gameException")) {
        glGame.panel.showDialog("", "        您好，您的账号存在异常，请及时联系客服！", () => { glGame.panel.showService() }, () => { this.exitRoom() }, "我知道了", "联系客服")
    }
    //踢下线
    else if (glGame.user.get("KickOutGame")) {
        glGame.panel.showMsgBox("", "        您好，您的账号存在异常，请及时联系客服！", () => { glGame.logon.reLogon() });
    }
    //禁止游戏
    else if (glGame.user.get("limitGame")) {
        glGame.panel.showDialog("", "        您好，您的账号存在异常，请及时联系客服！", () => { glGame.panel.showService() }, () => { this.exitRoom() }, "我知道了", "联系客服")
    }
};

/**
 * 进入房间
 */
room.enterRoom = function () {
    this.logicCreate();
    let msg = {
        roomtype: this.curEnterRoomType,
        gameid: this.curEnterGameID,
        bettype: this.curEnterBetType,
        serverId: this.curEnterRoomServer,
        roomId: this.curEnterRoomID,
    };
    if (this.curEnterRoomType == ROOM_TYPE.HUNDREDS) {
        let _route = this.getEnterRoom();
        if (_route) glGame.gameNet.send_msg(_route, msg);
    } else {
        glGame.scene.setNextSceneTag(this.curEnterGameID);
        glGame.scene.enterNextScene().then(() => {
            let _route = this.getEnterRoom();
            if (_route) glGame.gameNet.send_msg(_route, msg);
        });
    }
};
/**
 * 进入房间
 * @param {object} data
 */
room.connector_entryHandler_enterRoom = function (data) {
    console.log("connector_entryHandler_enterRoom")
    if (glGame.readyroom.get("gameid")) {
        glGame.readyroom.reqExitArea();
    }
    if (this.curEnterRoomType == ROOM_TYPE.HUNDREDS) {
        glGame.scene.setNextSceneTag(this.curEnterGameID);
        glGame.scene.enterNextScene().then(() => {
            let _route = this.getInitRoom();
            if (_route) glGame.gameNet.send_msg(_route, null);
        });
    }
};
/**
 * 房间配置
 * @param {object} data
 */
room.room_roomHandler_initRoomData = function (data) {
    console.log('room_roomHandler_initRoomData')
}
/**
 * 换桌
 */
room.changeTable = function () {
    glGame.storage.setItem("changeTable", { state: true });
    this.changeTableState = true;
    glGame.panel.showRoomJuHua();
    let _route = this.getExitRoom();
    if (_route) {
        glGame.gameNet.send_msg(_route, { exitType: 1 });
    }
};
/**
 * 退出房间
 * @param {number} exitType
 */
room.exitRoom = function (exitType = 0) {
    let _route = this.getExitRoom();
    console.log('exitRoom', _route)
    if (_route) {
        glGame.panel.showRoomJuHua();
        glGame.gameNet.send_msg(_route, { exitType: exitType });
        glGame.room.set('changeTableState', false);
    }
};
/**
 * 退出房间结果
 */
room.room_roomHandler_exitRoom = function (data) {
    glGame.panel.closeRoomJuHua();
    glGame.user.reqMyInfo();
    console.log("退出房间结果", data);
    let changeTableInfo = glGame.storage.getItem("changeTable");
    if (changeTableInfo && changeTableInfo.state) {
        let gameId = this.curEnterGameID,
            betType = this.curEnterBetType;
        this.logicDestroy();
        this.resetData();
        glGame.storage.removeItemByKey("changeTable");
        glGame.panel.showChangeTablePanel();

        if (glGame.enterRoomVerification) {
            glGame.room.reqGoldRoomVerify(gameId, betType);
        } else {
            glGame.room.setGoldRoomInfo(gameId, betType);
        }
    } else {
        glGame.audio.stopAllMusic();
        this.exitGameRoom();
        glGame.isPlayPlazaBGM = true;
    }
};
/**
 * 金币场房间解散
 */
room.onDisbandRoom = function () {
    glGame.panel.showMsgBox("", "该房间已经解散", () => {
        glGame.panel.closeRoomJuHua();
        this.exitGameRoom();
    });
};
/**
 * 游戏数据层初始化
 */
room.logicCreate = function () {
    let gameName = glGame.scene.getSceneNameByID(this.curEnterGameID);
    try {
        require(`${gameName}logic`).getInstance();
    } catch (e) {
        console.error(e);
    }
};
/**
 * 游戏数据层销毁
 */
room.logicDestroy = function () {
    console.log("-------------这是子游戏的数据层销毁--------------")
    let gameName = glGame.scene.getSceneNameByID(this.curEnterGameID);
    try {
        require(`${gameName}logic`).destroy();
    } catch (e) {
        console.error(e);
    }
};


room.enterRoomFailure = function () {
    this.logicDestroy();
    glGame.notice.resetData();
};

/**
 * http 换房接口
 * @param gameID 游戏ID
 * @param betType 场次类型
 * @param next
 */
room.reqChangeRoom = function (gameID, betType, next) {
    glGame.gameNet.send_msg("http.reqChangeRoom", { gameid: gameID, bettype: betType }, (route, msg) => {
        next();
    });
};
/**
 * 前后台切换断线一下
 */
room.EnterForeground = function () {
    let cutGameTime = Date.now().toString().substring(5);
    console.log("EnterForeground", cutGameTime, this.cutGameTime);
    if (cutGameTime - this.cutGameTime >= glGame.ground.cutgametime) {
        glGame.gameNet.disconnect();
    }
};
room.EnterBackground = function () {
    this.cutGameTime = Date.now().toString().substring(5);
};
/**
 * 获取用户信息
 * @param {Array} uids
 */
room.reqUsers = function (uids) {
    glGame.gameNet.send_msg("http.reqUsers", { "uids": uids }, (route, msg) => {
        let data = msg.users;
        let count = data.length;
        for (let i = 0; i < count; i++) {
            let user = data[i];
            this.users[user["id"]] = user;
        }
        glGame.emitter.emit("updateUsers");
    });
};
/**
 * 设置房间指定属性
 * @param {string} key      房间属性字段
 * @param {object} value    房间属性字段值
 */
room.set = function (key, value) {
    this[key] = value;
};
/**
 * 获取房间指定属性
 * @param {string} key
 * @returns {object}
 */
room.get = function (key) {
    return this[key];
};
room.getGameNameById = function (gameid) {
    let name = ServerGameName[gameid];
    return name;
};
room.getServerGameName = function () {
    return ServerGameName;
}
room.getGameDictById = function (gameid) {
    let name = ServerGameDict[gameid];
    return name;
};
module.exports = function () {
    if (!g_instance) {
        g_instance = new Room();
    }
    return g_instance;
};

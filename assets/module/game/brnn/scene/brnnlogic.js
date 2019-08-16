let CONFIGS = require("brnn_const");
let
    BrnnLogic = function () {
        this.resetData();
    },
    brnnLogic = BrnnLogic.prototype,
    g_instance = null;

brnnLogic.resetData = function () {
    this.waitTime = null;       //等待时间
    this.serverOffTime = null;//服务端时间差
    //已知有用的
    this.myUid = glGame.user.get("userID");
    this.MyheadURL = null;
    this.mylogicID = null;      //我的逻辑ID
    this.dealerUid = null;      //庄家的ID，
    this.dealerGold = null;     //庄家金币
    this.dealerLogicId = null;  //庄家逻辑ID
    this.isDealer = null;       //是否为庄家
    this.myAreaSettleInfo = null; //区域的输赢
    this.listRichInfo = null;       //富人榜信息
    this.areaBetLeiJi = 0;   //所有的下注的累计
    this.betLeiji = null;         //我的总下注累计
    this.playerList = null;     //玩家列表
    this.dictAllCards = null;       //所有的牌
    this.dealerResultType = null;   //庄家牌型
    this.userData = null;         //用户数据
    this.lastSettleInfo = null; //上局的结算信息
    this.dealerTotalSettle = null;   //庄家战绩
    this.userTotalSettle = null;

    this.myTianBetInfo = 0;    //我的天地玄黄的下注信息
    this.myDiBetInfo = 0;
    this.myXuanBetInfo = 0;
    this.myHuangBetInfo = 0;

    this.allTianBetInfo = 0;    //所有天地玄黄的下注信息
    this.allDiBetInfo = 0;
    this.allXuanBetInfo = 0;
    this.allHuangBetInfo = 0;
    //玩家座位位置
    this.sixPos = null;
    this.otherPos = null;
    this.myPos = null;
    this.dealerPos = null;
    this.roomInfo = null;
    //接受的数据
    this.t_onInitRoom = null;        //当游戏开始时
    this.t_onMatchdetail = null;     //比赛开始相关的信息
    this.t_onConfirmGrab = null;     //确认庄家
    this.t_onProcess = null;        //进度通知
    this.t_onChooseChip = null;     //有闲家下注
    this.t_onMidEnter = null;       //中途加入
    this.t_onSettle = null;         //同步数据
    this.grabList = []; //庄家列表
    this.t_richList = null;          //前6位金币最多的列表
    this.t_RoomRecord = null;         //房间的记录
    this.playerOprType = null;

    this.onChoseChipArr = null;
    this.MaxBet = null;

    this.sixPos = [];
    //筹码参数
    this.isBet = false;
    this.betLeiji = 0;
    this.areaPos = [];
    this.onChoseChipArr = [];
    this.initAreaBetInfo();

    this.rebetData = { 1: [], 2: [], 3: [], 4: [] };    //续压信息
    this.copyRetBetData = { 1: [], 2: [], 3: [], 4: [] };    //续压信息
    this.autoStatus = false;
    this.rebetStatus = false;           //玩家点击下注，则续压状态为false
    this.isfirstBet = true;

    this.GameFinished = false;

    this.BetTime = null;
    this.ClearingTime = null;
    this.roomid = null;
    this.noBetRound = 0;
    this.playersCount = 0;
};

brnnLogic.initAreaBetInfo = function () {
    this.betLeiji = 0;

    this.myTianBetInfo = 0;    //我的天地玄黄的下注信息
    this.myDiBetInfo = 0;
    this.myXuanBetInfo = 0;
    this.myHuangBetInfo = 0;

    this.allTianBetInfo = 0;    //所有天地玄黄的下注信息
    this.allDiBetInfo = 0;
    this.allXuanBetInfo = 0;
    this.allHuangBetInfo = 0;
};
/**
 * 网络数据监听
 */
brnnLogic.regisrterEvent = function () {
    glGame.emitter.on(CONFIGS.clientEvent.onGameFinished, this.onGameFinished, this);
    glGame.emitter.on(glGame.room.getEnterRoom(glGame.scenetag.BRNN), this.enterRoom, this);  //进入房间
    glGame.emitter.on(CONFIGS.clientEvent.onInitRoom, this.onInitRoom, this);                //初始化房间
    glGame.emitter.on(CONFIGS.clientEvent.onMatchdetail, this.onMatchdetail, this);        //比赛开始相关的信息
    glGame.emitter.on(CONFIGS.clientEvent.onConfirmGrab, this.onConfirmGrab, this);         //确认庄家
    glGame.emitter.on(CONFIGS.clientEvent.onProcess, this.onProcess, this);                 //进度通知
    glGame.emitter.on(CONFIGS.clientEvent.onChooseChip, this.onChooseChip, this);          //有闲家下注
    glGame.emitter.on(CONFIGS.clientEvent.onMidEnter, this.onMidEnter, this);          //中途加入
    glGame.emitter.on(CONFIGS.clientEvent.onSettle, this.onSettle, this);              //同步数据
    glGame.emitter.on(CONFIGS.clientEvent.onGrabListChange, this.onGrabListChange, this); //上庄列表发生了改变
    glGame.emitter.on(CONFIGS.clientEvent.onRichListChange, this.onRichListChange, this); //座位发生了改变
    glGame.emitter.on(CONFIGS.clientEvent.onDealerFail, this.onDealerFail, this);           //上庄失败
    glGame.emitter.on(glGame.room.getPlayerOp(glGame.scenetag.BRNN), this.oprGetPlayersList, this);     //玩家列表
    glGame.emitter.on(CONFIGS.clientEvent.onOutGrabList, this.onOutGrabList, this);         //离开抢庄列表
    // glGame.emitter.on("updateUserData", this.updateUsers, this);
    glGame.emitter.on("horseRaceLamp", this.horseRaceLamp, this);
    glGame.emitter.on("brnnRoom.brnnRoomHandler.getRoomRecord", this.Roomrecord, this);             //房间记录
    glGame.emitter.on("onEnterRoom", this.updateAdd, this);
    glGame.emitter.on("onLeaveRoom", this.updateSub, this);
};
brnnLogic.unRegisterEvent = function () {
    glGame.emitter.off(CONFIGS.clientEvent.onGameFinished, this);
    glGame.emitter.off(CONFIGS.clientEvent.onInitRoom, this);                //初始化房间
    glGame.emitter.off(glGame.room.getEnterRoom(glGame.scenetag.BRNN), this);
    glGame.emitter.off(CONFIGS.clientEvent.onMatchdetail, this);        //比赛开始相关的信息
    glGame.emitter.off(CONFIGS.clientEvent.onConfirmGrab, this);         //确认庄家
    glGame.emitter.off(CONFIGS.clientEvent.onProcess, this);            //进度通知
    glGame.emitter.off(CONFIGS.clientEvent.onChooseChip, this);          //有闲家下注
    glGame.emitter.off(CONFIGS.clientEvent.onMidEnter, this);          //中途加入
    glGame.emitter.off(CONFIGS.clientEvent.onSettle, this);              //同步数据
    glGame.emitter.off(CONFIGS.clientEvent.onGrabListChange, this); //上庄列表发生了改变
    glGame.emitter.off(CONFIGS.clientEvent.onRichListChange, this); //座位发生了改变
    glGame.emitter.off(glGame.room.getPlayerOp(glGame.scenetag.BRNN), this); //玩家列表
    glGame.emitter.off(CONFIGS.clientEvent.onOutGrabList, this); //离开抢庄列表
    // glGame.emitter.off("updateUserData", this);
    glGame.emitter.off("horseRaceLamp", this);
    glGame.emitter.off("brnnRoom.brnnRoomHandler.getRoomRecord", this);//房间记录
    glGame.emitter.off("onEnterRoom", this);
    glGame.emitter.off("onLeaveRoom", this);
};
//
brnnLogic.onInitRoom = function (msg) {
    cc.log("WEEEWEW初始化房间", msg);

    this.initAreaBetInfo();
    this.myGold = msg.selfCoin;//glGame.user.get("coin");
    this.myTempGold = msg.selfCoin;//glGame.user.get("coin");
    this.roomInfo = msg.roomRule;
    this.playersCount = msg.count;
    this.curChipValue = this.roomInfo.Chips[0];
    this.MaxBet = this.roomInfo.MaxBet;
    this.roomtype = msg.roomRule.Rank;
    this.BetTime = msg.roomRule.BetTime;
    this.ClearingTime = msg.roomRule.ClearingTime;
    this.roomid = glGame.room.get("curEnterRoomID");

    glGame.emitter.emit(CONFIGS.logicGlobalEvent.onEnterRoom);  //以前这条广播放在enterroom里面的
}
/**
 *动态刷新配置  
 * 接收到当前消息，把数据存起来，等待阶段才去刷新配置
 * 刷新的点有：筹码对象池，筹码下注按钮，上庄需，自动下注状态
 */
brnnLogic.onGameFinished = function (msg) {
    cc.log("游戏结束发的消息", msg)
    if (msg.roomRule) {
        this.GameFinished = true;
        this.GameFinishMsg = msg
    }
};
brnnLogic.updateAdd = function () {
    console.log("增加玩家列表人数", this.playersCount)
    this.playersCount++;
    glGame.emitter.emit("gl_enterRoom");
};

brnnLogic.updateSub = function () {
    console.log("减少玩家列表人数", this.playersCount)
    this.playersCount--;
    glGame.emitter.emit("gl_levelRoom");
};

//@logicId @winCoin @WinType 1:单数获胜，2：超过某金额
brnnLogic.horseRaceLamp = function (msg) {
    console.log("接收到走马灯消息-消息")
    let horseLampLabel = `恭喜玩家<color=#27d9ff>${msg.nickname}</c>在<color=#ffdd20>百人牛牛-${CONFIGS.roomType[msg.betType]}</c>内大赢特赢，获得<color=#00ff42>${this.getFloat(this.getNumber(msg.winCoin))}</c>金币。`
    glGame.notice.addContent(horseLampLabel);
};
brnnLogic.enterRoom = function (msg) {
    cc.log("WEEEWEW进入房间", msg);
};
//请求玩家列表@@playersList[{uid,gold}]
brnnLogic.rePlayersList = function () {
    glGame.panel.showRoomJuHua();
    glGame.gameNet.send_msg(glGame.room.getPlayerOp(glGame.scenetag.BRNN), {
        oprType: CONFIGS.oprEvent.oprGetPlayersList,
    });
};
//请求房间记录
brnnLogic.reqRoomrecord = function () {
    cc.log("请求房间记录")
    glGame.gameNet.send_msg("brnnRoom.brnnRoomHandler.getRoomRecord", { bettype: this.roomtype, roomid: this.roomid });
};
//下注@areaIndex下注区域 @chipValue下注值
brnnLogic.reqChooseChip = function (areaIndex, chipValue) {
    glGame.gameNet.send_msg(glGame.room.getPlayerOp(glGame.scenetag.BRNN), {
        oprType: CONFIGS.oprEvent.oprChooseChip,
        chipValue: chipValue,
        areaIndex: areaIndex
    });
    cc.log("续投！", areaIndex, chipValue)
};
//上庄
brnnLogic.reqGrabDealer = function () {
    glGame.panel.showRoomJuHua();
    glGame.gameNet.send_msg(glGame.room.getPlayerOp(glGame.scenetag.BRNN), {
        oprType: CONFIGS.oprEvent.oprChooseGrab,
    });
};
//下庄
brnnLogic.reqCancelDealer = function () {
    glGame.panel.showRoomJuHua();
    glGame.gameNet.send_msg(glGame.room.getPlayerOp(glGame.scenetag.BRNN), {
        oprType: CONFIGS.oprEvent.oprCancelDealer,
    });
};
//退出队列
brnnLogic.reqExitGrabList = function () {
    glGame.panel.showRoomJuHua();
    glGame.gameNet.send_msg(glGame.room.getPlayerOp(glGame.scenetag.BRNN), {
        oprType: CONFIGS.oprEvent.oprExitGrabList,
    });
    cc.log("退出队列", CONFIGS.oprEvent.oprExitGrabList)
};
//房间记录
brnnLogic.Roomrecord = function (msg) {
    console.log("这是请求的房间的记录", msg)
    this.t_RoomRecord = msg;
    glGame.emitter.emit("refreshRecordUi")
};
//@uid @areaSettleInfo区域输赢 @settleGold总输赢
brnnLogic.onRichListChange = function (msg) {
    cc.log("WEEEWEW前6个位置 msg = ", msg);
    this.t_richList = msg.richList;

    glGame.emitter.emit(CONFIGS.logicGlobalEvent.onRichListChange)
};
brnnLogic.oprGetPlayersList = function (msg) {
    cc.log("玩家列表msg", msg);
    glGame.panel.closeRoomJuHua();
    glGame.emitter.emit(CONFIGS.logicGlobalEvent.OnPlayerOp, msg)
};
//上庄列表发生变化  @grabList
brnnLogic.onGrabListChange = function (msg) {
    cc.log("上庄列表发生变化msg = ", msg);
    this.grabList = msg.grabList;
    glGame.emitter.emit(CONFIGS.logicGlobalEvent.onGrabListChange);
};
//检测自己是否在庄家列表中
brnnLogic.checkInGrablist = function () {
    for (let i = 0; i < this.grabList.length; i++) {
        if (this.myUid == this.grabList[i].uid) {
            return true;
        }
    }
    return false;
};
//当玩家在上庄列表中，因钱输低于10000，且下一把要成为庄家强制从上庄列表中清除
brnnLogic.onDealerFail = function () {
    glGame.emitter.emit("showTip", 7);
}
//比赛开始相关的信息@dealerUid @myGold @dealerGold @dictAllCards//所有的卡牌{areaIndex:cardIdList}@dealerRounds
brnnLogic.onMatchdetail = function (msg) {
    cc.log("WWWEEEEEE比赛开始相关的信息", msg);
    this.t_onMatchdetail = msg;
    this.dealerGold = msg.dealerGold;
    this.dealerUid = msg.dealerUid;
    this.dealerLogicId = msg.dealerLogicId;
    this.dictAllCards = msg.dictAllCards;
    if (this.dealerUid == this.myUid
        && msg.dealerRounds == 0) {
        glGame.emitter.emit("showTip", 11);
    }

    glGame.emitter.emit(CONFIGS.logicGlobalEvent.onMatchdetail);
};
//金币不足，剔除上庄列表
brnnLogic.onOutGrabList = function (msg) {
    glGame.emitter.emit("showTip", 9);
};
//确认庄家 @dealerUid @dealerGold @dealerLogicId  @toux  @changeType  0：没替换1：玩家主动下庄2：满8局3：金钱不足
brnnLogic.onConfirmGrab = function (msg) {
    cc.log("WWWEEEEEE确认庄家", msg);
    this.t_onConfirmGrab = msg;
    this.dealerUid = msg.dealerUid;
    this.dealerHeadurl = msg.dealerHeadurl;
    this.dealerGold = msg.dealerGold;
    if (this.dealerLogicId != msg.dealerLogicId) {        //庄家ID改变，
        this.dealerTotalSettle = 0;
        glGame.emitter.emit("chengeDealer");
    }
    if (msg.changeType == CONFIGS.dealerCancelType.playerCancel) {     //玩家自己下庄
        if (this.mylogicID == this.dealerLogicId) {
            glGame.emitter.emit("showTip", 5);
        }
    } else if (msg.changeType == CONFIGS.dealerCancelType.fullRounds) {  //满8局
        if (this.mylogicID == this.dealerLogicId) {
            glGame.emitter.emit("showTip", 6);
        }
    } else if (msg.changeType == CONFIGS.dealerCancelType.noGold) {//金钱不足
        cc.log("金钱不足强制下庄", this.mylogicID, this.dealerLogicId)
        if (this.mylogicID == this.dealerLogicId) {
            glGame.emitter.emit("showTip", 3);
        }
    }
    this.dealerLogicId = msg.dealerLogicId;
    this.dealerNickName = msg.nickname;

    glGame.emitter.emit(CONFIGS.logicGlobalEvent.onConfirmGrab);
};
//进度通知  @process @waitTime @ serverTime
brnnLogic.onProcess = function (msg) {
    cc.log("WWWEEEEEErrr进度通知", msg);
    this.t_onProcess = msg;
    this.waitTime = msg.waitTime;
    this.serverOffTime = msg.serverTime - Date.now();
    if (msg.processType == CONFIGS.process.waitStart) {
        //没人下注，重置他
        if (this.GameFinished) {
            cc.log("发送刷新配置消息")
            this.roomInfo = this.GameFinishMsg.roomRule;
            this.BetTime = this.GameFinishMsg.roomRule.BetTime;
            this.curChipValue = this.roomInfo.Chips[0];
            this.MaxBet = this.roomInfo.MaxBet;
            this.roomtype = this.GameFinishMsg.roomRule.Rank

            this.rebetData = { 1: [], 2: [], 3: [], 4: [] };    //续压信息
            this.copyRetBetData = { 1: [], 2: [], 3: [], 4: [] };    //续压信息

            glGame.emitter.emit("globalGameFinish");   //去刷新配置
            this.GameFinished = false;
        }
        this.areaBetLeiJi = 0;
        this.isBet = false;
        this.isfirstBet = true;
        //检测未下注问题
        this.checkNoBetRound();
    } else if (msg.processType == CONFIGS.process.chooseChip) {
        // glGame.user.reqMyInfo();
        //代替以前的reqMyInfo
        this.betLeiji = 0
        this.myGold = this.myTempGold;
        this.areaBetLeiJi = 0;
        this.onChoseChipArr.splice(0, this.onChoseChipArr.length)
        this.showWatchingBattle();
        this.initAreaBetInfo();
        glGame.emitter.emit(CONFIGS.logicGlobalEvent.updateInfo);
        if (!this.autoStatus) {
            glGame.emitter.emit("ChipBtnState");
        };
    } else if (msg.processType == CONFIGS.process.settleEffect) {
        this.isBet = false;
        this.copyRetBetData = this.deepClone(this.rebetData);
        this.resetBetData();
        glGame.emitter.emit(CONFIGS.logicGlobalEvent.settleEffect);//ps：（onsettle在下注流程最后一秒就执行到了）所以得在跳转流程时，做事件发送
        this.reqRoomrecord();
    }

    glGame.emitter.emit(CONFIGS.logicGlobalEvent.onProcess);
};
brnnLogic.showShop = function () {
    glGame.panel.showShop();//商城
};
//为下注满3局提示！五局强退
brnnLogic.checkNoBetRound = function () {
    if (this.myUid == this.dealerUid || this.checkInGrablist()) {
        this.noBetRound = 0;
    } else {
        if (this.betLeiji == 0) {
            this.noBetRound++;
        } else {
            this.noBetRound = 0;
        }
    }
    if (this.noBetRound == 3) {
        let str = "        您已经连续3局未下注，如果连续5局没下注，将自动离开房间。"
        glGame.panel.showMsgBox("", str)
    } else if (this.noBetRound == 5) {
        glGame.room.exitRoom();
    }
};
//有闲家下注 @chooseUid @areaIndex @ chipValue
brnnLogic.onChooseChip = function (msg) {
    if (!msg || Object.keys(msg).length == 0) return
    this.t_onChooseChip = msg;
    this.onChoseChipArr.push(msg);
    if (msg.chooseUid != this.myUid) {
        this.setAreaBetLeiJi(msg.chipValue);    //区域下注累计
        this.setAllAreaBetInfo(msg.areaIndex, msg.chipValue);   //区域下注筹码数据
    }

    glGame.emitter.emit(CONFIGS.logicGlobalEvent.onChooseChip);
};
brnnLogic.setChpseChipArr = function (chip) {
    this.onChoseChipArr.push(chip);
};
//存储区域所有的下注信息
brnnLogic.allAreaBetInfo = function (msg) {
    if (msg.chipAreaInfo) {
        let info = msg.chipAreaInfo.areaChips;
        for (let key in info) {
            this.areaBetLeiJi = Number(this.areaBetLeiJi).add(Number(info[key]));
            this.setAllAreaBetInfo(Number(key), info[key]);
        }
        cc.log("所有的下注信息", this.allTianBetInfo, this.allDiBetInfo, this.allXuanBetInfo, this.allHuangBetInfo)
    }
};
//存储区域自己的下注信息
brnnLogic.MyAreaBetInfo = function (info) {
    for (let key in info) {
        this.betLeiji += info[key];
        this.setMyAreaBetInfo(Number(key), info[key])
    }
};
//自己是否下过注
brnnLogic.setBoolMybeted = function (msg) {
    if (msg.lastSettleInfo) {
        let mySettleInfo = msg.lastSettleInfo.myAreaSettleInfo;
        if (Object.keys(mySettleInfo).length == 0) { this.myBeted = false; }
        else { this.myBeted = true; }
    }
};
//中途加入 @processType @ serverTime @waitTime @ grabRankList(上庄列表) @lastSettleInfo(上局的结算信息，用于断线重连渲染)
//@dealerGold @dealerUid  @chipAreaInfo（区域总投注）@myAreaInfo区域我的下注值
//@chipAreaInfo（区域总投注）{areaChips区域总下注值,userChips区域下注筹码的详情}
brnnLogic.onMidEnter = function (msg) {
    cc.log("WEEEWEW中途加入!!!!!!!!", msg);
    this.t_onMidEnter = msg;
    this.myUid = glGame.user.get("userID");
    this.MyheadURL = glGame.user.get("headURL");
    this.mylogicID = glGame.user.get("logicID");
    this.myNickName = glGame.user.get("nickname")
    // glGame.user.reqMyInfo();
    if (msg.myAreaInfo) {
        this.myAreaInfo = msg.myAreaInfo;
        this.MyAreaBetInfo(msg.myAreaInfo)
    } else {
        this.myAreaInfo = {};
    }
    // this._dict_chipInfo = {};
    if (msg.chipAreaInfo) {
        this.chipAreaInfo = msg.chipAreaInfo;
    }
    this.allAreaBetInfo(msg);   //存储区域所有的下注信息
    if (msg.dealerTotalSettle) {
        this.dealerTotalSettle = msg.dealerTotalSettle;
    } else {
        this.dealerTotalSettle = 0;
    }
    if (msg.userTotalSettle) {
        this.userTotalSettle = msg.userTotalSettle;
    } else {
        this.userTotalSettle = 0;
    }
    this.dealerUid = msg.dealerUid;
    this.dealerLogicId = msg.dealerLogicId;
    this.dealerGold = msg.dealerGold;
    this.dealerHeadurl = msg.dealerHeadurl;
    this.dealerNickName = msg.nickname;
    this.dictAllCards = msg.dictCards;
    this.grabList = msg.grabRankList;//上庄列表
    this.waitTime = msg.waitTime;
    this.serverOffTime = msg.serverTime - Date.now();
    this.t_richList = msg.richList;
    this.lastSettleInfo = msg.lastSettleInfo;
    if (this.lastSettleInfo) {
        this.listRichInfo = msg.lastSettleInfo.listRichInfo;
        this.myTempGold = this.myGold + msg.lastSettleInfo.mySettleGold;
    }
    this.setBoolMybeted(msg);       //自己是否下过注
    this.t_onSettle = msg.lastSettleInfo;
    if (msg.processType == CONFIGS.process.waitStart || msg.processType == CONFIGS.process.settleEffect) {
        this.isBet = false;
    }
    this.reqRoomrecord();
    //中途加入渲染各种信息
    glGame.emitter.emit(CONFIGS.logicGlobalEvent.onMidEnter);
    this.showGoldLess();
    this.showWatchingBattle();
};

/*同步数据 @dealerUid @dealerSettleGold @myAreaSettleInfo(每个区域的输赢)
*         @resultDict:{areaIndex:{cardIdList,resultType}}
*         @listRichInfo[uid:123456,areaSettleInfo[]];
*         @dictDealerAreaSettle庄家每个区域的输赢
*         @mySettleGold我的输赢（抽水过）
*/
brnnLogic.onSettle = function (msg) {
    cc.log("WWWEEEEEErrr结算通知", msg);
    this.t_onSettle = msg;
    this.myAreaSettleInfo = msg.myAreaSettleInfo;
    this.listRichInfo = msg.listRichInfo;
    this.dealerResultType = msg.resultDict[0].resultType;
    this.dictAllCards = msg.resultDict;
    this.myTempGold = this.myGold + msg.mySettleGold;
    this.setdealerTotalSettle(msg.dealerSettleGold);  //累计庄家的战绩
    this.setuserTotalSettle(msg.mySettleGold);

    glGame.emitter.emit(CONFIGS.logicGlobalEvent.onSettle);
};

brnnLogic.showGoldLess = function () {
    let EntranceRestrictions = Number(this.roomInfo.EntranceRestrictions);
    if (Number(this.myGold) < EntranceRestrictions) {
        if (glGame.user.isTourist()) {
            return glGame.panel.showMsgBox("", "您的筹码不足，请前往大厅充值。");
        }
        let string = `<color=#99C7FF>       您的金币不足，该房间需要</c> <color=#ff0000> ${this.getNumber(EntranceRestrictions)}  </c><color=#99C7FF>金币才可下注，是否马上前往商城兑换金币？</c>`
        glGame.panel.showDialog("", string, this.showShop.bind(this), () => { }, "取消", "充值");
        return true;
    }
    return false;
};

brnnLogic.showWatchingBattle = function () {
    let EntranceRestrictions = Number(this.roomInfo.EntranceRestrictions);
    if (Number(this.myGold) < EntranceRestrictions) {
        cc.log("显示观战中", this.myGold, EntranceRestrictions)
        glGame.emitter.emit("showWatchingBattle", EntranceRestrictions);
    }
};

// brnnLogic.updateUsers = function () {
//     this.myGold = glGame.user.get("coin");
//     this.showWatchingBattle();
//     glGame.emitter.emit(CONFIGS.logicGlobalEvent.updateInfo);
//     if (!this.autoStatus) {
//         glGame.emitter.emit("ChipBtnState");
//     };
// };

/**
 * set
 */
brnnLogic.setAreaBetLeiJi = function (chipValue) {
    this.areaBetLeiJi = Number(this.areaBetLeiJi).add(Number(chipValue));
};
brnnLogic.setMyGold = function (myGold) {
    this.myGold = Number(this.myGold).add(Number(myGold));
};

brnnLogic.setSixPos = function (item) {
    this.sixPos.push(item);
};

brnnLogic.setBetLeiJi = function (value) {
    this.betLeiji = Number(this.betLeiji).add(Number(value));
};
brnnLogic.setMyAreaBetInfo = function (index, curChipValue) {
    if (index == 1) { this.myTianBetInfo = Number(this.myTianBetInfo).add(Number(curChipValue)) }
    else if (index == 2) { this.myDiBetInfo = Number(this.myDiBetInfo).add(Number(curChipValue)) }
    else if (index == 3) { this.myXuanBetInfo = Number(this.myXuanBetInfo).add(Number(curChipValue)) }
    else if (index == 4) { this.myHuangBetInfo = Number(this.myHuangBetInfo).add(Number(curChipValue)) }
};
brnnLogic.setAllAreaBetInfo = function (index, curChipValue) {
    if (index == 1) { this.allTianBetInfo = Number(this.allTianBetInfo).add(Number(curChipValue)) }
    else if (index == 2) { this.allDiBetInfo = Number(this.allDiBetInfo).add(Number(curChipValue)) }
    else if (index == 3) { this.allXuanBetInfo = Number(this.allXuanBetInfo).add(Number(curChipValue)) }
    else if (index == 4) { this.allHuangBetInfo = Number(this.allHuangBetInfo).add(Number(curChipValue)) }
};
brnnLogic.setdealerTotalSettle = function (value) {
    this.dealerTotalSettle = Number(this.dealerTotalSettle).add(Number(value));
};
brnnLogic.setuserTotalSettle = function (value) {
    this.userTotalSettle = Number(this.userTotalSettle).add(Number(value));
};
brnnLogic.setRebetData = function (index, data) {
    this.rebetData[index].push(data)
};
brnnLogic.resetBetData = function () {
    for (let key in this.rebetData) {
        this.rebetData[key] = [];
    }
};
brnnLogic.checkCopyRetBetData = function () {
    let count = 0;
    for (let key in this.copyRetBetData) {
        for (let i = 0; i < this.copyRetBetData[key].length; i++) {
            count += Number(this.copyRetBetData[key][i]);
        }
    }
    cc.log("自动下注数据copy", this.copyRetBetData, count)
    return count;
};
brnnLogic.checkRetBetData = function () {
    let count = 0;
    for (let key in this.rebetData) {
        for (let i = 0; i < this.rebetData[key].length; i++) {
            count += Number(this.rebetData[key][i]);
        }
    }
    cc.log("自动下注数据", this.rebetData, count)
    return count;
};
brnnLogic.deepClone = function (source) {
    const targetObj = source.constructor === Array ? [] : {}; // 判断复制的目标是数组还是对象
    for (let keys in source) { // 遍历目标
        if (source.hasOwnProperty(keys)) {
            if (source[keys] && typeof source[keys] === 'object') { // 如果值是对象，就递归一下
                targetObj[keys] = source[keys].constructor === Array ? [] : {};
                targetObj[keys] = this.deepClone(source[keys]);
            } else { // 如果不是，就直接赋值
                targetObj[keys] = source[keys];
            }
        }
    }
    return targetObj;
}
/*
*get
*/
//除与100
brnnLogic.getNumber = function (value) {
    return (Number(value).div(100)).toString();
};
//浮点型运算取俩位
brnnLogic.getFloat = function (value, num = 2) {
    value = Number(value);
    if (isNaN(value)) return;
    if (~~value === value) {
        return value.toString();
    } else {
        return value.toFixed(num);
    }
};

//截取小数点后1位
brnnLogic.cutOne = function (value) {
    if (typeof value !== 'string' && typeof value !== 'number') return;
    return (Math.floor(parseFloat(value) * 100) / 100).toFixed(1);
};

brnnLogic.getT_MyAreaBetInfo = function (index) {
    if (index == 1) { return this.myTianBetInfo ? this.myTianBetInfo : 0 }
    else if (index == 2) { return this.myDiBetInfo ? this.myDiBetInfo : 0 }
    else if (index == 3) { return this.myXuanBetInfo ? this.myXuanBetInfo : 0 }
    else if (index == 4) { return this.myHuangBetInfo ? this.myHuangBetInfo : 0 }
};
brnnLogic.getT_AllAreaBetInfo = function (index) {
    if (index == 1) { return this.allTianBetInfo ? this.allTianBetInfo : 0 }
    else if (index == 2) { return this.allDiBetInfo ? this.allDiBetInfo : 0 }
    else if (index == 3) { return this.allXuanBetInfo ? this.allXuanBetInfo : 0 }
    else if (index == 4) { return this.allHuangBetInfo ? this.allHuangBetInfo : 0 }
};

brnnLogic.getNeedMinGold = function () {
    return (Number(this.betLeiji).add(Number(this.curChipValue))).mul(CONFIGS.maxDouble);
};

brnnLogic.getT_listRichInfo = function () {
    if (!this.listRichInfo) return;
    for (let i = 0; i < this.listRichInfo.length; i++) {
        if (this.listRichInfo[i].uid == this.myUid) {
            this.listRichInfo.splice(i, 1);
            break;
        }
    }
    return this.listRichInfo;
};

brnnLogic.getT_richList = function () {
    if (!this.t_richList) return;
    for (let i = 0; i < this.t_richList.length; i++) {
        if (this.t_richList[i].uid == this.myUid) {
            this.t_richList.splice(i, 1);
            break;
        }
    }
    return this.t_richList;
};

brnnLogic.getT_isDealer = function () {
    if (this.myUid == this.dealerUid) {
        this.isDealer = true;
    } else {
        this.isDealer = false;
    }
    return this.isDealer;
};

brnnLogic.getCurWaitTime = function () {
    let curTime = Math.ceil((this.waitTime - (Date.now() + this.serverOffTime)) / 1000);
    cc.log("curTime", curTime, this.waitTime)
    return Math.max(curTime, 0);
};
brnnLogic.getMidEnterWaitTime = function () {
    let curTime = Math.ceil((this.waitTime - (Date.now() + this.serverOffTime)));
    return Math.max(curTime, 0);
};
brnnLogic.destroy = function () {
    cc.log("干嘛要销毁数据啊")
    this.resetData();
    this.unRegisterEvent();
    g_instance = null;
    delete this;
};
/**
 * 设置玩家属性
 * @param {String} key
 * @param {Object} value
 */
brnnLogic.set = function (key, value) {
    this[key] = value;
};
/**
 * 获取玩家属性
 * @param {String} key
 * @returns {Object}
 */
brnnLogic.get = function (key) {
    return this[key];
};
//--------------

module.exports.getInstance = function () {
    if (!g_instance) {
        g_instance = new BrnnLogic();
        console.log("************************clear")
        g_instance.regisrterEvent();
    }
    return g_instance;
};
module.exports.destroy = function () {
    if (g_instance) {
        console.log("销毁百人牛牛数据层");
        g_instance.destroy();
    }
};
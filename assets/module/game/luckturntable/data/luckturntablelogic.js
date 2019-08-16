const lttConst = require("lttConst");
const lttDef = require("lttDef");

let LuckTurnTableLogic = function () {
    this.resetData();
    this.registerEvent();
},
    luckturntablelogic = LuckTurnTableLogic.prototype,
    g_instance = null;

luckturntablelogic.resetData = function () {
    this.myUid = glGame.user.get("userID");
    this.myHeadURL = glGame.user.get("headURL")
    this.mynickname = glGame.user.get("nickname");
    this.code = null;
    this.playersList = null;
    this.process = null;
    this.waitTime = null;
    this.serverOffTime = null;
    this.opType = null;
    this.targetNumber = null;
    this.lastBetData = null;
    this.chipBunch = null;
    this.totalChipBunch = null;
    this.chipSize = null;
    this.history = null;
    this.syncMyChipData = null;
    this.syncOtherChipData = null;
    this.currentChipType = (glGame.storage.getItem("lttChipType") && glGame.storage.getItem("lttChipType").chipType) || 0;
    this.myResultGold = 0;
    this.list_richInfo = [];
    this.selfBetCount = 0;
    this.otherBetCount = 0;
    this.resultNum = null;
    this.showOtherChip = glGame.storage.getItem("lttChipViewType") ? glGame.storage.getItem("lttChipViewType").type : true;
    this.userTotalSettle = null;
    this.maxBet = null;
    this.accessCount = null;
    this.roomType = null;
    this.BetTime = null;
    this.ClearingTime = null;

    this.otherWinChip = [];
    this.selfWinChip = [];
    this.chipAltas = null;

    this.gameId = glGame.scenetag.LUCKTURNTABLE;

    this.rebetStatus = false;   //续投
    this.autoStatus = false;    //自动
    this.isfirstBet = true;

    this.GameFinished = false;  //刷新配置

    this.noBetRound = 0;
    this.richInfo = [];
    this.playersCount = 0;

    this.listTrendLength = 96;  //展示的走势长度
};

luckturntablelogic.registerEvent = function () {
    glGame.emitter.on(lttConst.clientEvent.onInitRoom, this.onInitRoom, this);
    glGame.emitter.on(lttConst.clientEvent.onGameFinished, this.onGameFinished, this);
    glGame.emitter.on(lttConst.clientEvent.onProcess, this.onProcess, this);
    glGame.emitter.on(lttConst.clientEvent.onChooseChip, this.onChooseChip, this);
    glGame.emitter.on(lttConst.clientEvent.onMidEnter, this.onMidEnter, this);
    glGame.emitter.on(lttConst.clientEvent.onSettle, this.onSettle, this);
    glGame.emitter.on(glGame.room.getPlayerOp(glGame.scenetag.LUCKTURNTABLE), this.onPlayerOp, this);
    glGame.emitter.on(glGame.room.getEnterRoom(glGame.scenetag.LUCKTURNTABLE), this.enterRoom, this);
    glGame.emitter.on(lttConst.clientEvent.onNotice, this.onNotice, this); // 跑马灯
    glGame.emitter.on(lttConst.clientEvent.onRichListChange, this.onRichListChange, this); // 跑马灯
    glGame.emitter.on("onEnterRoom", this.updateAdd, this);
    glGame.emitter.on("onLeaveRoom", this.updateSub, this);
};

luckturntablelogic.unRegisterEvent = function () {
    glGame.emitter.off(lttConst.clientEvent.onInitRoom, this);
    glGame.emitter.off(lttConst.clientEvent.onGameFinished, this);
    glGame.emitter.off(lttConst.clientEvent.onProcess, this);
    glGame.emitter.off(lttConst.clientEvent.onChooseChip, this);
    glGame.emitter.off(lttConst.clientEvent.onMidEnter, this);
    glGame.emitter.off(lttConst.clientEvent.onSettle, this);
    glGame.emitter.off(glGame.room.getPlayerOp(glGame.scenetag.LUCKTURNTABLE), this);
    glGame.emitter.off(glGame.room.getEnterRoom(glGame.scenetag.LUCKTURNTABLE), this);
    glGame.emitter.off(lttConst.clientEvent.onNotice, this); // 跑马灯
    glGame.emitter.off(lttConst.clientEvent.onRichListChange, this); // 跑马灯
    glGame.emitter.off("onEnterRoom", this);
    glGame.emitter.off("onLeaveRoom", this);
};

//网络消息回调
luckturntablelogic.onInitRoom = function (msg) {
    console.log("-----onInitRoom", msg);
    this.myGold = msg.selfCoin;//glGame.user.get("coin");
    this.mytempGold = this.myGold;
    this.playersCount = msg.count;
    this.maxBet = msg.roomRule.MaxBet;
    this.roomType = msg.roomRule.Rank;
    this.roomid = glGame.room.get("curEnterRoomID");
    this.chipsIcon = msg.roomRule.ChipsIcon;
    this.accessCount = msg.roomRule.EntranceRestrictions;
    this.chipSize = msg.roomRule.Chips;
    this.BetTime = msg.roomRule.BetTime;
    this.ClearingTime = msg.roomRule.ClearingTime;
    glGame.emitter.emit(lttConst.globalEvent.onEnterRoom);
};
//富人榜变化
luckturntablelogic.onRichListChange = function (msg) {
    cc.log("富人榜消息", msg)
    this.richInfo = msg.richList;
};

luckturntablelogic.updateAdd = function () {
    console.log("增加玩家列表人数", this.playersCount)
    this.playersCount++;
    glGame.emitter.emit("gl_enterRoom");
};

luckturntablelogic.updateSub = function () {
    console.log("减少玩家列表人数", this.playersCount)
    this.playersCount--;
    glGame.emitter.emit("gl_levelRoom");
};

//返回
luckturntablelogic.getRichList = function () {
    let arr = [];
    for (let i = 0; i < this.richInfo.length; i++) {
        if (this.richInfo[i].uid != this.myUid) {
            arr.push(this.richInfo[i]);
        }
        if (arr.length == 3) return arr;
    }
    return arr;
}
luckturntablelogic.getListrichInfo = function () {
    let arr = [];
    for (let i = 0; i < this.list_richInfo.length; i++) {
        if (this.list_richInfo[i].uid != this.myUid) {
            arr.push(this.list_richInfo[i]);
        }
        if (arr.length == 3) return arr;
    }
    return arr;
}
// luckturntablelogic.onMatchdetail = function (msg) {
//     console.log("-----onMatchdetail", msg);
// };
luckturntablelogic.onGameFinished = function (msg) {
    cc.log("游戏结束发的消息", msg)
    if (msg.roomRule) {
        this.GameFinished = true;
        this.GameFinishMsg = msg
    }
};

luckturntablelogic.onProcess = function (msg) {
    this.process = msg.processType;
    this.waitTime = msg.waitTime;
    this.serverOffTime = msg.serverTime - Date.now();
    if (msg.processType == lttConst.process.chooseChip) {
        this.showWatchingBattle();
        this.isfirstBet = true;
        // glGame.user.reqMyInfo();
        this.nextRound();
    } else if (msg.processType == lttConst.process.waitStart) {
        if (this.GameFinished) {
            cc.log("刷新配置")
            this.maxBet = this.GameFinishMsg.roomRule.MaxBet;
            this.roomType = this.GameFinishMsg.roomRule.Rank;
            this.chipsIcon = this.GameFinishMsg.roomRule.ChipsIcon;
            this.accessCount = this.GameFinishMsg.roomRule.EntranceRestrictions;
            this.chipSize = this.GameFinishMsg.roomRule.Chips;

            glGame.emitter.emit(lttConst.globalEvent.onGameFinished)
            this.GameFinished = false;
            this.autoStatus = false;    //自动
            this.lastBetData = null;
        }
        this.mytempGold = this.myGold;
        this.checkNoBetRound();
    } else if (msg.processType == lttConst.process.settleEffect) {
        // glGame.emitter.emit("refreshRecordUi");
    }
    cc.log("流程时间", this.getCurTime())
    glGame.emitter.emit(lttConst.globalEvent.onProcess);
};

luckturntablelogic.onChooseChip = function (msg) {
    cc.log("---大转盘收到onChooseChip---", msg);
    this.chipBunch = msg;
    (this.totalChipBunch = this.totalChipBunch || []).push(msg);

    glGame.emitter.emit(lttConst.globalEvent.onChooseChip);
};

luckturntablelogic.onMidEnter = function (msg) {
    cc.log("---大转盘收到onMidEnter---", msg);
    this.process = msg.processType;
    this.waitTime = msg.waitTime;
    this.serverOffTime = msg.serverTime - Date.now();
    this.history = msg.listTrend;
    if (this.history.length > this.listTrendLength) {
        this.history.splice(0, this.history.length - this.listTrendLength);
    }
    this.syncMyChipData = msg.myChipInfo;
    this.richInfo = msg.richList;
    this.syncOtherChipData = msg.otherChipInfo;
    this.userTotalSettle = msg.userTotalSettle;
    this.chipSize = msg.listChips;
    if (msg.lastSettleInfo) {
        this.targetNumber = parseInt(msg.lastSettleInfo.resultNum);
        this.myResultGold = msg.lastSettleInfo.myResultGold;
        this.myWinningCoin = msg.lastSettleInfo.myWinningCoin;
        this.list_richInfo = msg.lastSettleInfo.list_richInfo;
    } else if (msg.listTrend.length > 0) {
        this.targetNumber = parseInt(msg.listTrend[msg.listTrend.length - 1]);
    }
    if (msg.myChipInfo) {
        let myChipDict = [];
        this.selfBetCount = 0;
        for (let i = 0; i < msg.myChipInfo.length; ++i) {
            let obj = {
                areaIndex: msg.myChipInfo[i].listAreaIndex,
                chipValue: msg.myChipInfo[i].chipValue,
                chooseUid: this.myUid
            }
            myChipDict.push(obj);
            this.selfBetCount += msg.myChipInfo[i].chipValue;
        }
        (this.totalChipBunch = this.totalChipBunch || []).push(...myChipDict);

        this.mytempGold -= this.selfBetCount;
    }

    if (msg.otherChipInfo) {
        let otherChipDict = [];
        for (let i = 0; i < msg.otherChipInfo.length; ++i) {
            let obj = {
                areaIndex: msg.otherChipInfo[i].listAreaIndex,
                chipValue: msg.otherChipInfo[i].chipValue,
                chooseUid: null
            }
            otherChipDict.push(obj);
            this.otherBetCount += msg.otherChipInfo[i].chipValue;
        }
        (this.totalChipBunch = this.totalChipBunch || []).push(...otherChipDict);
    }

    glGame.emitter.emit(lttConst.globalEvent.onMidEnter);
    glGame.emitter.emit("refreshRecordUi");
};

luckturntablelogic.onSettle = function (msg) {
    cc.log("---大转盘收到onSettle---", msg);
    this.topThree = msg.topThree;
    this.targetNumber = parseInt(msg.resultNum);
    this.myResultGold = msg.myResultGold;
    this.myWinningCoin = msg.myWinningCoin;
    this.list_richInfo = msg.list_richInfo;
    this.userTotalSettle = this.userTotalSettle.add(this.myResultGold);
    this.history.push(msg.resultNum);
    if (this.history.length > this.listTrendLength) {
        this.history.splice(0, this.history.length - this.listTrendLength);
    }
    this.myGold += this.myResultGold;
    glGame.emitter.emit(lttConst.globalEvent.onSettle);
};

luckturntablelogic.onPlayerOp = function (msg) {
    glGame.panel.closeRoomJuHua();
    if (msg) {
        this.opType = msg.oprType;
        this.code = msg.code;
        switch (this.opType) {
            case lttConst.oprEvent.oprClearChip:
                if (this.code == 0) {
                    this.clearBet();
                }
                break;
            case lttConst.oprEvent.oprGetPlayersList:
                if (this.code == 0) {
                    this.playersList = msg.playersList;
                    glGame.emitter.emit(lttConst.globalEvent.refPeoCount)
                }
        }
    } else {
        this.code = null;
    }

    glGame.emitter.emit(lttConst.globalEvent.onPlayerOp);
};

luckturntablelogic.enterRoom = function (msg) {
    cc.log("---大转盘收到enterRoom---", msg);
};

luckturntablelogic.onNotice = function (msg) {
    cc.log("---大转盘收到onNotice---", msg);
    if (msg.gameId != this.gameId) return;
    let str = `恭喜玩家<color=#27d9ff>${msg.nickname}</c>在<color=#ffdd20>幸运大转盘-${lttConst.roomType[msg.betType]}</c>内大赢特赢，获得<color=#00ff42>${this.getFloat(this.handleNumber(msg.winCoin))}</c>金币。`;
    glGame.notice.addContent(str);
};
// end
//显示是否有钱
luckturntablelogic.showGoldLess = function () {
    // this.myGold = glGame.user.get("coin");
    if (this.myGold < this.accessCount) {
        if (glGame.user.isTourist()) {
            return glGame.panel.showMsgBox("", "您的筹码不足，请前往大厅充值。");
        }
        let string = `<color=#99C7FF>       您的金币不足，该房间需要</c> <color=#ff0000> ${this.getFloat(this.accessCount)}  </c><color=#99C7FF>金币才可下注，是否马上前往商城兑换金币？</c>`
        glGame.panel.showDialog("温馨提示", string, () => { glGame.panel.showShop(); });
    }
}
luckturntablelogic.showWatchingBattle = function () {
    if (this.myGold < this.accessCount) {
        glGame.emitter.emit("showWatchingBattle", this.accessCount);
    }
},
    // end
    // 发送网络消息
    luckturntablelogic.send_bet = function (area, value) {
        let areaArr = area > 144 ? [area - 108] : lttDef.betList[`bet_${area}`].number;
        let msg = {
            oprType: lttConst.oprEvent.oprChooseChip,
            chipValue: value,
            areaIndex: areaArr
        }
        glGame.gameNet.send_msg(glGame.room.getPlayerOp(glGame.scenetag.LUCKTURNTABLE), msg);
    };

luckturntablelogic.send_clearBet = function () {
    let msg = {
        oprType: lttConst.oprEvent.oprClearChip
    }
    glGame.gameNet.send_msg(glGame.room.getPlayerOp(glGame.scenetag.LUCKTURNTABLE), msg);
};

// end
// 发送全局消息
luckturntablelogic.updateLbl = function () {
    glGame.emitter.emit(lttConst.globalEvent.updateLbl);
};
// end
// set和get
luckturntablelogic.set = function (key, value) {
    this[key] = value;
};

luckturntablelogic.get = function (key) {
    return this[key];
};
// end
// 游戏逻辑所需接口
luckturntablelogic.clearBet = function () {
    this.selfBetCount = 0;
    glGame.emitter.emit(lttConst.globalEvent.clearBet);
    this.updateLbl();
};

luckturntablelogic.nextRound = function () {
    this.selfBetCount = 0;
    this.otherBetCount = 0;
    this.myResultGold = 0;
    this.otherWinChip = [];
    this.selfWinChip = [];
    this.totalChipBunch = null;
};

//为下注满3局提示！五局强退
luckturntablelogic.checkNoBetRound = function () {
    if (this.selfBetCount == 0) {
        this.noBetRound++;
    } else {
        this.noBetRound = 0;
    }
    if (this.noBetRound == 3) {
        let str = "        您已经连续3局未下注，如果连续5局没下注，将自动离开房间。"
        glGame.panel.showMsgBox("", str)
    } else if (this.noBetRound == 5) {
        glGame.room.exitRoom();
    }
};
luckturntablelogic.showWinArea = function () {
    glGame.emitter.emit(lttConst.globalEvent.showWinArea);
};

luckturntablelogic.showSettle = function () {
    glGame.emitter.emit(lttConst.globalEvent.chipFlyBack);
}

luckturntablelogic.addBetCount = function (prop, num) {
    this[prop] = this[prop].add(num);
    this.updateLbl();
};

luckturntablelogic.setTempGold = function (value) {
    this.mytempGold = this.mytempGold.sub(value);
};

luckturntablelogic.getCurTime = function () {
    let curTime = Math.ceil((this.waitTime - (Date.now() + this.serverOffTime)) / 1000);
    return Math.max(curTime, 0);
};

luckturntablelogic.getMidCurTime = function () {
    let curTime = Math.ceil((this.waitTime - (Date.now() + this.serverOffTime)));
    return Math.max(curTime, 0);
};

luckturntablelogic.checkGoldEnough = function (chipSize) {
    if (this.selfBetCount + chipSize > this.maxBet) {
        glGame.emitter.emit(lttConst.globalEvent.betError, "您本局的下注数额已经达到最大值，无法继续下注。");
        return false;
    }
    if (this.selfBetCount + chipSize > this.myGold) {
        glGame.emitter.emit(lttConst.globalEvent.betError, "金币不足，无法下注！");
        return false;
    }
    return true;
};

luckturntablelogic.changeChipViewType = function (bool) {
    this.showOtherChip = bool;
    glGame.storage.setItem("lttChipViewType", { type: this.showOtherChip });
    glGame.emitter.emit(lttConst.globalEvent.changeChipView);
};

luckturntablelogic.handleNumber = function (value, num = 2) {
    value = Number(value);
    if (isNaN(value)) return;
    if (~~value === value) {
        return value.toString();
    } else {
        return (Math.floor(value * 100) / 100).toFixed(num);
    }
};
luckturntablelogic.getFloat = function (value) {
    return (Number(value).div(100)).toString();
};
luckturntablelogic.setWinChip = function (prop, value) {
    this[prop].push(value);
};

luckturntablelogic.setChipNumber = function (num, node, bool) {
    cc.log("初始化筹码")
    let chipStr, isqian = false, iswan = false;
    if (Number(num) < 1000000) {
        chipStr = parseFloat(Number(num).div(100).toFixed(1)).toString();
    }
    // else if (Number(num) >= 100000 && Number(num) < 1000000) {
    //     num = Number(num).div(1000);
    //     chipStr = this.getFloat(num).toString();
    //     isqian = true;
    // } 
    else if (Number(num) >= 1000000) {
        chipStr = parseFloat(Number(num).div(1000000).toFixed(1)).toString();
        iswan = true;
    }
    if (!chipStr || chipStr == "") return
    for (let i = 0; i < chipStr.length; ++i) {
        let imgName = chipStr[i] == '.' ? 'img_chipdian' : `img_chip${chipStr[i]}`,
            y = chipStr[i] == '.' ? -8 : 0;
        let NumNode = new cc.Node();
        NumNode.addComponent(cc.Sprite).spriteFrame = this.chipAltas.getSpriteFrame(imgName);
        NumNode.parent = node;
        NumNode.y = y;
        if (i == chipStr.length - 1) {
            // if (isqian) {
            //     imgName = "img_chipqian";
            //     y = chipStr[i + 1] == '.' ? -8 : 0
            //     let numNode = new cc.Node();
            //     numNode.addComponent(cc.Sprite).spriteFrame = this.chipAltas.getSpriteFrame(imgName);
            //     numNode.parent = node;
            //     numNode.y = y;
            // }
            if (iswan) {
                imgName = "img_chipwan";
                y = chipStr[i + 1] == '.' ? -8 : 0
                let numNode = new cc.Node();
                numNode.addComponent(cc.Sprite).spriteFrame = this.chipAltas.getSpriteFrame(imgName);
                numNode.parent = node;
                numNode.y = y;
            }
        }
    }
    node.getComponent(cc.Layout).updateLayout();

    //圆筹码大于54才需要适配，方筹码则72；
    let maxWidth = bool ? 54 : 72;
    if (node.width > maxWidth) {
        for (let i = 0; i < node.childrenCount; i++) {
            node.children[i].width = node.children[i].width * maxWidth / node.width;
            node.children[i].height = node.children[i].height * maxWidth / node.width;
        }
        node.getComponent(cc.Layout).updateLayout();
    }
};

luckturntablelogic.induce = function () {
    let groupDict = {}, thirdDict = {}, numbersDict = {},
        colorDict = {}, halfDict = {}, timesDict = {};

    this.history.forEach(num => {
        timesDict[num] = timesDict[num] ? timesDict[num] + 1 : 1;
        if (num > 0) {
            let group = num % 3 ? num % 3 : 3;
            groupDict[group] = groupDict[group] ? groupDict[group] + 1 : 1;
            group = Math.ceil(num / 12);
            thirdDict[group] = thirdDict[group] ? thirdDict[group] + 1 : 1;
            group = num % 2 ? 1 : 2;
            numbersDict[group] = numbersDict[group] ? numbersDict[group] + 1 : 1;
            group = lttDef.judgeColor(num) ? 1 : 2;
            colorDict[group] = colorDict[group] ? colorDict[group] + 1 : 1;
            group = num / 18 <= 1 ? 1 : 2;
            halfDict[group] = halfDict[group] ? halfDict[group] + 1 : 1;
        }
    });

    return [groupDict, thirdDict, numbersDict, colorDict, halfDict, timesDict];
};
//end
luckturntablelogic.destroy = function () {
    this.resetData();
    this.unRegisterEvent();
};

module.exports.getInstance = function () {
    if (!g_instance) {
        g_instance = new LuckTurnTableLogic();
    }
    return g_instance;
};

module.exports.destroy = function () {
    if (g_instance) {
        // console.log("销毁大转盘数据层");
        g_instance.destroy();
        g_instance = null;
    }
};

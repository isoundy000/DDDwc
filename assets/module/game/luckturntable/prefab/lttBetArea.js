/**
 * 断线重连筹码的恢复
 * 1.清除所有筹码
 * 2.根据服务端消息渲染筹码
 * 3.调用lttChip.recovery,当结算阶段调用comeBack
 */
const lttDef = require("lttDef");
const lttConst = require("lttConst");
glGame.baseclass.extend({
    properties: {
        areaPanel: cc.Node,
        bigAreaPanel: cc.Node,
        chipPanel: cc.Node,
        chipPrefab: cc.Prefab,
        chipBtnPanel: cc.Node,
        rebetBtn: cc.Button,
        autoBtn: cc.Node,
        clockNumber: cc.Node,
        clockNode: cc.Node,
        chipAltas: cc.SpriteAtlas,  //筹码按钮
        chipAltas2: cc.SpriteAtlas,  //筹码池
        grayChipSprf: cc.SpriteFrame,
        clock_font: [cc.Font],
        clock_stateSpr: [cc.SpriteFrame],
        clock_BGstateSpr: [cc.SpriteFrame],
        atlas_red: cc.SpriteAtlas,
        atlas_bule: cc.SpriteAtlas,

        rebetBtnSpr: [cc.SpriteFrame],
        autoBtnSpr: [cc.SpriteFrame],
        node_watchingBattle: cc.Node,

        //bigAreaPanel
        node_itemYuan: cc.Node,
        node_item: cc.Node,
        node_AreaLayout: cc.Node,
        sprite_itemYuan: [cc.SpriteFrame],

        node_richMan: cc.Node,
        ft_win: cc.Font,
        ft_lose: cc.Font,

        selectChipBtnSp: [cc.SpriteFrame],//选择筹码按钮亮光
    },

    onLoad() {
        this.richmanPos = [];
        this.pushRichmanPos();
        this.lttData = require("luckturntablelogic").getInstance();
        this.lttData.set("chipAltas", this.chipAltas);
        this.registerEvent();
        this.registerGameEvent();
        this.audioMgr = cc.director.getScene().getChildByName("lttAudioMgr").getComponent("lttAudioMgr");
        this.ismidenter = true;
        this.box = null;
        this.lightArea = null;
        this.betIndex = null;
        this.curBets = {};
        this.chipList = [];
        this.AllBetList = [];
        this.touchTime = 0;
    },

    registerEvent() {
        glGame.emitter.on(lttConst.globalEvent.onMidEnter, this.initUI, this);
        glGame.emitter.on(lttConst.globalEvent.onProcess, this.onProcess, this);
        glGame.emitter.on(lttConst.globalEvent.onChooseChip, this.onChooseChip, this);
        glGame.emitter.on(lttConst.globalEvent.showWinArea, this.showWinArea, this);
        glGame.emitter.on(lttConst.globalEvent.onPlayerOp, this.onPlayerOp, this);
        glGame.emitter.on(lttConst.globalEvent.updateLbl, this.updateLabel, this);
        glGame.emitter.on(lttConst.globalEvent.chipFlyBack, this.showSettle, this);
        glGame.emitter.on(lttConst.globalEvent.onGameFinished, this.onGameFinished, this)
        glGame.emitter.on("showWatchingBattle", this.showWatchingBattle, this);
        glGame.emitter.on("richmanMove", this.richmanMove, this);
    },

    unRegisterEvent() {
        glGame.emitter.off(lttConst.globalEvent.onMidEnter, this);
        glGame.emitter.off(lttConst.globalEvent.onProcess, this);
        glGame.emitter.off(lttConst.globalEvent.onChooseChip, this);
        glGame.emitter.off(lttConst.globalEvent.showWinArea, this);
        glGame.emitter.off(lttConst.globalEvent.onPlayerOp, this);
        glGame.emitter.off(lttConst.globalEvent.updateLbl, this);
        glGame.emitter.off(lttConst.globalEvent.chipFlyBack, this);
        glGame.emitter.off(lttConst.globalEvent.onGameFinished, this)
        glGame.emitter.off("showWatchingBattle", this);
        glGame.emitter.off("richmanMove", this);
    },

    pushRichmanPos() {
        for (let i = 0; i < this.node_richMan.childrenCount; i++) {
            let pos = this.node_richMan.children[i].position;
            this.richmanPos.push(pos);
        }
    },
    richmanMove(no) {
        let node = this.node_richMan.children[no - 1];
        if (!node) return;
        node.stopAllActions();
        let moveTo = cc.moveTo(0.25, cc.v2(this.richmanPos[no - 1].x, this.richmanPos[no - 1].y - 50));
        let moveTo1 = cc.moveTo(0.25, cc.v2(this.richmanPos[no - 1].x, this.richmanPos[no - 1].y));
        node.runAction(cc.sequence(moveTo, moveTo1));
    },
    stopAllRichManAction() {
        for (let i = 0; i < this.node_richMan.childrenCount; i++) {
            if (!this.node_richMan.children[i]) continue;
            this.node_richMan.children[i].position = this.richmanPos[i];
            this.node_richMan.children[i].stopAllActions();
        }
    },
    //渲染富人榜
    onRichListChange() {
        let richinfo = this.lttData.getRichList();
        for (let i = 0; i < this.node_richMan.childrenCount; i++) {
            let node = this.node_richMan.children[i];
            if (richinfo[i]) {
                node.active = true;
            } else {
                node.active = false;
                continue;
            }
            let head = node.getChildByName("head");
            glGame.panel.showHeadImage(head, richinfo[i].headurl);
            let nickname = node.getChildByName("nickname");
            nickname.getComponent(cc.Label).string = richinfo[i].nickname;
        }
    },
    hideAllScore() {
        for (let i = 0; i < this.node_richMan.childrenCount; i++) {
            this.node_richMan.children[i].getChildByName("sp_fuhaoWin").active = false;
            this.node_richMan.children[i].getChildByName("score").active = false;
            this.node_richMan.children[i].getChildByName("score").pos = cc.v2(76, 0)
        }
    },

    registerGameEvent() {
        glGame.emitter.on('EnterBackground', this.enterBackground, this);
        glGame.emitter.on('EnterForeground', this.enterForeground, this);
    },
    //显示观战中
    showWatchingBattle(accessCount) {
        this.node_watchingBattle.active = true;
        let node = this.node_watchingBattle.getChildByName("layout").getChildByName("coin");
        node.getComponent(cc.Label).string = this.lttData.getFloat(accessCount);
    },
    onGameFinished() {
        this.clearChipPool();
        this.initChip();
        this.checkbtnStatus();
    },
    getOneChip(index) {
        let newChip = cc.instantiate(this.chipPrefab);
        let str = `fly${this.chipsicon[index]}`;
        newChip.getComponent("lttChip").init({
            pool: this.chipPoolDict[index],
            type: index,
            sprf: this.chipAltas2.getSpriteFrame(str),
            num: this.chipSize[index]
        });
        return newChip;
    },

    initChipPool() {
        this.chipPoolDict = {};
        for (let i = 0; i < 7; ++i) {
            this.chipPoolDict[i] = new cc.NodePool('lttChip');
            for (let j = 0; j < 200; ++j) {
                this.chipPoolDict[i].put(this.getOneChip(i));
            }
        }
    },

    initUI() {
        let process = this.lttData.get("process");
        if (!process || process == null) return;
        this.chipsicon = this.lttData.get("chipsIcon");
        this.initChip();
        this.pageIndex = Math.floor(this.lttData.get("currentChipType") / 3);
        this.chipBtnPanel.children[this.lttData.get("currentChipType")].getComponent(cc.Toggle).check();
        this.brokenlineChipRecovery();
        this.checkbtnStatus();
        if (process == lttConst.process.chooseChip) {
            this.onTouch();
        } else if (process == lttConst.process.settleEffect) {
            this.recoveryAnim();
            this.brokenlineChip();
        }
        this.changeclockState();
        this.schedule(this.countDown, 1);
        this.brokenLineGoldLabel();
        this.onRichListChange();
    },

    initChip() {
        this.chipSize = this.lttData.get("chipSize");
        for (let i = 0; i < this.chipBtnPanel.childrenCount; ++i) {
            let node = this.chipBtnPanel.children[i];
            node.getChildByName("Background").getComponent(cc.Sprite).spriteFrame = this.chipAltas.getSpriteFrame(this.chipsicon[i]);
            let bool = Number(this.chipsicon[i].substring(4)) < 100;
            node.getChildByName("checkmark").getComponent(cc.Sprite).spriteFrame = bool ? this.selectChipBtnSp[0] : this.selectChipBtnSp[1]
            node.getChildByName("number").removeAllChildren();

            this.lttData.setChipNumber(this.chipSize[i], node.getChildByName("number"), bool);
        }
        this.initChipPool();
    },

    recoveryChips(areaPanel) {
        let myData = this.lttData.get("syncMyChipData");
        let otherData = this.lttData.get("syncOtherChipData");
        let selfBetCount = 0, otherBetCount = 0;
        if (myData) {
            for (let i = 0; i < myData.length; ++i) {
                let chipIndex = lttDef.getKeyByValue(myData[i].listAreaIndex);
                let chipType = this.getChipTypeByValue(myData[i].chipValue);
                this.flyChip({
                    betNumber: chipIndex,
                    type: chipType,
                    isMine: 0
                }, areaPanel, "recovery");
                if (chipIndex in this.curBets) {
                    this.curBets[chipIndex].push(chipType);
                } else {
                    this.curBets[chipIndex] = [chipType];
                }
                selfBetCount = selfBetCount.add(myData[i].chipValue);
            }
            this.lttData.set("selfBetCount", selfBetCount);
        }
        if (otherData) {
            for (let i = 0; i < otherData.length; ++i) {
                let chipType = this.getChipTypeByValue(otherData[i].chipValue);
                this.flyChip({
                    betNumber: lttDef.getKeyByValue(otherData[i].listAreaIndex),
                    type: chipType,
                    isMine: this.checkWhoBet(otherData[i].uid)
                }, areaPanel, "recovery");
                otherBetCount = otherBetCount.add(otherData[i].chipValue);
            }
            this.lttData.set("otherBetCount", otherBetCount);
        }
        this.lttData.updateLbl();
    },

    //中奖区域闪烁
    recoveryAnim() {
        let curTime = this.lttData.getMidCurTime();
        if (curTime >= 4100) {
            curTime = (curTime - 4100) / 1000;
        }
        let dty = cc.delayTime(curTime);
        let cb = cc.callFunc(() => {
            this.showWinArea();
        })
        this.node.runAction(cc.sequence(dty, cb));
    },

    onClick(ButtonName, ButtonNode) {
        switch (ButtonName) {
            case "chip0":
            case "chip1":
            case "chip2":
            case "chip3":
            case "chip4":
                this.setChipbtnState(ButtonName);
                this.audioMgr.playEffect("clickChips");
                this.lttData.set("currentChipType", parseInt(ButtonName.substring(4)));
                glGame.storage.setItem("lttChipType", { chipType: parseInt(ButtonName.substring(4)) });
                break;
            case "rebetBtn":
                this.reBet();
                break;
            case "autoBtn":
                this.autoBet();
                break;
            case "close_bigAreaPanel":
                this.bigAreaPanel.active = false;
                break;
            default:
                if (ButtonName.indexOf("btn_bigArea") > -1) {
                    this.betIndex = Number(ButtonName.substring(11))
                    this.bet(this.betIndex, this.lttData.get("currentChipType"));
                }
        }
    },

    setChipbtnState(name) {
        for (let i = 0; i < this.chipBtnPanel.childrenCount; i++) {
            if (this.chipBtnPanel.children[i].name == name) {
                this.chipBtnPanel.children[i].scale = 1;
                this.chipBtnPanel.children[i].y = 6;
            } else {
                this.chipBtnPanel.children[i].scale = 0.85;
                this.chipBtnPanel.children[i].y = 0;
            }
        }
    },

    onProcess() {
        switch (this.lttData.get("process")) {
            case lttConst.process.chooseChip:
                this.onRichListChange();
                this.hideAllScore();
                let dtyq = cc.delayTime(1);
                let cb1 = cc.callFunc(() => {
                    this.onTouch();
                    this.checkbtnStatus();
                })
                this.node.runAction(cc.sequence(dtyq, cb1));
                this.showAreaBet();
                break;
            case lttConst.process.settleEffect:
                this.offTouch();
                this.offTouchCb();
                this.lttData.set("lastBetData", this.curBets);
                this.curBets = {};
                this.chipList = [];
                this.recoveryAnim();
                this.brokenlineChip();
                let dty = cc.delayTime(10);
                let cb = cc.callFunc(() => {
                    this.richmanScoreFly();
                })
                this.node.runAction(cc.sequence(dty, cb));
                break;
            case lttConst.process.waitStart: this.setAreaLight(); break;
        }
    },

    //富人榜分数
    richmanScoreFly() {
        let richSettleInfo = this.lttData.getListrichInfo();
        cc.log("分数数据1", richSettleInfo)
        for (let i = 0; i < richSettleInfo.length; ++i) {
            if (richSettleInfo[i].resultGold == 0) continue;
            let score = this.node_richMan.children[i].getChildByName("score");
            score.getComponent(cc.Label).string = Number(richSettleInfo[i].resultGold) > 0 ? "+" + this.lttData.getFloat(richSettleInfo[i].resultGold) : this.lttData.getFloat(richSettleInfo[i].resultGold);
            score.getComponent(cc.Label).font = Number(richSettleInfo[i].resultGold) > 0 ? this.ft_win : this.ft_lose;
            score.active = true;
            score.runAction(cc.moveTo(0.3, cc.v2(76, 50)));
            if(Number(richSettleInfo[i].resultGold) > 0){
                this.node_richMan.children[i].getChildByName("sp_fuhaoWin").active = true;
                this.node_richMan.children[i].getChildByName("sp_fuhaoWin").getComponent(sp.Skeleton).setAnimation(0,'animation',true);
            }
        }
    },
    //0.自己，1-3富人榜，99其他人
    checkWhoBet(Uid) {
        let richList = this.lttData.getRichList();
        for (let i = 0; i < richList.length; i++) {
            if (richList[i].uid == Uid) {
                return i + 1;
            }
        }
        if (Uid == this.lttData.get("myUid")) return 0;
        return 99;  //其他人
    },

    onChooseChip() {
        let chipBunch = this.lttData.get("chipBunch");
        let checkNo = this.checkWhoBet(chipBunch.chooseUid)
        let myuid = this.lttData.get("myUid");
        if (chipBunch.chooseUid == myuid) return;
        let chipType = this.getChipTypeByValue(chipBunch.chipValue);
        if (!chipType) return;
        this.flyChip({
            betNumber: lttDef.getKeyByValue(chipBunch.areaIndex),
            type: chipType,
            isMine: checkNo
        }, this.areaPanel);
        if (checkNo == 1 || checkNo == 2 || checkNo == 3) {
            glGame.emitter.emit("richmanMove", checkNo);
        }
        this.audioMgr.playEffect('otherBet');
        glGame.emitter.emit("showOtherBetAni")
        this.lttData.addBetCount("otherBetCount", chipBunch.chipValue);
    },

    onPlayerOp() {
        if (this.lttData.get("opType") == lttConst.oprEvent.oprChooseChip) {
            let obj = this.chipList.shift();
            this.flyChip(obj, this.areaPanel);
            this.audioMgr.playEffect('bet');
            this.lttData.setTempGold(this.chipSize[obj.type]);
            this.lttData.addBetCount("selfBetCount", this.chipSize[obj.type]);

            if (this.lttData.get("isfirstBet")) {        //下注改变续投状态为灰态
                this.lttData.set("isfirstBet", false)
                this.checkAutoStatus(this.curBets);         //检查自动状态
                this.checkRebetStatus();                    //检查续投状态
            }
        }
    },

    updateLabel() {
        if (this.lttData.get("autoStatus")) return;
        this.refreshChipImg(this.lttData.get("mytempGold"));
    },

    showSettle() {
        if (this.lttData.get("autoStatus")) return;
        this.refreshChipImg(this.lttData.get("myGold").add(this.lttData.get("myResultGold")));
    },

    refreshChipImg(myCoin) {
        let betFull = true;
        this.chipSize.forEach((v, i) => {
            let obj = this.chipBtnPanel.children[i].getChildByName("Background").getComponent(cc.Sprite);
            let label = this.chipBtnPanel.children[i].getChildByName("number");
            obj.spriteFrame = this.chipAltas.getSpriteFrame(this.chipsicon[i])
            obj.node.color = v <= myCoin ? new cc.Color(255, 255, 255) : new cc.Color(144, 144, 144);
            label.color = v <= myCoin ? new cc.Color(255, 255, 255) : new cc.Color(144, 144, 144);
            betFull = v <= myCoin
        });
        if (betFull) {
            let maxBet = this.lttData.get("maxBet");
            let selfBetCount = this.lttData.get("selfBetCount");

            for (let j = 0; j < this.chipSize.length; j++) {
                let node = this.chipBtnPanel.children[j].getChildByName("Background");
                let label = this.chipBtnPanel.children[j].getChildByName("number");
                node.color = (selfBetCount + this.chipSize[j]) <= maxBet ? new cc.Color(255, 255, 255) : new cc.Color(144, 144, 144);
                label.color = (selfBetCount + this.chipSize[j]) <= maxBet ? new cc.Color(255, 255, 255) : new cc.Color(144, 144, 144);
            }
        }
    },

    setChipBtnStatus(bool) {
        if (bool) {
            for (let j = 0; j < this.chipSize.length; j++) {
                let node = this.chipBtnPanel.children[j].getChildByName("Background")
                let label = this.chipBtnPanel.children[j].getChildByName("number");
                node.color = new cc.Color(144, 144, 144);
                label.color = new cc.Color(144, 144, 144);
            }
        } else {
            this.refreshChipImg(this.lttData.get("myGold").sub(this.lttData.get("selfBetCount")));
        }
    },
    checkbtnStatus() {
        let data = this.lttData.get("lastBetData")
        this.checkAutoStatus(data);         //检查自动状态
        this.checkRebetStatus();        //检查续投状态
    },

    checkAutoStatus(data) {
        let lastBetData = data;
        let totalCost = 0;
        let myGold = this.lttData.get("myGold");
        if (this.lttData.get("autoStatus")) {                                   //自动状态
            this.autoBtn.getChildByName("label").getComponent(cc.Label).string = "取 消"
            this.autoBtn.getChildByName("sp_auto").active = true;
            if (lastBetData && Object.keys(lastBetData).length > 0) {
                this.autoBtn.getComponent(cc.Button).interactable = true;
                this.autoBtn.getComponent(cc.Sprite).spriteFrame = this.autoBtnSpr[0]
                for (let key in lastBetData) {
                    for (let i = 0; i < lastBetData[key].length; ++i) {
                        if ((totalCost += this.chipSize[lastBetData[key][i]]) > myGold) {
                            // glGame.emitter.emit(lttConst.globalEvent.betError, "金币不足，无法下注！");
                            this.autoBtn.getComponent(cc.Button).interactable = false;
                            this.autoBtn.getComponent(cc.Sprite).spriteFrame = this.autoBtnSpr[1]
                            this.autoBtn.getChildByName("label").getComponent(cc.Label).string = "自 动"
                            this.autoBtn.getChildByName("sp_auto").active = false;
                            this.lttData.set("autoStatus", false);
                            this.setChipBtnStatus(false)
                            return;
                        }
                    }
                }
                this.reBet();
            } else {                                                                  //没有数据
                this.autoBtn.getComponent(cc.Button).interactable = false;
                this.autoBtn.getComponent(cc.Sprite).spriteFrame = this.autoBtnSpr[1]
                this.autoBtn.getChildByName("label").getComponent(cc.Label).string = "自 动"
                this.autoBtn.getChildByName("sp_auto").active = false;
                this.lttData.set("autoStatus", false);
                this.setChipBtnStatus(false)
            }
        } else {                                                                    //非自动状态
            this.autoBtn.getChildByName("label").getComponent(cc.Label).string = "自 动"
            this.autoBtn.getChildByName("sp_auto").active = false;
            if (lastBetData && Object.keys(lastBetData).length > 0) {
                this.autoBtn.getComponent(cc.Button).interactable = true;
                this.autoBtn.getComponent(cc.Sprite).spriteFrame = this.autoBtnSpr[0]
            } else {
                this.autoBtn.getComponent(cc.Button).interactable = false;
                this.autoBtn.getComponent(cc.Sprite).spriteFrame = this.autoBtnSpr[1]
            }
        }
    },
    autoBet() {
        let bool = this.lttData.get("autoStatus")
        this.autoBtn.children[0].getComponent(cc.Label).string = bool ? "自 动" : "取 消"
        this.autoBtn.getChildByName("sp_auto").active = !bool;
        this.lttData.set("autoStatus", !bool);
        if (this.lttData.get("isfirstBet") && !bool) {
            let data = this.lttData.get("lastBetData");
            this.checkAutoStatus(data);
        }
        this.setChipBtnStatus(!bool)
    },
    checkRebetStatus() {
        if (!this.lttData.get("isfirstBet")) {
            this.rebetBtn.interactable = false;      //下了注
            this.rebetBtn.node.getComponent(cc.Sprite).spriteFrame = this.rebetBtnSpr[1]
            return
        }
        if (this.lttData.get("autoStatus")) {
            this.rebetBtn.interactable = false;       //自动下注状态
            this.rebetBtn.node.getComponent(cc.Sprite).spriteFrame = this.rebetBtnSpr[1]
            return
        }
        let lastBetData = this.lttData.get("lastBetData"), totalCost = 0;
        let myGold = this.lttData.get("myGold");
        if (lastBetData && Object.keys(lastBetData).length > 0) {
            this.rebetBtn.interactable = true;
            this.rebetBtn.node.getComponent(cc.Sprite).spriteFrame = this.rebetBtnSpr[0]
            for (let key in lastBetData) {
                for (let i = 0; i < lastBetData[key].length; ++i) {
                    if ((totalCost += this.chipSize[lastBetData[key][i]]) > myGold) {
                        // glGame.emitter.emit(lttConst.globalEvent.betError, "金币不足，无法下注！");
                        this.rebetBtn.interactable = false;
                        this.rebetBtn.node.getComponent(cc.Sprite).spriteFrame = this.rebetBtnSpr[1]
                        return;
                    }
                }
            }
        } else {
            this.rebetBtn.interactable = false;
            this.rebetBtn.node.getComponent(cc.Sprite).spriteFrame = this.rebetBtnSpr[1]
        }
    },

    /**
     * start，初始化一些状态
     * move 计算按下时间 当达到条件 
     * 1)isend  = true
     * 2)记下点击的位置，点击的区域
     * 3)弹出大界面，渲染
     * end   isend = true，直接return
     * 否则，正常下注
     */
    onTouch() {
        //检测续投按钮状态，主动投注按钮状态
        this.areaPanel.on("touchstart", (touch) => {
            this.curTouchPoint = this.node.convertToNodeSpaceAR(touch.getLocation());
            this.touchArea(this.areaPanel.convertToNodeSpaceAR(touch.getLocation()));
            this.istouchEnd = false;
            this.touchTime = 0;
            this.schedule(this.touchCounterCallback, 0.1);
        }, this);

        this.areaPanel.on("touchmove", (touch) => {

        }, this);

        this.areaPanel.on("touchend", () => {
            if (!this.istouchEnd) {
                this.closeLight();
                this.unschedule(this.touchCounterCallback);
                if (Number(this.betIndex) > 36 && Number(this.betIndex) <= 144) return;
                this.bet(this.betIndex, this.lttData.get("currentChipType"));
            }
        }, this);
    },
    offTouch() {
        this.areaPanel.off("touchstart");
        this.areaPanel.off("touchmove");
        this.areaPanel.off("touchend");
    },

    offTouchCb() {
        this.bigAreaPanel.active = false;
        this.rebetBtn.interactable = false;
        this.rebetBtn.node.getComponent(cc.Sprite).spriteFrame = this.rebetBtnSpr[1]
        this.closeLight();
        this.betIndex = null;
        this.box = null;
    },
    //计时
    touchCounterCallback() {
        this.touchTime += 1;
        if (this.istouchEnd) return
        if (this.touchTime > 4) {
            this.istouchEnd = true;
            this.unschedule(this.touchCounterCallback);
            this.closeLight();
            let time = this.lttData.getMidCurTime();
            if (time <= 1500 || this.betIndex > 36) return

            let process = this.lttData.get("process");
            if (this.betIndex && process == lttConst.process.chooseChip)
                this.initBigAreaPanel(this.betIndex, this.curTouchPoint);
        }
    },
    //渲染下注大区域
    initBigAreaPanel(betIndex, pos) {
        let dataList = lttDef.getBigAreaValue(betIndex);
        this.node_AreaLayout.removeAllChildren();
        this.bigAreaPanel.active = true;
        this.bigAreaPanel.getChildByName("bg").x = this.getBigAreaPos(pos.x);
        //处理数据
        for (let i = 0; i < dataList.length; i++) {
            let index = Object.keys(dataList[i])[0];
            let arr = JSON.parse(dataList[i][index]);
            //生成行
            let row = cc.instantiate(this.node_item);
            row.name = "btn_bigArea" + index.toString();
            row.parent = this.node_AreaLayout;
            row.active = true;
            //生成小圆
            for (let j = 0; j < arr.length; j++) {
                let item = cc.instantiate(this.node_itemYuan);
                item.parent = row;
                item.children[0].getComponent(cc.Label).string = arr[j];
                item.getComponent(cc.Sprite).spriteFrame = this.sprite_itemYuan[lttDef.judgeColor(arr[j])];
                item.active = true;
            }
        }
    },
    /**
     *每个小区域格子width：60  173大区域背景的width的一半
     */
    getBigAreaPos(x) {
        if (Math.floor(x / 60) < 3) {
            x = (Math.floor(x / 60) * 60) + 90 + 173;
        } else {
            x = (Math.floor(x / 60) * 60) - 30 - 173;
        }
        console.log("格子的区域", x)
        return x
    },
    touchArea(touchPoint) {
        if (this.lttData.get("autoStatus")) return
        if (this.lttData.get("myGold") < this.lttData.get("accessCount")) {
            this.lttData.showGoldLess();
            return;
        }
        if (this.box && this.box.contains(touchPoint)) {
            this.closeLight();
            this.lightArea = [];
            let numbers = lttDef.betList[`bet_${this.betIndex}`].number;
            if (Number(this.betIndex) > 144 && Number(this.betIndex) <= 156) {
                this.lightArea.push(this.areaPanel.children[Number(this.betIndex)]);
                this.areaPanel.children[Number(this.betIndex)].getChildByName("bet").active = true;
            }
            for (let i = 0; i < numbers.length; ++i) {
                this.areaPanel.children[numbers[i]].getChildByName("bet").active = true;
                this.lightArea.push(this.areaPanel.children[numbers[i]]);
            }
            return;
        } else {
            for (let i = 0; i < this.areaPanel.childrenCount; ++i) {
                let currentBox = this.areaPanel.children[i].getBoundingBox();
                if (currentBox.contains(touchPoint)) {
                    this.closeLight();
                    this.box = currentBox;
                    this.betIndex = this.areaPanel.children[i].name;
                    if (Number(this.betIndex) > 36 && Number(this.betIndex) <= 144) return;
                    let numbers = lttDef.betList[`bet_${this.betIndex}`].number;
                    this.lightArea = [];
                    if (Number(this.betIndex) > 144 && Number(this.betIndex) <= 156) {
                        this.lightArea.push(this.areaPanel.children[Number(this.betIndex)]);
                        this.areaPanel.children[Number(this.betIndex)].getChildByName("bet").active = true;
                    }
                    for (let i = 0; i < numbers.length; ++i) {
                        this.areaPanel.children[numbers[i]].getChildByName("bet").active = true;
                        this.lightArea.push(this.areaPanel.children[numbers[i]]);
                    }
                    break;
                }
            }
        }
    },

    closeLight() {
        if (this.lightArea == null) return;
        for (let i = 0; i < this.lightArea.length; ++i) {
            this.lightArea[i].getChildByName("bet").active = false;
        }
        this.lightArea = null;
    },

    bet(index, chipType) {
        if (!index || !this.lttData.checkGoldEnough(this.chipSize[chipType])) return;
        if (!this.checkBet(index)) {
            glGame.emitter.emit(lttConst.globalEvent.betError, "当前押注不符合规则!");
            return;
        }
        if (index in this.curBets) {
            this.curBets[index].push(chipType);
        } else {
            this.curBets[index] = [chipType];
        }
        this.chipList.push({ betNumber: index, type: chipType, isMine: 0 });
        this.lttData.send_bet(index, this.chipSize[chipType]);
    },

    //下注
    flyChip(obj, areaPanel, func = 'goOut') {
        let chipNode = null;
        if (this.chipPoolDict[obj.type].size() > 0) {
            chipNode = this.chipPoolDict[obj.type].get(obj, areaPanel);
        } else {
            chipNode = this.getOneChip(obj.type);
            chipNode.getComponent("lttChip").reuse(obj, areaPanel);
        }
        chipNode.parent = this.chipPanel;
        this.AllBetList.push(obj);
        chipNode.getComponent("lttChip")[func]();
    },

    //赔付筹码到区域
    brokenlineChip() {
        let curwaitTime = this.lttData.getMidCurTime();
        let process = this.lttData.get("process");
        if (process == lttConst.process.settleEffect) {
            if (curwaitTime >= 2100) {
                curwaitTime = (curwaitTime - 2100) / 1000;
                let dty = cc.delayTime(curwaitTime);
                let cb = cc.callFunc(() => {
                    this.showChipFly();
                })
                this.node.runAction(cc.sequence(dty, cb));
            }
        }
    },
    //庄家赔付到区域  改为赔给玩家
    showChipFly() {
        let targetNumber = this.lttData.get("targetNumber");
        for (let i = 0; i < this.AllBetList.length; i++) {
            let obj = this.AllBetList[i];
            let betNumber = obj.betNumber;
            let betData = lttDef.betList[`bet_${betNumber}`].number;
            if (betData.indexOf(targetNumber) >= 0) {
                let multiple = lttDef.betList[`bet_${betNumber}`].Multiple;
                for (let j = 0; j < multiple - 1; j++) {
                    this.flyChipToArea(obj, this.areaPanel);
                }
            }
        }
    },
    flyChipToArea(obj, areaPanel, func = 'toArea') {
        let chipNode = null;
        if (this.chipPoolDict[obj.type].size() > 0) {
            chipNode = this.chipPoolDict[obj.type].get(obj, areaPanel);
        } else {
            chipNode = this.getOneChip(obj.type);
            chipNode.getComponent("lttChip").reuse(obj, areaPanel);
        }
        chipNode.parent = this.chipPanel;
        this.audioMgr.playEffect("flyToPlayer");
        chipNode.getComponent("lttChip")[func]();
    },

    //断线重连下注阶段筹码恢复
    brokenlineChipRecovery() {
        let process = this.lttData.get("process");
        let curtime = this.lttData.getMidCurTime();
        if (process == lttConst.process.chooseChip) {
            this.reAllBetChip();
        } else if (process == lttConst.process.settleEffect) {
            if (curtime >= 3000) {
                this.reAllBetChip();
            }
        }
    },

    brokenLineGoldLabel() {
        let process = this.lttData.get("process");
        let curtime = this.lttData.getMidCurTime();
        if (process == lttConst.process.chooseChip || process == lttConst.process.waitStart) {
            this.refreshChipImg(this.lttData.get("mytempGold"));
        } else if (process == lttConst.process.settleEffect) {
            if (curtime > 700) {
                this.refreshChipImg(this.lttData.get("mytempGold"));
            } else {
                this.refreshChipImg(this.lttData.get("myGold"));
            }
        }
    },

    reAllBetChip() {
        let totalChipBunch = this.lttData.get("totalChipBunch") || [];
        let areaPanel = this.areaPanel;
        for (let i = 0; i < totalChipBunch.length; ++i) {
            let betNumber = lttDef.getKeyByValue(totalChipBunch[i].areaIndex),
                chipType = this.getChipTypeByValue(totalChipBunch[i].chipValue),
                isMine = this.checkWhoBet(totalChipBunch[i].chooseUid),
                obj = { betNumber: betNumber, type: chipType, isMine: isMine };
            this.flyChip(obj, areaPanel, "recovery");
        }
    },

    checkBet(index) {
        switch (index) {
            case "145": return !(("146" in this.curBets) && ("147" in this.curBets));
            case "146": return !(("145" in this.curBets) && ("147" in this.curBets));
            case "147": return !(("145" in this.curBets) && ("146" in this.curBets));
            case "148": return !(("149" in this.curBets) && ("150" in this.curBets));
            case "149": return !(("148" in this.curBets) && ("150" in this.curBets));
            case "150": return !(("148" in this.curBets) && ("149" in this.curBets));
            case "151": return !("156" in this.curBets);
            case "152": return !("155" in this.curBets);
            case "153": return !("154" in this.curBets);
            case "154": return !("153" in this.curBets);
            case "155": return !("152" in this.curBets);
            case "156": return !("151" in this.curBets);
            default: return true;
        }
    },

    showWinArea() {
        let targetNumber = parseInt(this.lttData.get("targetNumber"));
        for (let i = 0; i < 37; ++i) {
            if (lttDef.betList[`bet_${i}`].number.indexOf(targetNumber) >= 0) {
                let CB = cc.callFunc(() => {
                    this.areaPanel.children[i].getChildByName("light").active = false;
                });
                let blinkAction = cc.sequence(cc.fadeTo(0.4, 0), cc.fadeTo(0.4, 100), cc.fadeTo(0.4, 0), cc.fadeTo(0.4, 100), CB);
                this.areaPanel.children[i].getChildByName("light").active = true;
                this.areaPanel.children[i].getChildByName("light").runAction(blinkAction);
            }
        }
        for (let j = 145; j < 157; ++j) {
            if (lttDef.betList[`bet_${j}`].number.indexOf(targetNumber) >= 0) {
                let CB = cc.callFunc(() => {
                    this.areaPanel.children[j].getChildByName("light").active = false;
                });
                let blinkAction = cc.sequence(cc.fadeTo(0.4, 0), cc.fadeTo(0.4, 100), cc.fadeTo(0.4, 0), cc.fadeTo(0.4, 100), CB);
                this.areaPanel.children[j].getChildByName("light").active = true;
                this.areaPanel.children[j].getChildByName("light").runAction(blinkAction);
            }
        }
    },

    showAreaBet() {
        for (let i = 0; i < 37; ++i) {
            let CB = cc.callFunc(() => {
                this.areaPanel.children[i].getChildByName("bet").active = false;
                this.areaPanel.children[i].getChildByName("bet").opacity = 255;
            });
            let blinkAction = cc.sequence(cc.fadeTo(0.5, 0), cc.fadeTo(0.5, 100), cc.fadeTo(0.5, 0), cc.fadeTo(0.5, 100), CB);
            this.areaPanel.children[i].getChildByName("bet").active = true;
            this.areaPanel.children[i].getChildByName("bet").runAction(blinkAction);
        }
        for (let j = 145; j < 157; ++j) {
            let CB = cc.callFunc(() => {
                this.areaPanel.children[j].getChildByName("bet").active = false;
                this.areaPanel.children[j].getChildByName("bet").opacity = 255;
            });
            let blinkAction = cc.sequence(cc.fadeTo(0.5, 0), cc.fadeTo(0.5, 100), cc.fadeTo(0.5, 0), cc.fadeTo(0.5, 100), CB);
            this.areaPanel.children[j].getChildByName("bet").active = true;
            this.areaPanel.children[j].getChildByName("bet").runAction(blinkAction);
        }
    },

    setAreaLight() {
        for (let i = 0; i < 37; ++i) {
            this.areaPanel.children[i].getChildByName("light").opacity = 255;
        }
        for (let j = 145; j < 157; ++j) {
            this.areaPanel.children[j].getChildByName("light").opacity = 255;
        }
    },

    clearBet() {
        this.curBets = {};
        this.chipList = [];
        this.lttData.send_clearBet();
    },

    reBet() {
        this.rebetBtn.interactable = false;
        this.rebetBtn.node.getComponent(cc.Sprite).spriteFrame = this.rebetBtnSpr[1]
        let lastBetData = this.lttData.get("lastBetData"), totalCost = 0;
        let myGold = this.lttData.get("myGold"), accessCount = this.lttData.get("accessCount");
        if (lastBetData && Object.keys(lastBetData).length > 0) {
            // this.clearBet();
            for (let key in lastBetData) {
                for (let i = 0; i < lastBetData[key].length; ++i) {
                    if ((totalCost += this.chipSize[lastBetData[key][i]]) > myGold) {
                        glGame.emitter.emit(lttConst.globalEvent.betError, "金币不足，无法下注！");
                        return;
                    }
                    this.bet(key, lastBetData[key][i]);
                    this.lttData.set("isfirstBet", false)
                }
            }
        }
    },

    countDown() {
        this.changeclockState();
    },

    changeclockState() {

        let process = this.lttData.get("process");
        if (process == lttConst.process.waitStart) {
            this.clockNode.children[1].getComponent(cc.Sprite).spriteFrame = this.clock_stateSpr[0];
            this.clockNode.getComponent(cc.Sprite).spriteFrame = this.clock_BGstateSpr[0];
            this.clockNode.children[0].active = false;
            this.clockNode.children[1].active = true;

        } else if (process == lttConst.process.settleEffect) {
            this.clockNode.children[1].getComponent(cc.Sprite).spriteFrame = this.clock_stateSpr[1];
            this.clockNode.getComponent(cc.Sprite).spriteFrame = this.clock_BGstateSpr[0];
            this.clockNode.children[0].active = false;
            this.clockNode.children[1].active = true;
        } else {

            //倒计时特效
            let FaTo1 = cc.fadeTo(0, 255);
            let ScaTo = cc.scaleTo(0, 0.67);
            let ScaTo1 = cc.scaleTo(0.1, 0.75);
            let Dty = cc.delayTime(0.6);

            let ScaTo0 = cc.scaleTo(0, 0.75);
            let Dty1 = cc.delayTime(0.7);

            let FaTo = cc.fadeTo(0.3, 153);
            let ScaTo2 = cc.scaleTo(0.3, 1);

            let act1 = cc.sequence(ScaTo, ScaTo1, FaTo1, Dty, cc.spawn(FaTo, ScaTo2));
            let act2 = cc.sequence(ScaTo0, Dty1, cc.spawn(FaTo, ScaTo2));

            let curTime = this.lttData.getCurTime();
            this.clockNode.getComponent(cc.Sprite).spriteFrame = curTime <= 5 ? this.clock_BGstateSpr[1] : this.clock_BGstateSpr[0];

            let atlas = Number(curTime) > 5 ? this.atlas_bule : this.atlas_red;
            let str = curTime.toString()
            let arr = str.split("");
            this.clockNumber.children[0].active = false;
            this.clockNumber.children[1].active = false;
            for (let i = 0; i < arr.length; i++) {
                this.clockNumber.children[i].getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`${arr[i]}`);
                this.clockNumber.children[i].active = true;
            }
            // this.clockNumber.opacity = 255;
            let beginBetTime = this.lttData.get("BetTime") - 1;
            if (curTime <= beginBetTime) {
                this.clockNode.children[0].active = true;
                this.clockNode.children[1].active = false;
            }
            if (!this.ismidenter) {
                this.clockNumber.runAction(curTime == beginBetTime ? act2 : act1)
            } else {
                this.clockNumber.scale = 1;
                this.ismidenter = false;
            }

            if (curTime <= 5 && curTime > 1) {
                this.audioMgr.playClockEffect(true);
            } else if (curTime == 1) {
                this.audioMgr.playClockEffect(false);
            }
        }
    },
    getChipTypeByValue(value) {
        if (!this.chipSize) return
        for (let i = 0; i < this.chipSize.length; i++) {
            if (Number(this.chipSize[i]) == value) {
                return i;
            }
        }
        // return this.chipSize.findIndex(v => v == value);
    },

    enterBackground() {
        this.unschedule(this.createChip);
        this.node.stopAllActions();
        this.hideAllScore();
        this.stopAllRichManAction();
        this.unRegisterEvent();
        this.offTouch();
        this.offTouchCb();
        this.unschedule(this.countDown);
        this.clockNode.children[0].active = false;
        this.clockNode.children[1].active = false;
        this.clockNumber.stopAllActions();
        this.AllBetList.splice(0, this.AllBetList.length);
    },

    enterForeground() {
        this.ismidenter = true;
        this.onRichListChange();
        this.registerEvent();
        this.changeclockState();
        this.schedule(this.countDown, 1);
        let process = this.lttData.get("process");
        this.brokenlineChipRecovery();
        this.brokenLineGoldLabel();
        if (process == lttConst.process.chooseChip) {
            this.onTouch();
            this.setAreaLight();
            if (!this.lttData.get("isfirstBet")) {
                this.autoBtn.getComponent(cc.Button).interactable = true;
                this.autoBtn.getComponent(cc.Sprite).spriteFrame = this.autoBtnSpr[0]
                this.autoBtn.getChildByName("label").getComponent(cc.Label).string = "自 动"
                this.autoBtn.getChildByName("sp_auto").active = false;
                this.lttData.set("autoStatus", false);
                return;
            }
        } else if (process == lttConst.process.settleEffect) {
            //中奖区域闪烁
            this.recoveryAnim();
            this.brokenlineChip();
        }

        this.lttData.set("autoStatus", false);
        this.checkbtnStatus();
    },


    // update (dt) {},

    clearChipPool() {
        for (let k in this.chipPoolDict) {
            this.chipPoolDict[k].clear();
            this.chipPoolDict[k] = null;
        }
    },

    OnDestroy() {
        this.clearChipPool();
        this.AllBetList.splice(0, this.AllBetList.length);
        this.unschedule(this.createChip);
        this.unschedule(this.countDown);
        this.unRegisterEvent();
        glGame.emitter.off('EnterBackground', this);
        glGame.emitter.off('EnterForeground', this);
    }
});

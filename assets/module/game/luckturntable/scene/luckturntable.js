const lttConst = require("lttConst");

glGame.baseclass.extend({
    properties: {
        turnTable: cc.Prefab,
        betArea: cc.Prefab,
        playerList: cc.Prefab,
        history: cc.Prefab,
        betTipAnim: cc.Prefab,
        headImg: cc.Node,
        idLbel: cc.Label,
        selfBetLbl: cc.Label,
        totalBetLbl: cc.Label,
        goldLbel: cc.Label,
        recordLbel: cc.Label,
        trendPanel: cc.Prefab,
        settlePanel: cc.Prefab,
        hideBtn: cc.Node,
        menu: cc.Node,
        btn_mune: cc.Node,
        lab_peopleCount: cc.Label,
        lab_myScore: cc.Label,
        sp_myWin: sp.Skeleton,
        zoushiBtn: cc.Node,
        otherPlayer: cc.Node,

        sp_tip: sp.SkeletonData,

        ft_win: cc.Font,
        ft_lose: cc.Font,

        lab_rooinfo: cc.Label,
    },

    onLoad() {
        glGame.panel.showRoomLoading();
        this.lttData = require("luckturntablelogic").getInstance();
        this.registerEvent();
        this.registerGameEvent();
        this.audioMgr = cc.director.getScene().getChildByName("lttAudioMgr").getComponent("lttAudioMgr");
        this.audioMgr.playBGM();
        this.addChildPanel(this.turnTable, 0)
        this.addChildPanel(this.betArea, 1)
        this.addChildPanel(this.trendPanel, 1)
        this.menu.zIndex = 10;

        let size = cc.size(cc.winSize.width * 0.53, 30);
        let pos = cc.v2(cc.winSize.width * 0.5, 708);
        glGame.panel.showRollNotice(pos, size);

        this.updateSelfInfo();

        this.hideBtn.getComponent(cc.Toggle).isChecked = this.lttData.get("showOtherChip");
        this.hideBtnCB(this.hideBtn);

        this.aniNode = cc.instantiate(this.betTipAnim);
        this.aniNode.parent = cc.director.getScene();
        this.aniEvent();
        this.syncProcess();
    },

    //骨骼动画播放结束的回调
    aniEvent() {
        let Skeleton = this.aniNode.getChildByName("skeleton").getComponent(sp.Skeleton);     //骨骼动画的
        Skeleton.setCompleteListener((trackEntry, loopCount) => {
            let name = trackEntry.animation ? trackEntry.animation.name : "";
            if (name == 'ksxz' || name == 'xzjs') {
                Skeleton.node.active = false;
            }
        })
    },

    registerEvent() {
        glGame.emitter.on(lttConst.globalEvent.onMidEnter, this.syncProcess, this);
        glGame.emitter.on(lttConst.globalEvent.onProcess, this.onProcess, this);
        glGame.emitter.on(lttConst.globalEvent.betError, this.betError, this);
        glGame.emitter.on("showOtherBetAni", this.showOtherBetAni, this);
        glGame.emitter.on(lttConst.globalEvent.onEnterRoom, this.onEnterRoom, this);
        glGame.emitter.on(lttConst.globalEvent.updateLbl, this.updateLabel, this);
        glGame.emitter.on("showZoushibtn", this.showZoushibtn, this);
        glGame.emitter.on("gl_enterRoom", this.updatePlayerCount, this);
        glGame.emitter.on("gl_levelRoom", this.updatePlayerCount, this);
    },

    unRegisterEvent() {
        glGame.emitter.off(lttConst.globalEvent.onMidEnter, this);
        glGame.emitter.off(lttConst.globalEvent.onProcess, this);
        glGame.emitter.off(lttConst.globalEvent.betError, this);
        glGame.emitter.off("showOtherBetAni", this);
        glGame.emitter.off(lttConst.globalEvent.onEnterRoom, this);
        glGame.emitter.off(lttConst.globalEvent.updateLbl, this);
        glGame.emitter.off("showZoushibtn", this);
        glGame.emitter.off("gl_enterRoom", this);
        glGame.emitter.off("gl_levelRoom", this);
    },

    showZoushibtn(bool) {
        this.zoushiBtn.active = bool;
    },

    onEnterRoom() {
        this.lab_rooinfo.string = `幸运大转盘 - ${lttConst.roomType[this.lttData.get("roomType")]} - ${this.lttData.get("roomid")}`;
        this.updatePlayerCount();
    },

    updatePlayerCount() {
        this.lab_peopleCount.string = this.lttData.get("playersCount");
    },

    registerGameEvent() {
        glGame.emitter.on('EnterBackground', this.enterBackground, this);
        glGame.emitter.on('EnterForeground', this.enterForeground, this);
    },

    syncProcess() {
        this.updateLabel();
        let process = this.lttData.get("process");
        if (!process || process == null) return;
        glGame.panel.closeLoading();
        this.lttData.showGoldLess();
        this.lttData.showWatchingBattle();

        this.brokenlineTip();
        this.brokenlineSettle();
        this.brokenlineMyscore();
        this.brokenlineMyGoldLabel();
    },

    hideAllScore() {
        this.sp_myWin.node.active = false;
        this.lab_myScore.node.active = false;
        this.lab_myScore.node.position = cc.v2(-47.4, 0);
    },

    onProcess() {
        let process = this.lttData.get("process");
        if (process == lttConst.process.chooseChip) {
            this.hideAllScore();
            if (cc.director.getScene().getChildByName("lttSettlePanel")) {
                glGame.panel.closePanel(this.settlePanel);
            };
            this.playAnim();
        } else if (process == lttConst.process.settleEffect) {
            this.playAnim();
            this.showSettle();
            let score = this.lttData.getFloat(this.lttData.get("myResultGold"));
            cc.log("分数数据", score)
            if (Number(score) != 0) {
                let dty = cc.delayTime(10);
                let cb = cc.callFunc(() => {
                    this.myScoreFly(score);
                })
                this.node.runAction(cc.sequence(dty, cb));
            }
        }
    },

    myScoreFly(score) {
        this.lab_myScore.string = Number(score) > 0 ? "+" + score : score;
        this.lab_myScore.font = Number(score) > 0 ? this.ft_win : this.ft_lose;
        this.lab_myScore.node.active = true;
        this.lab_myScore.node.runAction(cc.moveTo(0.3, cc.v2(-47.4, 75)));
        if(Number(score) > 0){
            this.sp_myWin.node.active = true;
            this.sp_myWin.setAnimation(0,'animation',true);
        }
    },

    updatePeopleCount() {
        let playerList = this.lttData.get("playersList");
        this.lab_peopleCount.string = `(${playerList.length})`;
    },

    updateSelfInfo() {
        this.idLbel.string = glGame.user.isTourist() ? "游客" : glGame.user.get("nickname");
        if (glGame.user.isTourist()) return
        glGame.panel.showHeadImage(this.headImg, glGame.user.get("headURL"));
    },

    updateLabel() {
        this.updateBetLabel();
        this.updateZhanji();
    },

    updateBetLabel() {
        this.totalBetLbl.string = this.lttData.getFloat(this.lttData.get("otherBetCount").add(this.lttData.get("selfBetCount")));
        this.selfBetLbl.string = this.lttData.getFloat(this.lttData.get("selfBetCount"));
        this.goldLbel.string = glGame.user.GoldTemp(this.lttData.get("mytempGold"));
    },

    updateZhanji() {
        let process = this.lttData.get("process");
        let curwaitTime = this.lttData.getMidCurTime();
        if (curwaitTime >= 700 && process == lttConst.process.settleEffect) {
            let userTotalSettle = this.lttData.get("userTotalSettle");
            let myResultGold = this.lttData.get("myResultGold");
            this.recordLbel.node.color = this.lttData.getFloat(userTotalSettle - myResultGold) > 0 ? cc.Color.GREEN : cc.Color.RED;
            this.recordLbel.string = `${this.lttData.getFloat(userTotalSettle - myResultGold) > 0 ? "+" : ""}${this.lttData.getFloat(userTotalSettle - myResultGold)}`;
        } else {
            let userTotalSettle = this.lttData.get("userTotalSettle");
            this.recordLbel.node.color = this.lttData.getFloat(userTotalSettle) > 0 ? cc.Color.GREEN : cc.Color.RED;
            this.recordLbel.string = `${this.lttData.getFloat(userTotalSettle) > 0 ? "+" : ""}${this.lttData.getFloat(userTotalSettle)}`;
        }
    },

    showSettle() {
        let myResultGold = this.lttData.get("myResultGold")
        if (Number(myResultGold) != 0 && myResultGold) {
            let curwaitTime = this.lttData.getMidCurTime();
            if (curwaitTime >= 700) {
                curwaitTime -= 700;
            }
            let dty = cc.delayTime(curwaitTime / 1000);
            let cb = cc.callFunc(() => {
                this.goldLbel.string = glGame.user.GoldTemp(this.lttData.get("myGold"));
                this.recordLbel.node.color = this.lttData.get("userTotalSettle") > 0 ? cc.Color.GREEN : cc.Color.RED;
                this.recordLbel.string = `${this.lttData.get("userTotalSettle") > 0 ? "+" : ""}${this.lttData.getFloat(this.lttData.get("userTotalSettle"))}`;
                glGame.panel.showPanel(this.settlePanel);
                if (Number(myResultGold) > 0) {
                    this.audioMgr.playEffect("win");
                } else {
                    this.audioMgr.playEffect("lose");
                }
            })
            this.node.runAction(cc.sequence(dty, cb));
        }
    },

    betError(msg) {
        this.playAnim(true, msg);
    },

    showPlayerList() {
        let panel = glGame.panel.showPanel(this.playerList);
        panel.zIndex = 21;
    },

    onClick(ButtonName, ButtonNode) {
        switch (ButtonName) {
            case "backBtn":
                this.exitRoom_cb();
                break;
            case "helpBtn":
                glGame.panel.showNewGameRule(this.lttData.get("gameId"));
                this.menu.active = false;
                this.btn_mune.active = true;
                break;
            case "setBtn":
                glGame.panel.showSetting();
                this.menu.active = false;
                this.btn_mune.active = true;
                break;
            case "trendBtn":
                glGame.panel.showNewGameRecord(glGame.scenetag.LUCKTURNTABLE);
                this.menu.active = false;
                this.btn_mune.active = true;
                break;
            case "hideBtn":
                this.hideBtnCB(ButtonNode);
                break;
            case "listBtn":
                this.showPlayerList();
                break;
            case "menuBtn":
                this.btn_mune.active = false;
                this.menu.active = true;
                break;
            case "close":
                this.menu.active = false;
                this.btn_mune.active = true;
                break;
            case "btn_zoushiOpen":
                glGame.emitter.emit("recordOpen");
                break;
        }
    },
    exitRoom_cb() {
        if (this.lttData.get('selfBetCount') == 0) {
            glGame.room.exitRoom();
        } else {
            glGame.panel.showExitRoomPanel('hundred', 99);
        }
    },

    playAnim(isErr, errMsg) {
        let process = this.lttData.get("process");
        this.aniNode.getChildByName("skeleton").active = false;
        let errTip = this.aniNode.getChildByName("errTip")
        if (isErr) {
            errTip.active = true;
            errTip.getChildByName("label").getComponent(cc.Label).string = errMsg;
            let dty = cc.delayTime(2);
            let cb = cc.callFunc(() => {
                errTip.active = false;
            })
            this.aniNode.runAction(cc.sequence(dty, cb));
        } else {
            let str = process == lttConst.process.chooseChip && 'ksxz' ||
                process == lttConst.process.settleEffect && 'xzjs';

            this.aniNode.getChildByName("skeleton").active = true;
            this.aniNode.getChildByName("skeleton").getComponent(sp.Skeleton).skeletonData = this.sp_tip;
            this.aniNode.getChildByName("skeleton").getComponent(sp.Skeleton).setAnimation(0, str, false);
            cc.log("播放特效", str)
            this.audioMgr.playEffect(str);
        }
    },

    showOtherBetAni() {
        this.otherPlayer.stopAllActions();
        let scaleTo = cc.scaleTo(0.2, 1.2);
        let scaleTo1 = cc.scaleTo(0.2, 1);
        this.otherPlayer.runAction(cc.sequence(scaleTo, scaleTo1));
    },

    hideBtnCB(toggle) {
        cc.log("点击到显示筹码")
        let ischeck = toggle.getComponent(cc.Toggle).isChecked;
        toggle.getChildByName("bg").active = !ischeck;
        this.lttData.changeChipViewType(ischeck);
    },

    addChildPanel(prefab, zIndex) {
        let newNode = cc.instantiate(prefab);
        this.node.addChild(newNode, zIndex);
        return newNode;
    },

    enterBackground() {
        this.node.stopAllActions();
        this.unRegisterEvent();
        this.audioMgr.stopAllAudio();
        let animNode = this.node.getChildByName('betTipAnim');
        if (cc.director.getScene().getChildByName("lttSettlePanel")) {
            glGame.panel.closePanel(this.settlePanel);
        };
        if (animNode) animNode.destroy();
        this.hideAllScore();
    },

    enterForeground() {
        this.registerEvent();
        this.updateBetLabel();
        this.audioMgr.playBGM();
        this.showZoushibtn();
        this.brokenlineTip();
        this.brokenlineSettle();
        this.brokenlineMyscore();
        this.brokenlineMyGoldLabel();
    },
    // update (dt) {},

    //断线重连的结算表现
    brokenlineSettle() {
        let process = this.lttData.get("process");
        if (process == lttConst.process.settleEffect) {
            this.showSettle();
        }
    },

    //断线重连阶段提示特效表现
    brokenlineTip() {
        let curwaitTime = this.lttData.getMidCurTime();
        let process = this.lttData.get("process");
        if (process == lttConst.process.chooseChip) {
            if (curwaitTime > 15000) {
                this.playAnim();
            }
        } else if (process == lttConst.process.settleEffect) {
            if (curwaitTime >= 10000) {
                this.playAnim();
            }
        }
    },

    //断线重连我的分数的表现
    brokenlineMyscore() {
        let score = this.lttData.getFloat(this.lttData.get("myResultGold"));
        if (Number(score) == 0) return
        let curwaitTime = this.lttData.getMidCurTime();
        let process = this.lttData.get("process");
        if (process == lttConst.process.settleEffect) {
            if (curwaitTime >= 1000) {
                curwaitTime = (curwaitTime - 1000) / 1000;
                let dty = cc.delayTime(curwaitTime);
                let cb = cc.callFunc(() => {
                    this.myScoreFly(score)
                })
                this.node.runAction(cc.sequence(dty, cb));
            }
        }
    },

    //断线重连我的金币渲染
    brokenlineMyGoldLabel() {
        let curwaitTime = this.lttData.getMidCurTime();
        let process = this.lttData.get("process");
        if (process == lttConst.process.settleEffect) {
            if (curwaitTime >= 700) {
                this.goldLbel.string = glGame.user.GoldTemp(this.lttData.get("mytempGold"));
            } else {
                this.goldLbel.string = glGame.user.GoldTemp(this.lttData.get("myGold"));
            }
        } else {
            this.goldLbel.string = glGame.user.GoldTemp(this.lttData.get("mytempGold"));
        }
    },
    OnDestroy() {
        this.node.stopAllActions();
        this.audioMgr.stopBGM();
        this.unRegisterEvent();
        glGame.emitter.off('EnterBackground', this);
        glGame.emitter.off('EnterForeground', this);
    }
});


glGame.baseclass.extend({

    properties: {
        mainPanel: cc.Node,
        leftList: cc.Node,
        startBtn: cc.Button,
        closeBtn: cc.Button,
        mainTurntable: cc.Node,
        giftList: cc.Node,
        myScore: cc.Label,
        betScore: cc.Label,
        panelOneToggle: cc.Node,
        panelTwoToggle: cc.Node,
        recordItemList: cc.Node,
        noticeItemList: cc.Node,
        notMyRecord: cc.Node,
        turnTableBg: cc.Sprite,
        turnTableTitle: cc.Sprite,
        titleSprite: [cc.SpriteFrame],
        turnTableBgSprite: [cc.SpriteFrame],
        endTipNode: cc.Node,
        endTipLabel: cc.Label,
        giftSpriteFrame: [cc.SpriteFrame],

        fitLayer: cc.Node,
        lightNode: cc.Node,


        prefabNoticeItem: cc.Prefab,
        prefabRecordItem: cc.Prefab,
        prefabHelp: cc.Prefab,
        topRecordTitle: cc.Node,
        myPersonRecordTitle: cc.Node,

        drawAudio: {
            type: cc.AudioClip,
            default: null
        },
        flashNode: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initData();
        this.fitFunc();
        this.initMyScoreInfo();
        this.initNoticePanel();
        this.registerEvent();

        this.reqData();
    },

    fitFunc() {
        let designRate = 720 / 1280;
        let winSize = cc.view.getVisibleSize();
        let curRate = winSize.height / winSize.width;
        let scaleRate = curRate < designRate ? winSize.height / 720 : winSize.width / 1280;
        this.fitLayer.setScale(scaleRate);
    },

    initData() {
        // this.resultInterval = null;
        this.intervalFunc = null;
        this.intervalNotice = null;
        this.index = 0;
        this.noticeIndex = 0;
        this.type = 1;
        this.myDialRecord = [];
        this.giftDatas = [];
    },

    refLeftList() {
        let datas = this.giftDatas;
        let btns = this.leftList.children;
        for (let i = 0; i < btns.length; i++) {
            btns[i].getChildByName('integralTip').getComponent(cc.Label).string = `(${this.getFloat(datas[i].consume_integral)}积分)`;
        }
    },

    reqData() {
        //请求各项数据
        glGame.user.reqDialPrize();
        glGame.user.reqDialIntegral();
        glGame.user.reqDialHorseLantern();
        glGame.user.reqDialTopPrizeLog();
    },

    registerEvent() {
        glGame.emitter.on("updateDialPrizeList", this.initTable, this);
        glGame.emitter.on("updateDialScore", this.refMyScoreInfo, this);
        glGame.emitter.on("updateTopPrize", this.startShowRecord, this);
        glGame.emitter.on("updateMyRecord", this.startShowRecord, this);
        glGame.emitter.on("getDialResult", this.runTurntable, this);
        glGame.emitter.on("drawEnd", this.drawEnd, this);
    },

    unregisterEvent() {
        glGame.emitter.off("updateDialPrizeList", this);
        glGame.emitter.off("updateDialScore", this);
        glGame.emitter.off("updateTopPrize", this);
        glGame.emitter.off("updateMyRecord", this);
        glGame.emitter.off("getDialResult", this);
        glGame.emitter.off("drawEnd", this);
    },

    onClick(name, node) {
        if (glGame.user.isTourist()) {
            if (name == 'start') {
                glGame.panel.showRegisteredGift(true);
                return;
            }
        }
        switch (name) {
            case 'silver':
                if (!this.startBtn.interactable) return;
                this.type = 1;
                this.refTable(name);
                break;
            case 'gold':
                if (!this.startBtn.interactable) return;
                this.type = 2;
                this.refTable(name);
                break;
            case 'diamond':
                if (!this.startBtn.interactable) return;
                this.type = 3;
                this.refTable(name);
                break;
            case 'close':
                this.remove();
                break;
            case 'start':
                if (glGame.user.dialScore == 0) return glGame.panel.showErrorTip("夺宝积分不足");
                glGame.user.reqDial(this.type);
                glGame.user.reqDialIntegral();
                break;
            case 'help':
                this.openHelp();
                break;
            case "panel1":
                this.topRecordTitle.active = true;
                this.myPersonRecordTitle.active = false;
                this.notMyRecord.active = false;
                this.clearItemList();
                this.startShowRecord();
                break;
            case "panel2":
                this.topRecordTitle.active = false;
                this.myPersonRecordTitle.active = true;
                this.clearTopPrizeTimeout();
                this.clearItemList();
                glGame.user.reqDialPersonal();
                break;
            case "congratuleBtn":
                this.clickCongratuleCB();
                break;
            default:
                console.error('luckDrawPanel->onClick', name);
                break;
        }
    },

    //转盘界面=====================================================================
    initTable() {
        this.giftDatas = glGame.user.dialPrizeList;
        this.openTable();
        this.refLeftList();
        this.type = 1;
        this.refTable('silver');
    },

    refTable(name) {
        let buttons = this.leftList.children;
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].name == name) {
                buttons[i].getChildByName("mask").active = false;
                this.resetTurntableRotation();
                this.refreshTurntable(this.type - 1);
                this.initGiftList(this.type - 1);
                continue;
            }
            buttons[i].getChildByName("mask").active = true;
        }
    },

    refreshTurntable(id) {
        this.turnTableTitle.spriteFrame = this.titleSprite[id];
        this.turnTableBg.spriteFrame = this.turnTableBgSprite[id];
    },

    initGiftList(id) {
        let giftData = this.giftDatas[id].item;
        console.log("奖品列表数据", giftData)
        let giftNodes = this.giftList.children;
        for (let i = 0; i < giftNodes.length; i++) {
            if (!giftData[i]) continue;
            // if (giftData[i].award >= 10000) {
            //     giftNodes[i].getChildByName('prize').getComponent(cc.Label).fontSize = 24;
            // } else {
            //     giftNodes[i].getChildByName('prize').getComponent(cc.Label).fontSize = 28;
            // }
            giftNodes[i].getComponent(cc.Sprite).spriteFrame = this.getGiftIcon(this.getFloat(giftData[i].award));
            giftNodes[i].getChildByName('prize').getComponent(cc.Label).string = this.getFloat(giftData[i].award);
        }
    },

    getGiftIcon(award) {
        if (award > 1000) {
            return this.giftSpriteFrame[3];
        } else if (award > 100) {
            return this.giftSpriteFrame[2];
        } else if (award > 10) {
            return this.giftSpriteFrame[1];
        } else {
            return this.giftSpriteFrame[0];
        }
    },

    openTable() {
        this.giftList.active = true;
    },

    runTurntable() {
        this.startBtn.interactable = false;
        this.closeBtn.interactable = false;
        this.panelOneToggle.getComponent(cc.Toggle).interactable = false;
        this.panelTwoToggle.getComponent(cc.Toggle).interactable = false;
        this.giftIndex = this.getGiftIndex();
        if (!this.giftIndex) return;
        this.refMyScoreInfo();
        this.resetTurntableRotation();
        glGame.audio.playSoundEffect(this.drawAudio);
        this.flashNode.active = true;
        let clipArr = this.flashNode.getComponent(cc.Animation).getClips();
        console.log("clips", clipArr)
        this.flashNode.getComponent(cc.Animation).play(clipArr[this.type - 1]._name);
        let rotateAngle = 360 * 6 + (10 - (this.giftIndex)) * 36;
        let isMyRecord = false;
        this.isDraw = true;
        let action = cc.sequence(cc.rotateBy(6, rotateAngle), cc.callFunc(() => {
            if (!this.panelOneToggle.getComponent(cc.Toggle).isChecked) {
                this.clearTopPrizeTimeout();
                // this.clearItemList();
                isMyRecord = true;
            }
            this.lightNode.active = true;
            this.lightNode.runAction(cc.sequence(cc.blink(1.0, 4), cc.callFunc(() => {
                this.lightNode.opacity = 255;
            })))
        }), cc.delayTime(0.3), cc.callFunc(() => {
            glGame.emitter.emit("drawEnd", isMyRecord)
        }))
        this.mainTurntable.runAction(action.easing(cc.easeOut(6.0)));
    },

    drawEnd(isMyRecord) {
        if (isMyRecord) {
            glGame.user.reqDialPersonal();
        }
        this.refDialResultPic();
        this.addMyNoticeItem();
        this.myScore.string = this.getFloat(glGame.user.dialScore);
        this.showEndTip();
    },

    showEndTip() {
        this.isDraw = false;
        this.endTipNode.active = true;
        glGame.user.reqMyInfo();
        let giftDatas = this.giftDatas[this.type - 1].item;
        let resultData = giftDatas[this.getGiftIndex()];
        this.endTipLabel.string = `${this.getFloat(resultData.award)}金币`;
    },

    clickCongratuleCB() {
        glGame.user.reqUnread();
        this.lightNode.active = false;
        this.startBtn.interactable = true;
        this.closeBtn.interactable = true;
        this.panelOneToggle.getComponent(cc.Toggle).interactable = true;
        this.panelTwoToggle.getComponent(cc.Toggle).interactable = true;
        this.endTipNode.active = false;
        this.giftIndex = null;
        this.flashNode.active = false;
    },

    getGiftIndex() {
        let gifts = this.giftDatas[this.type - 1].item;
        for (let index in gifts) {
            if (gifts[index].id == glGame.user.myDialResult.item_id) {
                return index;
            }
        }
    },

    refDialResultPic() {
        let giftDatas = this.giftDatas[this.type - 1].item;
        let awardPic = this.startBtn.node.getChildByName('awardPic');
        awardPic.getComponent(cc.Sprite).spriteFrame = this.getGiftIcon(this.getFloat(giftDatas[this.getGiftIndex()].award));
        awardPic.active = true;
        let awardLab = this.startBtn.node.getChildByName('awardLab');
        awardLab.getComponent(cc.Label).string = this.getFloat(giftDatas[this.getGiftIndex()].award);
        awardLab.active = true;
        this.giftList.children[this.getGiftIndex()].active = false;
    },

    resetTurntableRotation() {
        let giftNodes = this.giftList.children;
        for (let i = 0; i < giftNodes.length; i++) {
            giftNodes[i].active = true;
        }
        this.startBtn.node.getChildByName('awardPic').active = false;
        this.startBtn.node.getChildByName('awardLab').active = false;
        this.lightNode.active = false;
        this.mainTurntable.angle = 0;
    },
    //============================================================================

    //记录界面====================================================================
    initNoticePanel() {
        this.startShowNotice();
    },

    startShowRecord() {
        this.clearTopPrizeTimeout()
        if (this.panelOneToggle.getComponent(cc.Toggle).isChecked) {
            let topRecordData = glGame.user.dialTopPrize;
            if (!topRecordData || topRecordData.length == 0) {
                glGame.user.reqDialTopPrizeLog();
                return;
            }
            this.refItemList();
        } else {
            //调用界面二的函数
            this.clearItemList();
            this.addMyRecordItem();
        }
    },

    clearTopPrizeTimeout() {
        clearTimeout(this.intervalFunc)
        this.intervalFunc = null;
    },

    startShowNotice() {
        this.clearIntervalTimeout();
        this.refNoticeList();
    },

    clearIntervalTimeout() {
        clearTimeout(this.intervalNotice);
        this.intervalNotice = null;
    },

    refItemList() {
        if (this.startBtn.interactable) {
            this.clearItemList();
            this.addRecordItem();
        }
        this.intervalFunc = setTimeout(() => {
            console.log("bbbbbbbbbbbbbb", this.startBtn.interactable)
            if (this.startBtn.interactable) {
                console.log("aaaaaaaaaaaaaaaaaaaa")
                glGame.user.reqDialTopPrizeLog();
            } else {
                this.startShowRecord();
            }
        }, 5000)
    },

    refNoticeList() {
        this.intervalTime = Math.floor(Math.random() * 4000) + 1000;
        if (this.noticeItemList.childrenCount == 0) this.intervalTime = 0;
        let datalength = 0;
        if (glGame.user.dialHorseData) {
            datalength = glGame.user.dialHorseData.length - 1;
        }
        this.intervalNotice = setInterval(() => {
            if (this.noticeIndex > datalength) {
                if (this.noticeIndex != 0 && !this.isDraw) {
                    glGame.user.reqDialHorseLantern();
                }
                this.noticeIndex = 0;
            } else {
                if (glGame.user.dialHorseData[this.noticeIndex]) {
                    if (glGame.user.dialHorseData[this.noticeIndex].uid != glGame.user.get("userID")) {
                        this.addNoticeItem();
                    }
                    this.noticeIndex++;
                }
            }
            this.startShowNotice();
        }, this.intervalTime)
    },

    addRecordItem() {

        console.log("isRun addRecordItem")
        // let recordNum = this.recordItemList.childrenCount;
        // if (recordNum>=12) {
        //     this.recordItemList.children[0].removeFromParent();
        // }

        let data = glGame.user.dialTopPrize;
        for (let i = 0; i < data.length; i++) {
            let curItem = cc.instantiate(this.prefabRecordItem)
            let curNode = curItem.getChildByName('topRecord')
            curItem.getChildByName("background").active = i % 2 == 0;
            curNode.active = true;
            curNode.getChildByName("timeLabel").getComponent(cc.Label).string = data[i].create_time;
            curNode.getChildByName("nicknameLabel").getComponent(cc.Label).string = data[i].nickname;
            curNode.getChildByName('rewardLayout').getChildByName("rewardLabel").getComponent(cc.Label).string = this.getFloat(data[i].prize) + '元';
            curNode.getChildByName("tableType").getComponent(cc.Label).string = data[i].dial_type;
            curItem.parent = this.recordItemList;
        }
    },

    addMyNoticeItem() {
        let recordNum = this.noticeItemList.childrenCount;
        if (recordNum >= 4) {
            this.noticeItemList.children[0].removeFromParent();
        }
        let giftDatas = this.giftDatas[this.type - 1].item;
        let data = giftDatas[this.getGiftIndex()];
        let tableType = ['白银转盘', '黄金转盘', '钻石转盘'];
        let curItem = cc.instantiate(this.prefabNoticeItem)
        // let itemStr = `恭喜[${glGame.user.get("logicID")}]在${tableType[data.dial_type_id-1]}中获得`;
        let itemStr = `]在${tableType[data.dial_type_id - 1]}中获得`;
        curItem.getChildByName("content").getChildByName("otherLabel1").getComponent(cc.Label).string = glGame.user.get("nickname");
        curItem.getChildByName("content").getChildByName("otherLabel2").getComponent(cc.Label).string = itemStr;
        curItem.getChildByName("giftLabel").getComponent(cc.Label).string = this.getFloat(data.award) + "元";
        curItem.parent = this.noticeItemList;
    },

    addNoticeItem() {
        let recordNum = this.noticeItemList.childrenCount;
        if (recordNum >= 4) {
            this.noticeItemList.children[0].removeFromParent();
        }
        let data = glGame.user.dialHorseData[this.noticeIndex];
        let curItem = cc.instantiate(this.prefabNoticeItem)
        // let itemStr = `恭喜[${data.logicid}]在${data.dial_type}中获得`;
        let itemStr = `]在${data.dial_type}中获得`;
        curItem.getChildByName("content").getChildByName("otherLabel1").getComponent(cc.Label).string = data.nickname;
        curItem.getChildByName("content").getChildByName("otherLabel2").getComponent(cc.Label).string = itemStr;
        curItem.getChildByName("giftLabel").getComponent(cc.Label).string = this.getFloat(data.prize) + "元";
        curItem.parent = this.noticeItemList;
    },

    addMyRecordItem() {
        this.myDialRecord = glGame.user.myDialRecord; //[{create_time: "12/01 11:00", dial_type:"白银夺宝", prize: 10000}]
        this.notMyRecord.active = this.myDialRecord.length == 0;
        for (let i = 0; i < this.myDialRecord.length; i++) {
            let curItem = cc.instantiate(this.prefabRecordItem)
            let curNode = curItem.getChildByName('myRecord')
            curItem.getChildByName("background").active = i % 2 == 0;
            curNode.active = true;
            curNode.getChildByName("timeLabel").getComponent(cc.Label).string = this.myDialRecord[i].create_time;
            curNode.getChildByName("tableType").getComponent(cc.Label).string = this.myDialRecord[i].dial_type;
            curNode.getChildByName('rewardLayout').getChildByName("rewardLabel").getComponent(cc.Label).string = this.getFloat(this.myDialRecord[i].prize) + '元';
            curItem.parent = this.recordItemList;
        }
    },

    clearItemList() {
        console.log("isRun clearitemList")
        this.recordItemList.removeAllChildren();
    },

    //=====================================================================================

    initMyScoreInfo() {
        this.myScore.node.active = false;
        this.betScore.node.active = false;
    },

    refMyScoreInfo() {
        this.myScore.node.active = true;
        this.betScore.node.active = true;
        this.myScore.string = this.getFloat(glGame.user.dialScore);
        this.betScore.string = this.getFloat(glGame.user.betDialScore);
    },

    openHelp() {
        let helpNode = cc.instantiate(this.prefabHelp);
        helpNode.parent = this.node;
    },

    getFloat(value) {
        return (Number(value).div(100)).toString();
    },

    OnDestroy() {
        // clearTimeout(this.resultInterval);
        // this.resultInterval = null;
        this.clearTopPrizeTimeout();
        this.clearIntervalTimeout();
        this.unregisterEvent();
    },

    // start () {},

    // update (dt) {},
});

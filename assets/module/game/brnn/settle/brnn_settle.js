let CONFIGS = require("brnn_const");

glGame.baseclass.extend({
    properties: {
        audio_win: {
            type: cc.AudioClip,
            default: null
        },
        audio_lose: {
            type: cc.AudioClip,
            default: null
        },
        node_myResult: cc.Node,
        node_mySettleGold: cc.Node,
        lab_myid: cc.Label,
        myHead: cc.Sprite,

        sp_win: sp.SkeletonData,
        sp_lose: sp.SkeletonData,
        prefabWin_sp: cc.Prefab,
        prefabLose_sp: cc.Prefab,

        node_runa: cc.Node,
        nodeThreeTop: [cc.Node],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.curLogic = require("brnnlogic").getInstance();
        this.regisrterEvent();
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);    //切换后台
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onMidEnter, this.onMidEnter, this);
        this.spNode = null;
        this.mySettleGold = null;
        this.dealerSettleGold = null;
        this._myUid = null;
        this._dealerid = null;
        this.tempNode = new cc.Node();
        this._settleMsg = null;
    },
    start() {
        this.node.active = false;
    },
    /*同步数据 @dealerUid @dealerSettleGold
    *        @myAreaSettleInfo{1：`-1`,2:``,3:``,4:``}
    *       @resultDict  //{areaIndex:{cardIdList:null,resultType:null}}
    */
    //更新自己的输赢状态
    updateInfo(msg) {
        //算出自己的输赢
        this._myUid = this.curLogic.get("myUid");
        let dealeruid = this.curLogic.get("dealerUid");
        let url = this.curLogic.get("MyheadURL");
        if (!glGame.user.isTourist()) {
            glGame.panel.showHeadImage(this.myHead.node, url);
        }
        this.mySettleGold = msg.mySettleGold;
        this.dealerSettleGold = msg.dealerSettleGold;
        this.myWinningCoin = msg.myWinningCoin;
        this.dealerWinningCoin = msg.dealerWinningCoin;
        if (msg.topThree) {
            let topThree = msg.topThree
            let arr = this.sortTopThreeData(topThree);
            cc.log("3renbang", arr, topThree)
            for (let index = 0; index < arr.length; index++) {
                this.nodeThreeTop[index].getChildByName("id").getComponent(cc.Label).string = arr[index].nickname;
                this.nodeThreeTop[index].getChildByName("result").getComponent(cc.Label).string = this.curLogic.getNumber(arr[index].winningCoin);
                this._setFont(this.nodeThreeTop[index].getChildByName("result"), arr[index].winningCoin);
            }
        }
        this.lab_myid.string = this.curLogic.get("myNickName");
        this.node_myResult.getComponent(cc.Label).string = this.curLogic.getNumber(this._myUid == dealeruid ? this.dealerWinningCoin : this.myWinningCoin);
        this.node_mySettleGold.getComponent(cc.Label).string = this.curLogic.getNumber(this.mySettleGold);
        this._setFont(this.node_myResult, this._myUid == dealeruid ? this.dealerWinningCoin : this.myWinningCoin);
        this._setFont(this.node_mySettleGold, this.mySettleGold);
    },

    sortTopThreeData(rankDatas) {
        let sortArr = [];
        for (let key in rankDatas) {
            sortArr.push(rankDatas[key])
        }
        sortArr.sort(function (a, b) {
            return b.winningCoin - a.winningCoin;
        });
        return sortArr;
    },

    // 重写父类按钮点击事件
    onClick(name, node) {
        switch (name) {
            case "mask": this.settle_close(); break;
            default: console.error("no find button name -> %s", name);
        }
    },

    settle_close() {
        this.node.active = false;
        for (let i = 0; i < this.node_runa.childrenCount; i++) {
            this.node_runa.children[i].active = false;
        }
        if (this.spNode) {
            this.spNode.destroy();
        }
    },

    //设置字体
    _setFont(node, score) {
        if (parseFloat(score) > 0) {
            node.getComponent(cc.Label).string = "+" + node.getComponent(cc.Label).string;
            node.color = cc.color(0, 255, 0)
        } else {
            node.color = cc.color(255, 30, 16)
        }
    },
    //设置结算界面
    _setSettlePic(score, time) {
        if (parseFloat(score) > 0) {
            this.spNode = cc.instantiate(this.prefabWin_sp);
            this.spNode.parent = this.node.getChildByName("spPraent");
            this.spNode.getComponent(sp.Skeleton).setAnimation(0, "yql", false);
            if (time == 0) {
                this.spNode.getComponent(sp.Skeleton).addAnimation(0, "yql", false, -4);
            }
            this.runac(time);
        } else {
            this.spNode = cc.instantiate(this.prefabLose_sp);
            this.spNode.parent = this.node.getChildByName("spPraent");
            this.spNode.getComponent(sp.Skeleton).setAnimation(0, "jxnl", false);
            if (time == 0) {
                this.spNode.getComponent(sp.Skeleton).addAnimation(0, "jxnl", false, -4);
            }
            this.runac(time);
        }
    },
    runac(time) {
        let dty = time == 0 ? 0 : 0.1;
        let aniList = [];
        for (let i = 0; i < this.node_runa.childrenCount; i++) {
            aniList.push(
                cc.delayTime(dty),
                cc.callFunc(() => {
                    this.node_runa.children[i].active = true;
                }),   //翻牌
            )
            this.node.runAction(cc.sequence(aniList));
        }
    },
    //播放音效
    playerAudio() {
        let money;
        if (this._myUid != this._dealerid) {
            money = this.mySettleGold;
        } else {
            money = this.dealerSettleGold;
        }
        if (money >= 0) {
            glGame.audio.playSoundEffect(this.audio_win);
        } else {
            glGame.audio.playSoundEffect(this.audio_lose);
        }
    },
    //显示结算
    settle() {
        this._myUid = this.curLogic.get("myUid");
        this._dealerid = this.curLogic.get("dealerUid");
        let msg = this.curLogic.get("t_onSettle");
        if (msg) {
            if (Object.keys(msg.myAreaSettleInfo).length == 0
                && this._myUid != this._dealerid) {
                return;
            }
        }
        let curWaitTime = this.curLogic.getMidEnterWaitTime();
        let DTY, DTY1;        //结算界面显示等待的时间
        DTY1 = 3;
        if (curWaitTime - 700 >= 0) {
            DTY = (curWaitTime - 700) / 1000;
        } else {
            DTY = 0;
        }
        let delayTime = cc.delayTime(DTY);
        let callFunc = cc.callFunc(() => {
            this.node.active = true;
            this._setSettlePic(this.mySettleGold, DTY);
            this.playerAudio();
        });
        let delayTime1 = cc.delayTime(DTY1);
        let callFunc1 = cc.callFunc(() => {
            this.node.active = false;
            for (let i = 0; i < this.node_runa.childrenCount; i++) {
                this.node_runa.children[i].active = false;
            }
            this.spNode.destroy();
        });
        let seq = cc.sequence(delayTime, callFunc, delayTime1, callFunc1);
        this.tempNode.runAction(seq);
    },
    // update (dt) {},


    /**
   * 网络数据监听
   */
    regisrterEvent() {
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onProcess, this.onProcess, this);            //进度通知       
        glGame.emitter.on(CONFIGS.logicGlobalEvent.settleEffect, this.onsettle, this)
    },
    unregisrterEvent() {
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onProcess, this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.settleEffect, this)
    },
    /*同步数据 @dealerUid @dealerSettleGold
    *        @myAreaSettleInfo{1：`-1`,2:``,3:``,4:``}
    *       @resultDict  //{areaIndex:{cardIdList:null,resultType:null}}
    */
    onsettle() {
        this._settleMsg = this.curLogic.get("t_onSettle");
        this.updateInfo(this._settleMsg);
        this.settle();
    },

    //进度
    onProcess() {
        let msg = this.curLogic.get("t_onProcess");
        this._dealerid = this.curLogic.get("dealerUid");
        if (msg.processType == CONFIGS.process.chooseChip) {
            this.node.active = false;
            this.mySettleGold = 0;
        }
    },
    //中途加入，且自己有下注，显示结算信息
    onMidEnter() {
        let msg = this.curLogic.get("t_onMidEnter");
        this._myUid = this.curLogic.get("myUid");
        this._dealerid = this.curLogic.get("dealerUid");
        //判断自己是否有下注
        let lastSettleInfo = this.curLogic.get("lastSettleInfo");
        let mySettleInfo
        if (lastSettleInfo) {
            mySettleInfo = lastSettleInfo.myAreaSettleInfo;
            if (Object.keys(mySettleInfo).length == 0
                && this._myUid != this._dealerid) return; //自己没有下注return
        } else {
            return;
        }
        if (msg.processType == CONFIGS.process.settleEffect) {
            //中途加入进来，直接显示牌型，
            this._settleMsg = lastSettleInfo;
            this.updateInfo(this._settleMsg);
            this.settle();
        } else if (msg.processType == CONFIGS.process.chooseChip) {
            this.node.active = false;
        }
    },
    OnDestroy() {
        if (this.tempNode) {
            this.tempNode.stopAllActions();
        }
        this.unregisrterEvent();
        glGame.emitter.off("EnterBackground", this);    //切换后台
        glGame.emitter.off("EnterForeground", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onMidEnter, this);
    },
    EnterBackground() {
        if (this.tempNode) {
            this.tempNode.stopAllActions();
        }
        this.unregisrterEvent();
    },
    EnterForeground() {
        this.regisrterEvent();
        let process = this.curLogic.get("t_onProcess");
        if (!process) {
            process = this.curLogic.get("t_onMidEnter");
        }
        if (process.processType == CONFIGS.process.settleEffect) {
            this._settleMsg = this.curLogic.get("t_onSettle");
            this.updateInfo(this._settleMsg);
            this.settle();
        } else if (process.processType == CONFIGS.process.onProcess) {
            this.node.active = false;
        }
    },
});

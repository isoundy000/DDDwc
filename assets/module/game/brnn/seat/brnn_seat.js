let CONFIGS = require("brnn_const");
glGame.baseclass.extend({

    properties: {
        //庄家
        img_Dealerportrait: cc.Node,
        node_DealerName: cc.Node,
        node_DealerGold: cc.Node,
        node_DealerScore: cc.Node,
        node_rounds: cc.Node,
        node_zhanji: cc.Node,

        node_xitongzhuang: cc.Node,    //系统小妹坐庄
        node_info: cc.Node,
        //玩家自己
        img_Myselfportrait: cc.Node,
        node_MyselfName: cc.Node,
        node_MyselfGold: cc.Node,
        node_MyScore: cc.Node,
        node_MyID: cc.Node,
        myzhanji: cc.Node,
        //整个闲家座位
        node_player: cc.Node,
        node_dealer: cc.Node,
        //字体
        font_lost: cc.Font,
        font_win: cc.Font,

        img_defaultHead: cc.SpriteFrame,//默认头像

        node_dealertip: cc.Node,
        node_dealerAni: cc.Node,

        sp_changeDealer: sp.SkeletonData,

        audio_changedealer: {
            type: cc.AudioClip,
            default: null
        },

        headList: [cc.SpriteFrame],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._myGold = null;
        this._dealerGold = null;
        this._userData = null;
        this._mySettleGold = 0;
        this._dealerSettleGold = 0;
        this.isshowMyscore = false;
        this.myscorePos = null;
        this.dealerScorePos = null;
        this.setPos();      //把分数节点位置存着

        this.curLogic = require("brnnlogic").getInstance();
        this.regisrterEvent();
        this.aniEvent();
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);    //切换后台
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onMidEnter, this.midEnter, this);

        this._myUid = this.curLogic.get("myUid");
        this._dealerUid = this.curLogic.get("dealerUid");
        this._dealerLogicId = this.curLogic.get("dealerLogicId");
        this.node_xitongzhuang.active = false;
    },
    start() {
        this.curLogic.set("myPos", this.node_player.position);
        this.curLogic.set("dealerPos", this.node_dealer.position);
    },

    //骨骼动画播放结束的回调
    aniEvent() {
        let Skeleton = this.node_dealer.getChildByName("sp_changeDealer").getComponent(sp.Skeleton);     //骨骼动画的
        Skeleton.setCompleteListener((trackEntry, loopCount) => {
            let name = trackEntry.animation ? trackEntry.animation.name : "";
            if (name == 'ghzj_2') {
                Skeleton.node.active = false;
            }
        })
    },

    //设置自己和庄家的分数位置
    setPos() {
        this.myscorePos = this.node_MyScore.position;
        this.dealerScorePos = this.node_DealerScore.position;
    },

    //更新连庄轮数
    updateRounds() {
        if (this.dealerUid != 0) {
            this.node_rounds.active = true;
            this.node_rounds.getComponent(cc.Label).string = parseInt(8 - this.rounds);
        } else {
            this.node_rounds.active = false;
        }
    },

    changeDealer() {
        glGame.audio.playSoundEffect(this.audio_changedealer);
        this.node_dealer.getChildByName("sp_changeDealer").active = true;
        let spine = this.node_dealer.getChildByName("sp_changeDealer").getComponent(sp.Skeleton)
        spine.skeletonData = this.sp_changeDealer;
        spine.setAnimation(0, "ghzj_2", false);
    },

    //更新我的信息
    _updateInfo() {
        this._myUid = this.curLogic.get("myUid");
        this._dealerLogicId = this.curLogic.get("dealerLogicId");
        this._dealerGold = this.curLogic.get("dealerGold")
        this._dealerUid = this.curLogic.get("dealerUid");
        this._myNickName = this.curLogic.get("myNickName");
        this._dealerNickName = this.curLogic.get("dealerNickName");
        if (this._dealerUid == this._myUid) { //庄家是我
            this.node_info.active = true;
            this.node_xitongzhuang.active = false;
            this.node_zhanji.getComponent(cc.Label).string = this.curLogic.getNumber(this.curLogic.get("dealerTotalSettle"));
            this._setFontZhanji(this.node_zhanji, this.curLogic.get("dealerTotalSettle"));
            this.node_player.active = false;
            this.node_dealertip.active = true;
            this.node_DealerName.getComponent(cc.Label).string = glGame.user.isTourist() ? "游客" : this._dealerNickName;
            this.node_DealerGold.active = true;
            this.node_DealerGold.getComponent(cc.Label).string = glGame.user.GoldTemp(this._dealerGold)
            // //设置头像
            this.img_Dealerportrait.getComponent(cc.Sprite).spriteFrame = this.headList[0];
            let sprite = this.img_Dealerportrait;
            let url = this.curLogic.get("MyheadURL");
            glGame.panel.showHeadImage(sprite, url);
        } else {
            this.node_player.active = true;
            this.node_dealertip.active = false;
            if (this._dealerUid == 0) {     //系统小妹坐庄
                this.node_xitongzhuang.active = true;
                this.node_info.active = false;
                this.img_Dealerportrait.getComponent(cc.Sprite).spriteFrame = this.headList[1];
            } else {//我不是庄家且不是系统庄
                this.node_xitongzhuang.active = false;
                this.node_info.active = true;
                this.node_DealerName.getComponent(cc.Label).string = this._dealerNickName;
                this.node_DealerGold.getComponent(cc.Label).string = glGame.user.GoldTemp(this._dealerGold);
                this.node_zhanji.getComponent(cc.Label).string = this.curLogic.getNumber(this.curLogic.get("dealerTotalSettle"));
                this._setFontZhanji(this.node_zhanji, this.curLogic.get("dealerTotalSettle"));
                this.img_Dealerportrait.getComponent(cc.Sprite).spriteFrame = this.headList[0];
                let sprite = this.img_Dealerportrait;   //庄家的头像
                let url = this.curLogic.get("dealerHeadurl");
                glGame.panel.showHeadImage(sprite, url);
            }
        }
    },
    updateMyinfo() {
        this.node_MyselfGold.getComponent(cc.Label).string = glGame.user.GoldTemp(this.curLogic.get("myGold") - this.curLogic.get("betLeiji"));
        this.node_MyID.getComponent(cc.Label).string = glGame.user.isTourist() ? "游客" : this.curLogic.get("myNickName");
        this.myzhanji.getComponent(cc.Label).string = this.curLogic.getNumber(this.curLogic.get("userTotalSettle"));
        this._setFontZhanji(this.myzhanji, this.curLogic.get("userTotalSettle"));
        let sprite = this.img_Myselfportrait;   //庄家的头像
        let url = this.curLogic.get("MyheadURL");
        if (!glGame.user.isTourist()) {
            glGame.panel.showHeadImage(sprite, url);
        }
    },
    // //设置字体
    _setFont(node, score) {
        if (score > 0) {
            node.getComponent(cc.Label).string = "+" + node.getComponent(cc.Label).string;
            node.getComponent(cc.Label).font = this.font_win;
        } else {
            node.getComponent(cc.Label).font = this.font_lost;
        }
    },
    _setFontZhanji(node, score) {
        if (score > 0) {
            node.getComponent(cc.Label).string = "+" + node.getComponent(cc.Label).string;
            node.color = cc.color(0, 255, 0)
        } else {
            node.color = cc.color(255, 0, 0)
        }
    },
    //下注后的扣钱啊
    _Bet_moneny() {
        this._myGold = this.curLogic.get("myGold");
        let betleiji = this.curLogic.get("betLeiji")
        this.node_MyselfGold.getComponent(cc.Label).string = glGame.user.GoldTemp(this._myGold - betleiji);
    },

    stopAllAc() {
        this.node_DealerScore.stopAllActions();
        this.node_MyScore.stopAllActions();
    },
    //显示庄家分数动画
    showDealerScore() {
        if (parseInt(this._dealerSettleGold) == 0) return
        let string = this.curLogic.getNumber(this._dealerSettleGold);
        this.node_DealerScore.getComponent(cc.Label).string = string;
        this._setFont(this.node_DealerScore, this._dealerSettleGold);
        this.node_DealerScore.active = true;
        let moveH = cc.moveBy(0.5, cc.v2(0, 40))
        let cb = cc.callFunc(() => {
            let gold = this.curLogic.get("dealerGold");
            gold = Number(gold).add(Number(this._dealerSettleGold));
            this.node_DealerGold.getComponent(cc.Label).string = glGame.user.GoldTemp(gold);
            this.node_zhanji.getComponent(cc.Label).string = this.curLogic.getNumber(this.curLogic.get("dealerTotalSettle"))
            this._setFontZhanji(this.node_zhanji, this.curLogic.get("dealerTotalSettle"));
        })
        this.node_DealerScore.runAction(cc.sequence(moveH, cb));
    },
    //显示我的分数动画
    showMyScore() {
        if (this._mySettleGold == 0) return;
        this.node_MyScore.getComponent(cc.Label).string = this.curLogic.getNumber(this._mySettleGold)
        this._setFont(this.node_MyScore, this._mySettleGold);
        this.node_MyScore.active = true;
        let moveH = cc.moveBy(0.5, cc.v2(0, 80));
        let cb = cc.callFunc(() => {
            let gold = this.curLogic.get("myGold");
            gold = Number(gold).add(Number(this._mySettleGold));
            this.node_MyselfGold.getComponent(cc.Label).string = glGame.user.GoldTemp(gold);
            this.myzhanji.getComponent(cc.Label).string = this.curLogic.getNumber(this.curLogic.get("userTotalSettle"));
            this._setFontZhanji(this.myzhanji, this.curLogic.get("userTotalSettle"));
        })
        this.node_MyScore.runAction(cc.sequence(moveH, cb));
    },

    hideScore() {
        this.node_DealerScore.active = false;
        this.node_DealerScore.position = this.dealerScorePos;
        this.node_MyScore.active = false;
        this.node_MyScore.position = this.myscorePos;
    },
    /**
     * 网络数据监听
     */
    regisrterEvent() {
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onMatchdetail, this.onMatchdetail, this);        //比赛开始相关的信息
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onConfirmGrab, this.onConfirmGrab, this);    //确认庄家  
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onProcess, this.onProcess, this);       //进度通知
        glGame.emitter.on(CONFIGS.logicGlobalEvent.settleEffect, this.onSettle, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.OnPlayerOp, this.oprCancelDealer, this); //玩家列表
        glGame.emitter.on("chengeDealer", this.changeDealer, this);
        glGame.emitter.on("bet", this._Bet_moneny, this);
        // glGame.emitter.on(CONFIGS.logicGlobalEvent.updateInfo, this.updateMyinfo, this)
    },
    unregisrterEvent() {
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onMatchdetail, this);        //比赛开始相关的信息
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onConfirmGrab, this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onProcess, this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.settleEffect, this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.OnPlayerOp, this); //玩家列表
        glGame.emitter.off("chengeDealer", this);
        glGame.emitter.off("bet", this);
        // glGame.emitter.off(CONFIGS.logicGlobalEvent.updateInfo, this)
    },
    // update (dt) {},
    //比赛相关信息
    onMatchdetail() {
        let msg = this.curLogic.get("t_onMatchdetail");
        this.dealerUid = msg.dealerUid;
        this.rounds = msg.dealerRounds;
        this.updateRounds();
    },
    //中途加入
    midEnter() {
        //拿到用户金币信息
        let msg = this.curLogic.get("t_onMidEnter");
        this.rounds = msg.dealerRounds;
        this._dealerGold = this.curLogic.get("dealerGold")
        this.updateRounds();
        this._updateInfo();
        this.updateMyinfo();
        this.midUpdateInfo(msg);
    },

    midUpdateInfo(msg) {
        let process = msg.processType;
        let lastSettleInfo = msg.lastSettleInfo;
        let curTime = this.curLogic.getMidEnterWaitTime();
        if (!lastSettleInfo) return
        if (process == CONFIGS.process.settleEffect && curTime - 1000 >= 0) {
            this.node_DealerGold.getComponent(cc.Label).string = glGame.user.GoldTemp(this._dealerGold - lastSettleInfo.dealerSettleGold);
            this.node_zhanji.getComponent(cc.Label).string = this.curLogic.getNumber(msg.dealerTotalSettle - lastSettleInfo.dealerSettleGold);
            this._setFontZhanji(this.node_zhanji, (msg.dealerTotalSettle - lastSettleInfo.dealerSettleGold));
            this.node_MyselfGold.getComponent(cc.Label).string = glGame.user.GoldTemp(this.curLogic.get("myGold") - lastSettleInfo.mySettleGold);
            this.myzhanji.getComponent(cc.Label).string = this.curLogic.getNumber(msg.userTotalSettle - lastSettleInfo.mySettleGold);
            this._setFontZhanji(this.myzhanji, (msg.userTotalSettle - lastSettleInfo.mySettleGold));

            let delayTime = cc.delayTime((curTime - 1000) / 1000);
            let cb = cc.callFunc(() => {
                this.node_DealerGold.getComponent(cc.Label).string = glGame.user.GoldTemp(this._dealerGold);
                this.node_zhanji.getComponent(cc.Label).string = this.curLogic.getNumber(msg.dealerTotalSettle);
                this._setFontZhanji(this.node_zhanji, (msg.dealerTotalSettle));
                this.node_MyselfGold.getComponent(cc.Label).string = glGame.user.GoldTemp(this.curLogic.get("myGold"));
                this.myzhanji.getComponent(cc.Label).string = this.curLogic.getNumber(msg.userTotalSettle);
                this._setFontZhanji(this.myzhanji, (msg.userTotalSettle));
            });
            this.node.runAction(cc.sequence(delayTime, cb));
        }
        else {
            this.node_DealerGold.getComponent(cc.Label).string = glGame.user.GoldTemp(this._dealerGold);
            this.node_zhanji.getComponent(cc.Label).string = this.curLogic.getNumber(msg.dealerTotalSettle);
            this._setFontZhanji(this.node_zhanji, (msg.dealerTotalSettle));
            this.node_MyselfGold.getComponent(cc.Label).string = glGame.user.GoldTemp(this.curLogic.get("myGold"));
            this.myzhanji.getComponent(cc.Label).string = this.curLogic.getNumber(msg.userTotalSettle);
            this._setFontZhanji(this.myzhanji, (msg.userTotalSettle));
        }
    },

    onSettle() {
        let msg = this.curLogic.get("t_onSettle");
        this._dealerSettleGold = msg.dealerSettleGold;
        this._mySettleGold = msg.mySettleGold;
        let DTY = cc.delayTime(7)
        let cb = cc.callFunc(() => {
            this.showDealerScore()
            this.showMyScore()
        });
        this.node.runAction(cc.sequence(DTY, cb));
    },

    //确认庄家
    onConfirmGrab() {
        this._updateInfo();
    },

    //进度
    onProcess() {
        let msg = this.curLogic.get("t_onProcess");
        if (msg.processType == CONFIGS.process.chooseChip) {
            this.hideScore();
        } else if (msg.processType == CONFIGS.process.waitStart) {
        }
    },

    oprCancelDealer(msg) {

    },

    OnDestroy() {
        this.node_DealerScore.stopAllActions();
        this.node_MyScore.stopAllActions();
        this.node.stopAllActions();
        this.unregisrterEvent();
        glGame.emitter.off("EnterBackground", this);    //切换后台
        glGame.emitter.off("EnterForeground", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onMidEnter, this);
    },

    EnterBackground() {
        this.node_DealerScore.stopAllActions();
        this.node_DealerScore.active = false;
        this.node_MyScore.stopAllActions();
        this.node_MyScore.active = false;
        this.node.stopAllActions();
        this.unregisrterEvent();
    },

    EnterForeground() {
        this.regisrterEvent();
        this.hideScore();
        let process = this.curLogic.get("t_onProcess");
        if (!process) {
            process = this.curLogic.get("t_onMidEnter");
        }
        let curTime = this.curLogic.getMidEnterWaitTime();
        if (process.processType == CONFIGS.process.settleEffect && curTime - 1000 >= 0) {
            let delayTime = cc.delayTime((curTime - 1000) / 1000);
            let cb = cc.callFunc(() => {
                this.showDealerScore();
                this.showMyScore();
            });
            this.node.runAction(cc.sequence(delayTime, cb));
        } else if (process.processType == CONFIGS.process.waitStart) {
            this.entUpdateInfo();
        }
    },
    
    entUpdateInfo() {
        let msg = this.curLogic.get("t_onSettle");
        this.node_DealerGold.getComponent(cc.Label).string = glGame.user.GoldTemp(this._dealerGold + msg.dealerSettleGold);
        this.node_zhanji.getComponent(cc.Label).string = this.curLogic.getNumber(this.curLogic.get("dealerTotalSettle"));
        this._setFontZhanji(this.node_zhanji, this.curLogic.get("dealerTotalSettle"));
        this.node_MyselfGold.getComponent(cc.Label).string = glGame.user.GoldTemp(this.curLogic.get("myGold") + msg.mySettleGold);
        this.myzhanji.getComponent(cc.Label).string = this.curLogic.getNumber(this.curLogic.get("userTotalSettle"));
        this._setFontZhanji(this.myzhanji, this.curLogic.get("userTotalSettle"));
    },
})

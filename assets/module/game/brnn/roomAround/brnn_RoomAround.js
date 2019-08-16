let CONFIGS = require("brnn_const");
glGame.baseclass.extend({

    properties: {
        prefab_dealerList: cc.Prefab,
        prefab_playreList: cc.Prefab,
        label_dealerCount: cc.Label,
        lebel_playerCount: cc.Label,
        node_palyerList: cc.Node,
        prefab_record: cc.Prefab,

        label_mingod: cc.Label,
        btn_rebet: cc.Node,
        btn_auto: cc.Node,

        rebetBtnSpr: [cc.SpriteFrame],
        autoBtnSpr: [cc.SpriteFrame],

        node_watchingBattle: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.curLogic = require("brnnlogic").getInstance();
        this.regisrterEvent();
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);    //切换后台
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);

        this.ischangeStatus = false;
    },
    unregisrterEvent() {
        glGame.emitter.off("showOtherBetAni", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onMatchdetail, this);        //比赛开始相关的信息
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onGrabListChange, this); //上庄列表发生了改变
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onMidEnter, this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onProcess, this);
        glGame.emitter.off('updateChipState', this);
        glGame.emitter.off("rebetFalse", this);
        glGame.emitter.off("checkAutoState", this);
        glGame.emitter.off("globalGameFinish", this)
        glGame.emitter.off("showWatchingBattle", this);
        glGame.emitter.off("gl_enterRoom", this);
        glGame.emitter.off("gl_levelRoom", this);
    },

    regisrterEvent() {
        glGame.emitter.on("showOtherBetAni", this.showOtherBetAni, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onMatchdetail, this.onMatchdetail, this);        //比赛开始相关的信息
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onGrabListChange, this.onGrabListChange, this); //上庄列表发生了改变
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onMidEnter, this.onMidEnter, this);           //进度通知
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onProcess, this.onProcess, this);
        glGame.emitter.on('updateChipState', this.updateChipState, this);
        glGame.emitter.on("rebetFalse", this.rebetFalse, this);
        glGame.emitter.on("checkAutoState", this.changeAutoState, this);
        glGame.emitter.on("globalGameFinish", this.initMinGold, this)
        glGame.emitter.on("showWatchingBattle", this.showWatchingBattle, this);
        glGame.emitter.on("gl_enterRoom", this.updatePlayerCount, this);
        glGame.emitter.on("gl_levelRoom", this.updatePlayerCount, this);
    },

    updatePlayerCount() {
        this.lebel_playerCount.string = this.curLogic.get("playersCount")
    },

    onMatchdetail() {
        this.isShowChipsBtn();
    },
    //显示观战中
    showWatchingBattle(EntranceRestrictions) {
        this.node_watchingBattle.active = true;
        let node = this.node_watchingBattle.children[1].getChildByName("coin");
        node.getComponent(cc.Label).string = this.curLogic.getNumber(EntranceRestrictions);
    },
    //是否显示筹码按钮
    isShowChipsBtn() {
        this.btn_rebet.active = this.curLogic.get("dealerUid") != this.curLogic.get("myUid");
        this.btn_auto.active = this.curLogic.get("dealerUid") != this.curLogic.get("myUid");
        if (this.curLogic.get("dealerUid") == this.curLogic.get("myUid")) {
            this.curLogic.set("autoStatus", false)
        }
    },

    rebetFalse() {
        this.btn_rebet.getComponent(cc.Button).interactable = false;
        this.btn_rebet.getComponent(cc.Sprite).spriteFrame = this.rebetBtnSpr[1]
    },

    //根据下注延迟后的全局通知来刷新续投按钮状态
    updateChipState() {
        if (this.ischangeStatus) return;
        let count = this.curLogic.checkCopyRetBetData();
        this.checkAutoState(count);
        this.checkRebetState();
        this.ischangeStatus = true;
    },

    /**
     * 下注阶段用 rebetData的count
     * 其他阶段都要 copyRetBetData的count
     * 去判断
     */
    checkAutoState(count) {
        let myGold = this.curLogic.get("myGold");
        if (this.curLogic.get("autoStatus")) {    //自动下注状态
            this.btn_auto.children[0].getComponent(cc.Label).string = "取 消";
            this.btn_auto.children[1].active = true;
            this.btn_auto.getComponent(cc.Button).interactable = true;
            this.btn_auto.getComponent(cc.Sprite).spriteFrame = this.autoBtnSpr[0]
            if (myGold / 10 < count) {
                this.btn_auto.children[0].getComponent(cc.Label).string = "自 动";
                this.btn_auto.children[1].active = false;
                this.btn_auto.getComponent(cc.Button).interactable = false;
                this.btn_auto.getComponent(cc.Sprite).spriteFrame = this.autoBtnSpr[1]
                cc.log("自动变灰1", myGold, count)
                this.curLogic.set("autoStatus", false)
                glGame.emitter.emit("showTip", 13);                  //金币不足无法下注
                return glGame.emitter.emit("chipBtnAuto", false)

            } else if (count == 0) {                                 //‘自动’ 常态
                this.btn_auto.children[0].getComponent(cc.Label).string = "自 动";
                this.btn_auto.children[1].active = false;
                this.btn_auto.getComponent(cc.Button).interactable = false;
                this.btn_auto.getComponent(cc.Sprite).spriteFrame = this.autoBtnSpr[1]
                cc.log("自动变灰2", myGold, count)
                this.curLogic.set("autoStatus", false);
                return glGame.emitter.emit("chipBtnAuto", false)
            } else {
                if (this.curLogic.get("isfirstBet") && this.curLogic.get("isBet")) {
                    this.rebet_cb();
                }
            }
        } else {                                  //非自动下注状态
            this.btn_auto.children[0].getComponent(cc.Label).string = "自 动";
            this.btn_auto.children[1].active = false;
            if (myGold / 10 < count || count == 0) {                    //“自动”，灰态
                this.btn_auto.getComponent(cc.Button).interactable = false;
                this.btn_auto.getComponent(cc.Sprite).spriteFrame = this.autoBtnSpr[1]
                cc.log("自动变灰3", myGold, count)
            } else {
                this.btn_auto.getComponent(cc.Button).interactable = true;
                this.btn_auto.getComponent(cc.Sprite).spriteFrame = this.autoBtnSpr[0]
            }
        }
        let bool = this.curLogic.get("autoStatus")
        glGame.emitter.emit("chipBtnAuto", bool)
    },

    checkRebetState() {
        let autoStatus = this.curLogic.get("autoStatus")
        if (autoStatus) {
            this.btn_rebet.getComponent(cc.Button).interactable = false;
            this.btn_rebet.getComponent(cc.Sprite).spriteFrame = this.rebetBtnSpr[1]
            return
        }
        let isfirstBet = this.curLogic.get("isfirstBet");
        if (!isfirstBet) {
            this.btn_rebet.getComponent(cc.Button).interactable = false;
            this.btn_rebet.getComponent(cc.Sprite).spriteFrame = this.rebetBtnSpr[1]
            return
        }

        let count = this.curLogic.checkCopyRetBetData();
        let myGold = this.curLogic.get("myGold");

        if (myGold / 10 < count || count == 0) {
            this.btn_rebet.getComponent(cc.Button).interactable = false;
            this.btn_rebet.getComponent(cc.Sprite).spriteFrame = this.rebetBtnSpr[1];
        } else {
            this.btn_rebet.getComponent(cc.Button).interactable = true;
            this.btn_rebet.getComponent(cc.Sprite).spriteFrame = this.rebetBtnSpr[0]
        }
    },

    changeAutoState() {
        let count = this.curLogic.checkRetBetData();
        this.checkAutoState(count);
    },

    start() {
        this.node.getComponent(cc.Widget).updateAlignment();
        this.node_palyerList.getComponent(cc.Widget).updateAlignment();
        this.curLogic.set("otherPos", this.node_palyerList.position);
    },
    // 重写父类按钮点击事件
    onClick(name, node) {
        switch (name) {
            case "btn_other": this.playerList_cb(); break;
            case "btn_zhuangList": this.dealerList_cb(); break;
            case "btn_rebet": this.rebet_cb(); break;
            case "btn_auto": this.auto_cb(); break;
            case "btn_zoushiopen": this.btnzoushiopen_cb(); break;
            default: console.error("no find button name -> %s", name);
        }
    },
    btnzoushiopen_cb() {
        glGame.emitter.emit("recordOpen");
    },
    //续投
    rebet_cb() {
        this.btn_rebet.getComponent(cc.Button).interactable = false;
        this.btn_rebet.getComponent(cc.Sprite).spriteFrame = this.rebetBtnSpr[1]
        let data = this.curLogic.get("copyRetBetData");
        for (let key in data) {
            for (let i = 0; i < data[key].length; i++) {
                this.curLogic.reqChooseChip(key, data[key][i]);
                cc.log("续投", key, data[key][i])
            }
        }
    },

    //自动下注
    auto_cb() {
        let bool = this.curLogic.get("autoStatus");
        this.curLogic.set("autoStatus", !bool)
        this.btn_auto.children[0].getComponent(cc.Label).string = !bool ? "取 消" : "自  动";
        this.btn_auto.children[1].active = !bool;

        let msg = this.curLogic.get("t_onProcess") ? this.curLogic.get("t_onProcess") : this.curLogic.get("t_onMidEnter");
        let count;
        if (msg && msg.processType == CONFIGS.process.chooseChip) {
            if (this.curLogic.checkCopyRetBetData() === 0) {
                count = this.curLogic.checkRetBetData();
            } else {
                count = this.curLogic.checkCopyRetBetData()
            }
        } else {
            count = this.curLogic.checkCopyRetBetData();
        }
        this.checkAutoState(count);
    },

    dealerList_cb() {
        cc.log("点击了上庄列表");
        let node = cc.instantiate(this.prefab_dealerList);
        node.parent = this.node.parent;
    },

    //玩家列表
    playerList_cb() {
        cc.log("点击了玩家列表");
        glGame.panel.showPanel(this.prefab_playreList);
    },
    showOtherBetAni() {
        this.node_palyerList.stopAllActions();
        let scaleTo = cc.scaleTo(0.2, 1.2);
        let scaleTo1 = cc.scaleTo(0.2, 1);
        this.node_palyerList.runAction(cc.sequence(scaleTo, scaleTo1));
    },

    onGrabListChange() {
        this.dealerList = this.curLogic.get("grabList");
        this.label_dealerCount.string = `(${this.dealerList.length})`;
        this.label_dealerCount.node.active = this.dealerList.length != 0;
    },

    onProcess() {
        let msg = this.curLogic.get("t_onProcess");
        if (msg.processType == CONFIGS.process.settleEffect) {
            this.btn_rebet.getComponent(cc.Button).interactable = false;
            this.btn_rebet.getComponent(cc.Sprite).spriteFrame = this.rebetBtnSpr[1]
            this.ischangeStatus = false;
            let count = this.curLogic.checkCopyRetBetData();
            this.checkAutoState(count);
        }
    },

    initMinGold() {
        this.label_mingod.string = this.curLogic.getNumber(this.curLogic.get("roomInfo").BankerMoney);

        //取消自动状态
        this.curLogic.set("autoStatus", false);
        this.btn_auto.children[0].getComponent(cc.Label).string = "自  动";
        this.btn_auto.children[1].active = false;
        this.btn_auto.getComponent(cc.Button).interactable = true;
        this.btn_auto.getComponent(cc.Sprite).spriteFrame = this.autoBtnSpr[0];
        glGame.emitter.emit("chipBtnAuto", false)
    },

    onMidEnter() {
        this.label_mingod.string = this.curLogic.getNumber(this.curLogic.get("roomInfo").BankerMoney);
        this.isShowChipsBtn();
        this.dealerList = this.curLogic.get("grabList");
        this.label_dealerCount.string = `(${this.dealerList.length})`;
        this.label_dealerCount.node.active = this.dealerList.length != 0;
        this.updatePlayerCount();
    },
    EnterBackground() {
        this.unregisrterEvent();
    },
    EnterForeground() {
        this.regisrterEvent();
        this.isShowChipsBtn();
        this.curLogic.set("autoStatus", false);
        this.btn_auto.children[0].getComponent(cc.Label).string = "自  动";
        this.btn_auto.children[1].active = false;
        this.btn_auto.getComponent(cc.Button).interactable = true;
        this.btn_auto.getComponent(cc.Sprite).spriteFrame = this.autoBtnSpr[0];
        glGame.emitter.emit("chipBtnAuto", false)
    },
    OnDestroy() {
        this.unregisrterEvent();
        glGame.emitter.off("EnterBackground", this);    //切换后台
        glGame.emitter.off("EnterForeground", this);
    },
});

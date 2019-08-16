let CONFIGS = require("brnn_const");
glGame.baseclass.extend({

    properties: {
        audio_pleaseBe: {
            type: cc.AudioClip,
            default: null
        },
        audio_openCard: {
            type: cc.AudioClip,
            default: null
        },
        prefab_pleaseBet: cc.Prefab,
        prefab_buyAway: cc.Prefab,
        prefab_ts: cc.Prefab,
        node_tip: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node_pleaseBet = null;
        this.node_waiting = null;
        this.node_buyAway = null;
        this.dealerTS = null;
        this.curLogic = require("brnnlogic").getInstance();
        this.createNode();
        this.regisrterEvent();
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);    //切换后台
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onMidEnter, this.midEnter, this);
    },
    start() {

    },


    hideTip() {
        if (cc.isValid(this.node_pleaseBet)) {
            this.node_pleaseBet.stopAllActions();
            this.node_pleaseBet.destroy();
        }
        if (cc.isValid(this.node_buyAway)) {
            this.node_buyAway.stopAllActions();
            this.node_buyAway.destroy();
        }
        if (cc.isValid(this.dealerTS)) {
            this.dealerTS.destroy();
        }
        this.node_tip.active = false;
    },
    createNode() {
        this.node_tip.active = false;
    },
    dealerTS_cb() {
        if (cc.isValid(this.dealerTS)) {
            this.dealerTS.destroy();
        }
        this.dealerTS = cc.instantiate(this.prefab_ts);
        this.dealerTS.parent = this.node;
        this.dealerTS.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
        let delayTime = cc.delayTime(2);
        let callFunc = cc.callFunc(() => { this.dealerTS.destroy() });
        let seq = cc.sequence(delayTime, callFunc);
        this.node.runAction(seq);
    },
    //请下注
    showPleaseBet(DTY) {
        let delayTime = cc.delayTime(DTY);
        let callFunc = cc.callFunc(() => {
            if (cc.isValid(this.node_pleaseBet)) {
                this.node_pleaseBet.destroy();
            }
            this.node_pleaseBet = cc.instantiate(this.prefab_pleaseBet);
            this.node_pleaseBet.parent = this.node;
            this.node_pleaseBet.getComponent(sp.Skeleton).setAnimation(0, "ksxz", false);
            glGame.audio.playSoundEffect(this.audio_pleaseBet);
        });
        let delayTime1 = cc.delayTime(1);
        let callFunc1 = cc.callFunc(() => { this.node_pleaseBet.destroy() });
        let seq = cc.sequence(delayTime, callFunc, delayTime1, callFunc1);
        this.node.runAction(seq);
    },
    //买定离手
    showBuyAway() {
        let callFunc = cc.callFunc(() => {
            if (cc.isValid(this.node_buyAway)) {
                this.node_buyAway.destroy();
            }
            this.node_buyAway = cc.instantiate(this.prefab_buyAway);
            this.node_buyAway.parent = this.node;
            this.node_buyAway.getComponent(sp.Skeleton).setAnimation(0, "ksbp", false);
            glGame.audio.playSoundEffect(this.audio_openCard);
        });
        let delayTime1 = cc.delayTime(1);
        let callFunc1 = cc.callFunc(() => { this.node_buyAway.destroy() });
        let seq = cc.sequence(callFunc, delayTime1, callFunc1);
        this.node.runAction(seq);
    },
    //显示公用提示
    showTip(index) {
        let string = this.getString(index);
        let callFunc = cc.callFunc(() => {
            this.node_tip.active = true;
            this.node_tip.children[1].getComponent(cc.Label).string = string
        });
        let delayTime1 = cc.delayTime(2);
        let callFunc1 = cc.callFunc(() => { this.node_tip.active = false; });
        let seq = cc.sequence(callFunc, delayTime1, callFunc1);
        this.node.runAction(seq);
    },
    //根据索引取得提示字符串
    getString(index) {
        let string;
        switch (index) {
            case 0: string = "请下注"; break
            case 1: string = "买定离手"; break
            case 2: string = "超过庄家赔付上限，无法下注！"; break
            case 3: string = "金币不足，强制下庄！"; break
            case 4: string = "游戏已经开始，本局结束后将自动下庄！"; break
            case 5: string = "您已下庄！"; break;
            case 6: string = "您已连庄8局，强制下庄！"; break
            case 7: string = `上庄失败，需要携带${this.curLogic.getNumber(this.curLogic.get("roomInfo").BankerMoney)}金币才可上庄！`; break;
            case 8: string = "您已经加入上庄队列，请耐心等待上庄！"; break;
            case 9: string = "您金币不足，强制退出上庄队列！"; break;
            case 10: string = "您已退出上庄列表！"; break;
            case 11: string = "您已成为庄家！"; break;
            case 12: string = "上庄状态不能退出房间，请先下庄！"; break;
            case 13: string = `金币需达到${this.curLogic.getNumber(this.curLogic.getNeedMinGold())}才可下注该数额，否则可能不足以赔付！`; break;
            case 14: string = "当前不是下注阶段，无法下注！"; break;
            case 15: string = `单局最多下注${this.curLogic.getNumber(this.curLogic.get("MaxBet"))}金币，无法下注！`; break;
        }
        return string;
    },
    /**
    * 网络数据监听
    */
    regisrterEvent() {
        glGame.emitter.on("dealerTS", this.dealerTS_cb, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onProcess, this.onProcess, this);            //进度通知       
        glGame.emitter.on("showTip", this.showTip, this);
    },
    unregisrterEvent() {
        glGame.emitter.off("dealerTS", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onProcess, this);
        glGame.emitter.off("showTip", this);
    },
    onProcess() {
        let msg = this.curLogic.get("t_onProcess");
        if (msg.processType == CONFIGS.process.chooseChip) {    //刚进入游戏，下注流程
            if (cc.isValid(this.node_waiting)) {              //且非中途加入
                this.node_waiting.destroy();
            }
            let BetTime = (this.curLogic.get("BetTime") - CONFIGS.playCardTime) * 1000;
            let curWaitTime = this.curLogic.getMidEnterWaitTime();
            if (curWaitTime >= BetTime) {
                let DTY = (curWaitTime - BetTime) / 1000;
                this.showPleaseBet(DTY);
            }
        } else if (msg.processType == CONFIGS.process.settleEffect) {
            this.showBuyAway();
        }
    },
    midEnter() {
        let msg = this.curLogic.get("t_onMidEnter");
        if (msg.processType == CONFIGS.process.chooseChip) {
            let BetTime = (this.curLogic.get("BetTime") - CONFIGS.playCardTime) * 1000;
            let curWaitTime = this.curLogic.getMidEnterWaitTime();
            if (curWaitTime >= BetTime) {
                let DTY = (curWaitTime - BetTime) / 1000;
                this.showPleaseBet(DTY);
            }
        }
    },

    OnDestroy() {
        this.node.stopAllActions();
        this.unregisrterEvent();
        glGame.emitter.off("EnterBackground", this);    //切换后台
        glGame.emitter.off("EnterForeground", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onMidEnter, this);
    },
    EnterBackground() {
        this.unregisrterEvent();
        this.node.stopAllActions();
        this.hideTip();
    },
    EnterForeground() {
        this.regisrterEvent();
        let process = this.curLogic.get("t_onProcess");
        if (!process) {
            process = this.curLogic.get("t_onMidEnter");
        }
        if (process.processType == CONFIGS.process.chooseChip) {
            let BetTime = (this.curLogic.get("BetTime") - CONFIGS.playCardTime) * 1000;
            let curWaitTime = this.curLogic.getMidEnterWaitTime();
            if (curWaitTime >= BetTime) {
                let DTY = (curWaitTime - BetTime) / 1000;
                this.showPleaseBet(DTY);
            }
        }
    }
    // update (dt) {},
});

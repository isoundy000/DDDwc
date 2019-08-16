let CONFIGS = require("brnn_const");
const intervalH = 70;   //筹码上升35，不盖住自己下的筹码值
glGame.baseclass.extend({
    properties: {
        label_allBet: cc.Label,
        label_myselfBet: cc.Label,
        node_clickBet: cc.Node,

        audio_bet: {
            type: cc.AudioClip,
            default: null
        },
        audio_betMax: {
            type: cc.AudioClip,
            default: null
        },
        audio_otherBet: {
            type: cc.AudioClip,
            default: null
        },

        ani_xzss: cc.Node,
        gaoliang: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.curLogic = require("brnnlogic").getInstance();
        this.chipInfo = [];
        this.regisrterEvent();
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onMidEnter, this.onMidEnter, this);
    },
    start() {

    },
    //显示下注框特效
    showXzss() {
        this.ani_xzss.stopAllActions();
        this.ani_xzss.active = true;
        let dty = cc.delayTime(0.5);
        let cb = cc.callFunc(() => {
            this.ani_xzss.active = false;
        })
        this.ani_xzss.runAction(cc.sequence(dty, cb));
    },

    //查看是否能下注，当庄家筹码不够多，就不能下
    _checkBet(_areaBetLeiJi, _curChipValue) {
        if (this.curLogic.get("dealerUid") == 0) return true;
        let dealerGold = this.curLogic.get("dealerGold");
        if (_areaBetLeiJi * CONFIGS.maxDouble <= dealerGold) {
            return true;
        }
        glGame.emitter.emit("showTip", 2);
        glGame.emitter.emit("updateBtnBySYXZ");
        return false;
    },
    //查看我的金币是否满足
    _checkMyGold(_mybetGold, _curChipValue) {
        let myGold = this.curLogic.get("myGold");
        if (_mybetGold * CONFIGS.maxDouble <= myGold) {
            return true;
        }
        glGame.emitter.emit("showTip", 13);
        let bool = this.curLogic.get("autoStatus");
        if (!bool) glGame.emitter.emit("ChipBtnState");
        return false;
    },
    //下注上限
    _checkMaxBet(mybetGold) {
        let MaxBet = this.curLogic.get("MaxBet");
        if (mybetGold > Number(MaxBet)) {
            glGame.emitter.emit("showTip", 15);
            glGame.emitter.emit("BetFull");
            return false;
        }
        return true;
    },

    //点击了下注
    Bet_cb() {
        if (this.curLogic.get("autoStatus")) return //自动状态点击无效
        let isBet = this.curLogic.get("isBet");
        if (!isBet) {
            return glGame.emitter.emit("showTip", 14);
        }
        if (isBet && !this._isDealer) {
            if (this.curLogic.showGoldLess()) return;
            let curChipValue = this.curLogic.get("curChipValue")
            if (curChipValue == 0) return;

            let mybetGold = Number(this.curLogic.get("betLeiji")).add(curChipValue);    //假设下注成功我的下注总金额
            let areaBetLeiJi = Number(this.curLogic.get("areaBetLeiJi")).add(curChipValue);    //全部人下注总额
            let bool = this._checkBet(areaBetLeiJi, curChipValue);  //如果筹码池的金币*10<庄家的金币或者庄家是系统的话
            let bool2 = this._checkMyGold(mybetGold, curChipValue);
            let bool3 = this._checkMaxBet(mybetGold);
            if (bool && bool2 && bool3) {
                this.curLogic.reqChooseChip(this._areaIndex, curChipValue);
                cc.log("点击下注了", this._areaIndex, curChipValue)
            }
        }
    },

    //清除筹码label
    _clearBetLabel() {
        this.label_myselfBet.string = "";
        this.label_allBet.string = "0";
    },
    //自己下注信息
    _updateMyChipInfo() {
        if (this.node_clickBet.active) {
            this.node_clickBet.active = false;
            this.label_myselfBet.node.active = true;
        }
        let areaBetInfo = this.curLogic.getT_MyAreaBetInfo(this._areaIndex);
        this.label_myselfBet.string = this.curLogic.getNumber(areaBetInfo);
    },
    //所有人下注信息
    _updateAllChipInfo() {
        let areaBetInfo = this.curLogic.getT_AllAreaBetInfo(this._areaIndex);
        this.label_allBet.string = this.curLogic.getNumber(areaBetInfo);
    },
    //显示下注区域高亮
    _showGaoliang() {
        this.gaoliang.stopAllActions();
        this.gaoliang.active = true;
        let dty = cc.delayTime(0.5);
        let cb = cc.callFunc(() => {
            this.gaoliang.active = false;
        })
        this.gaoliang.runAction(cc.sequence(dty, cb));
    },
    //设置下注延迟
    setBetLimit() {
        let DTY;
        let curWaitTime = this.curLogic.getMidEnterWaitTime();
        let beginBetTime = (this.curLogic.get("BetTime") - CONFIGS.playCardTime - 1) * 1000;
        if (curWaitTime >= beginBetTime) {
            DTY = (curWaitTime - beginBetTime) / 1000;
        } else {
            this.curLogic.set("isBet", true);
            glGame.emitter.emit('updateChipState');
            return;
        }
        let delayTime = cc.delayTime(DTY);
        let callFunc = cc.callFunc(() => {
            this.curLogic.set("isBet", true);
            glGame.emitter.emit('updateChipState');
        });
        let seq = cc.sequence(delayTime, callFunc);
        this.node.runAction(seq);
    },

    /**
    * 网络数据监听
    */
    regisrterEvent() {
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onChooseChip, this.onChooseChip, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onProcess, this.onProcess, this);
    },
    unregisrterEvent() {
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onProcess, this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onChooseChip, this);
    },
    onProcess() {
        let msg = this.curLogic.get("t_onProcess");
        if (msg.processType == CONFIGS.process.waitStart) {
            //把上局的下注筹码值重置
            this._clearBetLabel();
            this.curLogic.setRebetData(this._areaIndex, this.chipInfo);
            this.chipInfo = [];
        }
        else if (msg.processType == CONFIGS.process.chooseChip) {
            this._clearBetLabel();
            this.curLogic.set("rebetStatus", true);
            this.node_clickBet.active = true;
            this._isDealer = this.curLogic.getT_isDealer();
            this.setBetLimit();
        } else {
            this.node_clickBet.active = false;
        }
    },
    //断线重连
    onMidEnter() {
        let msg = this.curLogic.get("t_onMidEnter");
        this._isDealer = this.curLogic.getT_isDealer();
        let totalMybet;
        if (this.curLogic.get("myAreaInfo")[this._areaIndex]) {
            totalMybet = this.curLogic.get("myAreaInfo")[this._areaIndex];
        }
        this._updateAllChipInfo();
        if (totalMybet != 0 && totalMybet) {
            this._updateMyChipInfo();
        }
        if (msg.processType == CONFIGS.process.chooseChip) {
            this.setBetLimit();
        } else if (msg.processType == CONFIGS.process.waitStart) {
            //把上局的下注筹码值重置
            this._clearBetLabel();
            this.node_clickBet.active = false;
        } else {
            this.node_clickBet.active = false;
        }
    },
    //闲家下注@chooseUid @areaIndex @ chipValue
    //这里面包含所有的玩家的下注缓存，如果里面的UID和自己的UID一样，就不渲染
    onChooseChip() {
        let myuid = this.curLogic.get("myUid")
        let msg = this.curLogic.get("t_onChooseChip");
        let curChipValue = msg.chipValue;
        let richList = this.curLogic.getT_richList();
        let other = true;
        if (this._areaIndex != msg.areaIndex) return
        if (richList) {
            for (let i = 0; i < richList.length; i++) {
                if (!richList[i]) break;
                if (richList[i].uid == msg.chooseUid) {
                    other = false;
                    break;
                }
            }
        }
        //自己下注
        if (msg.chooseUid == myuid) {
            if (this.curLogic.get("isfirstBet")) {           //续投状态，下了注就把续投改为不能续投
                this.curLogic.set("isfirstBet", false);
                glGame.emitter.emit("rebetFalse");
            }
            this.curLogic.setAreaBetLeiJi(curChipValue);
            this.curLogic.setBetLeiJi(curChipValue);
            this.curLogic.setMyAreaBetInfo(this._areaIndex, curChipValue);
            this.curLogic.setAllAreaBetInfo(this._areaIndex, curChipValue);
            let chipsMax = this.curLogic.get("chipsMax")
            glGame.audio.playSoundEffect(curChipValue == chipsMax ? this.audio_betMax : this.audio_bet);

            this.curLogic.setRebetData(this._areaIndex, curChipValue);
            //渲染下注区域信息
            this._updateMyChipInfo();
            this._updateAllChipInfo();

            //发送事件-去我的金币扣除下注的金币
            glGame.emitter.emit("checkAutoState");
            glGame.emitter.emit("bet", curChipValue);
            let bool = this.curLogic.get("autoStatus");
            if (!bool) glGame.emitter.emit("ChipBtnState");
            glGame.emitter.emit("updateInfo");
            glGame.emitter.emit("addChipImg", this._areaIndex, myuid, curChipValue, myuid);
            this.showXzss();
        } else {
            //别人下注成功
            this._updateAllChipInfo();
            let bool = this.curLogic.get("autoStatus");
            if (!bool) glGame.emitter.emit("ChipBtnState");
            glGame.emitter.emit("addChipImg", this._areaIndex, msg.chooseUid, curChipValue, msg.chooseUid);
            glGame.audio.playSoundEffect(this.audio_otherBet);
            if (other) {
                glGame.emitter.emit("showOtherBetAni")
            } else {
                glGame.emitter.emit("showBetAni", msg.chooseUid)
            }
            this._showGaoliang();
        }
    },

    OnDestroy() {
        this.node.stopAllActions();
        this.unregisrterEvent();
        glGame.emitter.off("EnterBackground", this);
        glGame.emitter.off("EnterForeground", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onMidEnter, this);
    },
    EnterBackground() {
        this.node.stopAllActions();
        this.unregisrterEvent();
        this._clearBetLabel();
        this.node.stopAllActions();
    },
    EnterForeground() {
        this.regisrterEvent();
        let totalMybet = this.curLogic.getT_MyAreaBetInfo(this._areaIndex);
        let totalAllBet = this.curLogic.getT_AllAreaBetInfo(this._areaIndex);
        if (totalAllBet != 0 && totalAllBet) {
            this._updateAllChipInfo();
        }
        if (totalMybet != 0 && totalMybet) {
            this._updateMyChipInfo();
        }
        //重新连接，在下注环节去取得我的下注区域信息。总的下注信息，渲染出来
        let Process = this.curLogic.get("t_onProcess");
        if (!Process) {
            Process = this.curLogic.get("t_onMidEnter");
        }
        if (Process.processType == CONFIGS.process.chooseChip) {
            this.setBetLimit();
        } else if (Process.processType == CONFIGS.process.waitStart) {
            this._clearBetLabel();
            this.node_clickBet.active = false;
        } else {
            this.node_clickBet.active = false;
        }

    },

    set(key, value) {
        this[key] = value;
    },

    get(key) {
        return this[key];
    }
    // update (dt) {},
});


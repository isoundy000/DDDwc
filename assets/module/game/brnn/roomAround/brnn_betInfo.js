let CONFIGS = require("brnn_const");
glGame.baseclass.extend({
    properties: {
        label_beted: cc.Label,
        label_shengyubet: cc.Label,
        pro_sprite: cc.Sprite,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.log("jindutiao", this.jindu, this.jindu1)
        this._myUid = null;
        this.curLogic = require("brnnlogic").getInstance();
        this.label_beted.node.active = false;
        this.label_shengyubet.node.active = false;
        this._zongBet = 0;              //总下注
        this.beted = 0;
        this.setProgress();
        this.registrterEvenet();
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);    //切换后台
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onMidEnter, this.midEnter, this);
    },
    start() {

    },
    getNum(num) {
        if (typeof (num) === 'string') {
            //
        } else if (typeof (num) === 'number') {
            num = num.toString();
        } else {
            cc.error('类型错误', num);
            return
        }
        let anew;
        let re = /([0-9]+\.[0-9]{1})[0-9]*/;
        anew = num.replace(re, "$1");
        return (anew).toString();
    },
    //更新信息
    setProgress() {
        if (this._dealerId == 0) {
            this.pro_sprite.fillRange = 1;
            return;
        }
        this.pro_sprite.fillRange = this.beted * 10 / this.curLogic.get("dealerGold") || 0;
    },
    updateInfo() {
        this.beted = this.curLogic.get("areaBetLeiJi");
        if (!this.beted) this.beted = 0;
        this.label_beted.getComponent(cc.Label).string = glGame.user.GoldTemp(this.beted * 10); //已下注
        if (this._dealerId != 0) {
            this.label_beted.node.active = true;
            this.label_shengyubet.node.x = 279;
            this.label_shengyubet.getComponent(cc.Label).string = `/${glGame.user.GoldTemp(this.curLogic.get("dealerGold"))}`; //剩余
        } else {
            this.label_beted.node.active = false;
            this.label_shengyubet.node.x = 261;
            this.label_shengyubet.getComponent(cc.Label).string = "不限"
        }
        this.label_shengyubet.node.active = true;
        this.setProgress();
    },
    //网络监听
    registrterEvenet() {
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onProcess, this.onProcess, this);
        glGame.emitter.on("updateInfo", this.updateInfo, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onChooseChip, this.onChooseChip, this);
    },
    unregisrterEvent() {
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onProcess, this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onChooseChip, this);
        glGame.emitter.off("updateInfo", this);
    },
    onChooseChip() {
        let msg = this.curLogic.get("t_onChooseChip");
        this._myUid = this.curLogic.get("myUid");
        //自己下注
        if (msg.chooseUid == this._myUid) {
            return;
        } else {
            //别人下注
            this.updateInfo();
        }
    },
    midEnter() {
        let msg = this.curLogic.get("t_onMidEnter");
        if (msg.processType == CONFIGS.process.waitStart || msg.processType == CONFIGS.process.settleEffect) {
            this.beted = 0;
            this._dealerId = this.curLogic.get("dealerUid");
            if (this._dealerId != 0) {
                let dealerGold = this.curLogic.get("dealerGold");
                if (!dealerGold) dealerGold = 0;
                this._zongBet = Math.floor(Number(dealerGold).div(Number(CONFIGS.maxDouble)));
            }
            this.label_beted.node.active = false;
            this.label_shengyubet.node.active = false;
        } else if (msg.processType == CONFIGS.process.chooseChip) {
            this.beted = 0;
            this._dealerId = this.curLogic.get("dealerUid");
            if (this._dealerId != 0) {
                let dealerGold = this.curLogic.get("dealerGold");
                if (!dealerGold) dealerGold = 0;
                this._zongBet = Math.floor(Number(dealerGold).div(Number(CONFIGS.maxDouble)));
            }
            this.label_beted.node.active = true;
            this.label_shengyubet.node.active = true;
        }
        this.updateInfo();
    },
    onProcess() {
        let msg = this.curLogic.get("t_onProcess");
        if (msg.processType == CONFIGS.process.waitStart || msg.processType == CONFIGS.process.settleEffect) {
            this.beted = 0;
            this._dealerId = this.curLogic.get("dealerUid");
            if (this._dealerId != 0) {
                let dealerGold = this.curLogic.get("dealerGold");
                if (!dealerGold) dealerGold = 0;
                this._zongBet = Math.floor(Number(dealerGold).div(Number(CONFIGS.maxDouble)));
            }
            this.label_beted.node.active = false;
            this.label_shengyubet.node.active = false;
        } else if (msg.processType == CONFIGS.process.chooseChip) {
            this.beted = 0;
            this._dealerId = this.curLogic.get("dealerUid");
            if (this._dealerId != 0) {
                let dealerGold = this.curLogic.get("dealerGold");
                if (!dealerGold) dealerGold = 0;
                this._zongBet = Math.floor(Number(dealerGold).div(Number(CONFIGS.maxDouble)));
            }
            this.setProgress();
        }
    },
    Background(msg) {
        if (msg.processType == CONFIGS.process.waitStart || msg.processType == CONFIGS.process.settleEffect) {
            this.beted = 0;
            this._dealerId = this.curLogic.get("dealerUid");
            if (this._dealerId != 0) {
                let dealerGold = this.curLogic.get("dealerGold");
                if (!dealerGold) dealerGold = 0;
                this._zongBet = Math.floor(Number(dealerGold).div(Number(CONFIGS.maxDouble)));
            }
            this.label_beted.node.active = false;
            this.label_shengyubet.node.active = false;
            cc.log("断线重连进来下注信息的渲染", this.label_beted.node.active, this.label_shengyubet.node.active, msg.processType)
        } else if (msg.processType == CONFIGS.process.chooseChip) {
            this.beted = 0;
            this._dealerId = this.curLogic.get("dealerUid");
            if (this._dealerId != 0) {
                let dealerGold = this.curLogic.get("dealerGold");
                if (!dealerGold) dealerGold = 0;
                this._zongBet = Math.floor(Number(dealerGold).div(Number(CONFIGS.maxDouble)));
            }
            this.setProgress();
            this.updateInfo();
        }
    },
    OnDestroy() {
        this.unregisrterEvent();
        glGame.emitter.off("EnterBackground", this);    //切换后台
        glGame.emitter.off("EnterForeground", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onMidEnter, this);

    },
    EnterBackground() {
        this.unregisrterEvent();
    },
    EnterForeground() {
        this.registrterEvenet();
        let Process = this.curLogic.get("t_onProcess");
        if (!Process) {
            Process = this.curLogic.get("t_onMidEnter");
        }
        this.Background(Process);
    }
    // update (dt) {},
});

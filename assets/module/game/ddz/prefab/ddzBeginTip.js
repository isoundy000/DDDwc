glGame.baseclass.extend({

    properties: {
        tipLabelParaOne: cc.Label,
        tipLabelParaTwo: cc.Label,
        tipLabelParaThree: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.curLogic = require('ddzlogic').getInstance();

        let startTime = this.curLogic.get("startTime");
        let curTime = (new Date()).getTime();
        this.waitTime = Math.floor(startTime-curTime/1000);
        console.log("剩余开局时间beginTip1", startTime, curTime, this.waitTime);
        this.paraOne = "本桌已满足开局人数，最多等待";
        this.paraThree = "秒后开局！"
        this.intervalFunc = null;

        this.tipLabelParaOne.string = this.paraOne;
        this.tipLabelParaThree.string = this.paraThree;

        this.refreshNumUi();
        this.registerGlobalEvent();
        this.startCountDown();
    },

    refreshNumUi () {
        this.tipLabelParaTwo.string = ''+this.waitTime;
    },

    startCountDown () {
        this.clearTimeout();
        this.countDown();
    },

    countDown () {
        this.refreshNumUi();
        this.intervalFunc = setInterval(()=>{
            if (this.waitTime>0) {
                this.waitTime -= 1;
                this.refreshNumUi();
            } else {
                this.clearTimeout();
                this.remove();
            }
        }, 1000)
    },

    clearTimeout () {
        clearInterval(this.intervalFunc)
        this.intervalFunc = null;
    },

    EnterBackground () {
        this.clearTimeout();
    },

    EnterForeground () {
        let enterForeTime = (new Date()).getTime();
        let startTime = this.curLogic.get("startTime");
        let surplusTime = startTime-enterForeTime/1000;
        console.log("剩余开局时间beginTip2", startTime, enterForeTime, surplusTime);
        if (surplusTime>0) {
            this.waitTime = Math.floor(surplusTime);
        } else {
            this.remove();
            return;
        }
        this.startCountDown();
    },

    registerGlobalEvent () {
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
    },

    unregisterGlobalEvent () {
        glGame.emitter.off("EnterBackground", this);
        glGame.emitter.off("EnterForeground", this);
    },

    OnDestroy () {
        this.clearTimeout();
        this.unregisterGlobalEvent();
    },

    // start () {},

    // update (dt) {},
});

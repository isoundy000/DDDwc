let CONFIGS = require("ddzconst");
glGame.baseclass.extend({
    properties: {
        lab_myCoin: cc.Label,
        img_myHead: cc.Node,
        myLordIcon: cc.Node,
        lab_myName: cc.Label,
        curGameTimes: cc.Label,
        baseBet: cc.Label,
        maxTimes: cc.Label,
        lightNode:cc.Node,
    },

    onLoad() {
        this.curLogic = require("ddzlogic").getInstance();
        this.backgroundState = false;
        this.registerEvent();
        this.registerGlobalEvent();
    },

    start() {

    },

    initUI() {
        this.initMyInfo();
    },

    //初始化我的信息@headurl @myCoin @myLordIcon
    initMyInfo() {
        let headurl = glGame.user.get('headURL');
        glGame.panel.showHeadImage(this.img_myHead, headurl);
        this.seatid = this.curLogic.getMySeatID();


        let myCoin = this.curLogic.get("myGold");
        console.log("我的金币信息", myCoin, this.fixedNum(myCoin));
        this.lab_myCoin.string = glGame.user.GoldTemp(myCoin);
        let players = this.curLogic.get("players")
        this.lab_myName.string = glGame.user.isTourist() ? "游客" : glGame.user.get('nickname');

        this.myLordIcon.active = false;
    },

    //初始化游戏信息@gameTimes @baseBet @maxTimesLimit
    initGameInfo() {
        this.gameTimes = this.curLogic.get('gameTimes');
        this.curGameTimes.string = this.gameTimes;
        this.baseBet.string = this.curLogic.getFloat(this.curLogic.get("gameBaseBet"));

        let maxTimesLimit = "最大倍数: " + this.curLogic.get("maxGameTimes");
        this.maxTimes.string = maxTimesLimit;
    },

    refreshMyinfo() {
        this.lab_myCoin.string = glGame.user.GoldTemp(this.curLogic.get("myGold"));
    },

    refreshLandlordIcon() {
        if (this.myLordIcon.active) return;
        let landLordSeatId = this.curLogic.get('landlordID');
        if (this.seatid != landLordSeatId) return;
        this.lightNode.active = true;
        this.lightNode.runAction(cc.spawn(cc.sequence(cc.scaleTo(0.35, 1), cc.scaleTo(0.35, 0.1), cc.hide()), cc.callFunc(()=>{
            this.myLordIcon.active = this.seatid == landLordSeatId;
        })))
    },

    onProcess() {
        let processSt = this.curLogic.get("process");
        if (processSt == CONFIGS.gameProcess.loop) {
            // this.refreshBaseBet();
            this.refreshLandlordIcon();
        }

    },
    onGameOver() {
        this.lab_myCoin.string = glGame.user.GoldTemp(this.curLogic.get("myGold"));
    },

    onSyncData() {
        let processSt = this.curLogic.get("process");
        if (processSt >= CONFIGS.gameProcess.loop) {
            this.refreshLandlordIcon();
        }
    },

    fixedNum(value) {
        if (typeof value !== "string" && typeof value !== "number") return;
        return (Math.floor(parseFloat(value) * 10) / 10).toFixed(1);
    },

    //网络监听
    registerEvent() {
        glGame.emitter.on("initRoomUI", this.initMyInfo, this);
        glGame.emitter.on(CONFIGS.CCEvent.onProcess, this.onProcess, this);
        glGame.emitter.on(CONFIGS.CCEvent.onGameOver, this.onGameOver, this);
        glGame.emitter.on(CONFIGS.CCEvent.onSyncData, this.onSyncData, this);
        glGame.emitter.on("refreshLandlordIcon", this.refreshLandlordIcon, this);
    },

    unregisterEvent() {
        glGame.emitter.off("initRoomUI", this);
        glGame.emitter.off(CONFIGS.CCEvent.onProcess, this);
        glGame.emitter.off(CONFIGS.CCEvent.onGameOver, this);
        glGame.emitter.off(CONFIGS.CCEvent.onSyncData, this);
        glGame.emitter.off("refreshLandlordIcon", this);
    },

    registerGlobalEvent() {
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
    },

    unRegisterGlobalEvent() {
        glGame.emitter.off("EnterBackground", this);
        glGame.emitter.off("EnterForeground", this);
    },

    EnterBackground() {
        this.backgroundState = true;
        this.unregisterEvent();
    },

    EnterForeground() {
        if (this.backgroundState) {
            this.backgroundState = false;
            this.registerEvent();
        }
        let processSt = this.curLogic.get("process");
        if (processSt >= CONFIGS.gameProcess.loop) {
            this.refreshLandlordIcon();
        }
    },

    OnDestroy() {
        this.unregisterEvent();
        this.unRegisterGlobalEvent();
    },
    // update (dt) {},
});

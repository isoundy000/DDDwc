let CONFIGS = require("ddzconst");
glGame.baseclass.extend({
    properties: {
        node_headInfo:cc.Node,
        node_score:cc.Node,
        node_lordicon:cc.Node,
        lightNode:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    registerEvent () {
        glGame.emitter.on("onGameOver", this.updateHeadInfo, this);
        glGame.emitter.on("onPlayCardResult", this.updateUserState, this);
        glGame.emitter.on(CONFIGS.CCEvent.onProcess, this.onProcess, this);
        glGame.emitter.on(CONFIGS.CCEvent.onHandCards, this.onHandCards, this);
        glGame.emitter.on("updateHeadInfo", this.updateHeadInfo, this);
        glGame.emitter.on(CONFIGS.CCEvent.onSyncData, this.onSyncData, this);
        glGame.emitter.on(CONFIGS.CCEvent.onGameOver, this.onGameOver, this);
        glGame.emitter.on("refreshLandlordIcon", this.isShowLordIcon, this);
        glGame.emitter.on("onLeaveRoom", this.onLeaveRoom, this);
    },

    unRegisterEvent () {
        glGame.emitter.off("onGameOver", this);
        glGame.emitter.off("onPlayCardResult", this);
        glGame.emitter.off(CONFIGS.CCEvent.onProcess, this);
        glGame.emitter.off(CONFIGS.CCEvent.onHandCards, this);
        glGame.emitter.off("updateHeadInfo", this);
        glGame.emitter.off(CONFIGS.CCEvent.onSyncData, this);
        glGame.emitter.off(CONFIGS.CCEvent.onGameOver, this);
        glGame.emitter.off("refreshLandlordIcon", this);
        glGame.emitter.off("onLeaveRoom", this);
    },

    registerGlobalEvent(){
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
    },

    unRegisterGlobalEvent(){
        glGame.emitter.off("EnterBackground", this);
        glGame.emitter.off("EnterForeground", this);
    },

    EnterBackground () {
        this.backgroundState = true;
        this.unRegisterEvent();
    },

    EnterForeground () {
        if (this.backgroundState){
            this.backgroundState = false;
            this.registerEvent();
        }
        let processSt = this.curLogic.get("process");
        if(processSt == CONFIGS.gameProcess.loop){
            this.isShowLordIcon();
        }else if(processSt == CONFIGS.gameProcess.gamefinish){
            this.isShowLordIcon();
        }
    },

    OnDestroy(){
        this.unRegisterEvent()
        this.unRegisterGlobalEvent();
    },

    onLoad () {
        this.curLogic = require("ddzlogic").getInstance();
        this.backgroundState = false;
        this.initHeadInfo();
        this.registerEvent ();
        this.registerGlobalEvent();
    },

    start () {

    },

    onSyncData(){
        let processSt = this.curLogic.get("process");
        if(processSt != CONFIGS.gameProcess.dealcard){
            this.isShowLordIcon();
        }
    },

    onProcess () {
        let processSt = this.curLogic.get('process');
        if(processSt == CONFIGS.gameProcess.loop){
            this.isShowLordIcon();
        }else if(processSt == CONFIGS.gameProcess.gamefinish){
        }
    },

    onHandCards () {
        console.log("开始判断显示地主图标")
        // this.isShowLordIcon();
    },

    //初始化头像信息
    initHeadInfo(){
        let nickName = this.node_headInfo.getChildByName('nickName');
        nickName.getComponent(cc.Label).string = '';
        let gold = this.node_headInfo.getChildByName("score").getChildByName('gold');
        gold.getComponent(cc.Label).string = '';
        this.node_lordicon.active = false;
        this.updateHeadInfo();

    },

    //是否显示地主标识
    isShowLordIcon(){
        console.log("刷新其他玩家的地主图标", this.seatid, this.curLogic.get("landlordID"))
        if (this.node_lordicon.active) return;
        if (this.curLogic.get('landlordID')!=this.seatid) return;
        this.lightNode.active = true;
        this.lightNode.runAction(cc.spawn(cc.sequence(cc.scaleTo(0.35, 1), cc.scaleTo(0.35, 0.1), cc.hide()), cc.callFunc(()=>{
            this.node_lordicon.active = this.curLogic.get('landlordID')==this.seatid;
        })))
    },
    //设置卡牌闹钟和报警位置
    setCardClockalarmPos(seatid){
        this.seatid = seatid;
    },

    updateHeadInfo(){
        let playerInfo = this.curLogic.get('players');
        if (!playerInfo[this.seatid]) return;
        let nickName = this.node_headInfo.getChildByName('nickName');
        nickName.getComponent(cc.Label).string = playerInfo[this.seatid].nickname;
        let gold = this.node_headInfo.getChildByName('score').getChildByName('gold');
        console.log("玩家的金币信息", playerInfo[this.seatid].gold)
        gold.getComponent(cc.Label).string = glGame.user.GoldTemp(playerInfo[this.seatid].gold);
        let headImg = this.node_headInfo.getChildByName('headImg').getChildByName("touxiang");//.getComponent(cc.Sprite);
        let url = playerInfo[this.seatid].headurl;
        console.log("头像url", url)
        glGame.panel.showHeadImage(headImg, url);
    },

    onLeaveRoom(msg){
        let processSt = this.curLogic.get('process');
        if (msg.seatid == this.seatid && !processSt) {
            this.remove();
        }
    },

    onGameOver(){
        let
            settleData = this.curLogic.get("settleData"),
            playerInfo = this.curLogic.get('players'),
            curGold = playerInfo[this.seatid].gold+settleData[this.seatid],
            goldNode = this.node_headInfo.getChildByName('score').getChildByName('gold');
        console.log("结算结算结算", curGold)
        goldNode.getComponent(cc.Label).string = glGame.user.GoldTemp(curGold);
    },

    fixedNum(value){
        if (typeof value !== 'string' && typeof value !== 'number') return;
        return (Math.floor(parseFloat(value) * 100) / 100).toFixed(2);
     },

    // update (dt) {},
});

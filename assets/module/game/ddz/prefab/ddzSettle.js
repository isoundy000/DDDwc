
let CONFIGS = require("ddzconst");
glGame.baseclass.extend({

    properties: {
        mainSp: cc.Node,
        btnContinue: cc.Node,
        gameSettleAudio: {
             type:cc.AudioClip,
             default:[]
        },
        spine_data: [sp.SkeletonData],
        spine_skeleton: sp.Skeleton,
        tipLab: cc.Node,
        maskBg: cc.Node,
        labGameTimes: cc.Label,
        labBaseScore: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.curLogic = require("ddzlogic").getInstance();
        this.node.active = false;
        this.timerPool = [];
        glGame.emitter.on(CONFIGS.CCEvent.onGameOver, this.onGameOver, this);
    },

    //根据服务器数据去获取相应的图片进行渲染
    initMainSp () {

        glGame.audio.playSoundEffect(this.gameSettleAudio[this.settleType]);

        let index = null;
        if(this.curLogic.get('landlordID')==this.curLogic.getMySeatID()){
            index = this.settleType;
        }else{
            index = this.settleType+2;
        }
        //播放spine动画
        let animationName = CONFIGS.settleSpineAnimationsName[index];

        if (index === 1 || index === 3) {
            this.spine_skeleton.skeletonData = this.spine_data[0];
        } else {
            this.spine_skeleton.skeletonData = this.spine_data[1];
        }
        this.maskBg.active = true;
        this.spine_skeleton.setAnimation(0,animationName,false);

        let gameTimes = this.curLogic.get('gameTimes');
        let gameBaseBet = this.curLogic.get('gameBaseBet');
        //渲染每个玩家
        let settleInfo = this.settleMsg;
        let nodeFlag = 1;
        let tempNodeFlag = 1;
        //逐条延时的时间数据
        let delayTimes = [0.5,0.6,0.7];


        //显示数据标题说明
        this._palyeTheOrder = [10,10,10];   //初始化
        for(let seatid in settleInfo){
            if(seatid == this.curLogic.getMySeatID()){
                this._palyeTheOrder[0] = seatid;

            }else{
                this._palyeTheOrder[tempNodeFlag] = seatid;
                tempNodeFlag++;
            }
        }
        // this.mainSp.getChildByName("label_explain").active = true;
        for(let index = 0; index < 3;index ++) {
            let seatid = this._palyeTheOrder[index];
            if(seatid == this.curLogic.getMySeatID()){
                let node = this.mainSp.getChildByName('node_0');
                this.timerPool.push(setTimeout(()=>{
                    node.active = true;
                    node.getChildByName("head_lordIcon").active = seatid==this.curLogic.get("landlordID");
                    this.initItemInfo(node, seatid, settleInfo[seatid]);
                    this.tipLab.active = true;

                    this.labGameTimes.node.parent.active = true;
                    this.labGameTimes.string = gameTimes;
                    this.labBaseScore.string = this.curLogic.getFloat(this.curLogic.get('gameBaseBet'));
                    console.log("倍数倍数倍数", this.labGameTimes.string, this.labBaseScore.string)
                },delayTimes[0]));
            }else{
                let node = this.mainSp.getChildByName(`node_${nodeFlag}`);
                this.timerPool.push(setTimeout(()=>{
                    node.active = true;
                    node.getChildByName("head_lordIcon").active = seatid==this.curLogic.get("landlordID");
                    this.initItemInfo(node, seatid, settleInfo[seatid]);
                },delayTimes[nodeFlag]));
                nodeFlag++;
            }
        }

        this.timerPool.push(setTimeout(()=>{
            if (this.btnContinue) {
                this.btnContinue.active = true;
            }
        }, 1200));
    },
    /**
     * @describe: 设置背景装饰图
     * @param index : 0是输的背景界面，1是赢的背景界面
     */
    setDecorateBackground(index) {
        let bgImg;
        let titleImg;
        let decorateImg;

        let decorateNode = this.mainSp.getChildByName("node_decorate");
        let bg = decorateNode.getChildByName("img_bg").getComponent(cc.Sprite);
        let titleBg = decorateNode.getChildByName("img_titleBg").getComponent(cc.Sprite);
        let decorate = decorateNode.getChildByName("img_effects").getComponent(cc.Sprite);
        switch(index) {
            case 0:
                bgImg = this.winSettleBgImgs[0];
                titleImg = this.winSettleBgImgs[1];
                decorateImg = this.winSettleBgImgs[2];
            case 1:
                bgImg = this.loseSettleBgImgs[0];
                titleImg = this.loseSettleBgImgs[1];
                decorateImg = this.loseSettleBgImgs[2];
            default:
                console.log("function setDecorateBackground is error");
        }

        bg.spriteFrame = bgImg;
        titleBg.spriteFrame = titleImg;
        decorate.spriteFrame = decorateImg;
    },
    /**
     * @describe: 初始化玩家结算信息
     * @param node : 父节点
     * @param seatid : 座位Id
     * @param settleInfo : 金币信息
     * @param gameTimes ：倍数
     * @param gameBaseBet : 低分
     */
    initItemInfo(node, seatid, settleInfo){
        let players = this.curLogic.get('players');
        let url = players[seatid].headurl;
        if (seatid == this.curLogic.getMySeatID()) {
            node.getChildByName('nickname').color = cc.Color.WHITE;
        }
        let headImg = node.getChildByName('headNode').getChildByName('headNodeImg');
        glGame.panel.showHeadImage(headImg, url);
        node.getChildByName('nickname').getComponent(cc.Label).string = players[seatid].nickname;
        node.getChildByName('coin').getComponent(cc.Label).string = this.curLogic.getFloat(settleInfo);
        node.getChildByName('coin').color = settleInfo>0 ? cc.Color.GREEN : cc.Color.RED;
    },

    isFloat(num){
        ~~num !== num;
    },

    fixedNum(value){
        if(!this.isFloat(value)) return value;
        if(typeof value !== "string" && typeof value !== "number") return;
        return (Math.floor(parseFloat(value)*100)/100).toFixed(2);
    },

    onClick (name, node) {
        switch(name){
            case 'continue':
                if(!this.curLogic.showGoldTip()){
                    glGame.user.reqMyInfo();
                    glGame.room.changeTable();
                    this.remove();
                }
                break;
            case 'mask':
                glGame.emitter.emit("closeSettle");
                this.remove();
                break;
            default:
                console.error('ddzSettle->onClick', name);
                break;
        }
    },

    onGameOver(){

        this.node.active = true;

        let internalTime = 1000;
        if(this.curLogic.get("isSpring")!=0){
            internalTime = 2500;
        }
        this.timerPool.push(setTimeout(()=>{
            this.node.active = true;
            this.settleMsg = this.curLogic.get("settleData");
            this.settleType = this.settleMsg[this.curLogic.getMySeatID()]>0 ? 1 : 0;

            this.initMainSp();
            let dty = cc.delayTime(3);
            let cb = cc.callFunc(()=>{
                glGame.emitter.emit("closeSettle");
                this.remove();
            })
            this.node.runAction(cc.sequence(dty,cb));
        },internalTime))
    },

    unregisterEvent () {
        glGame.emitter.off(CONFIGS.CCEvent.onGameOver,this);
    },
    OnDestroy () {
        if(this.timerPool){
            this.timerPool.forEach((timer)=>{clearTimeout()});
            this.timerPool = [];
        }
        this.unregisterEvent();
    },
    // update (dt) {},
});

const lttConst = require("lttConst");
const lttDef = require("lttDef");
glGame.baseclass.extend({
    properties: {
        sp_bg:sp.Skeleton,
        sp_win:sp.SkeletonData,
        sp_lose:sp.SkeletonData,

        showpanel:cc.Node,
        number:cc.Node,
        myself:cc.Node,
        nodeThreeTop:[cc.Node],
    },


    onLoad() {
        this.lttData = require("luckturntablelogic").getInstance();
        this.registerEvent();
        this.registerGameEvent();
        this.init();
    },

    registerEvent() {
        glGame.emitter.on(lttConst.globalEvent.onProcess, this.onProcess, this);
    },

    unRegisterEvent() {
        glGame.emitter.off(lttConst.globalEvent.onProcess, this);
    },

    onProcess() {
        let process = this.lttData.get("process");
        if (process == lttConst.process.chooseChip) {
            this.remove();
        }
    },

    registerGameEvent() {
        glGame.emitter.on('EnterBackground', this.enterBackground, this);
    },

    onClick(ButtonName, ButtonNode) {
        switch (ButtonName) {
            case "blockInput": this.remove(); break;
        }
    },

    init() {
        cc.log("初始化结算界面")
        let topthree = this.lttData.get("topThree");
        let target = this.lttData.get("targetNumber");
        

        this.getBgColor(this.number,lttDef.judgeColor(target))
        this.number.getChildByName("label").getComponent(cc.Label).string = target;

        let headNode = this.myself.getChildByName("head").children[0];
        if (!glGame.user.isTourist()) {
            glGame.panel.showHeadImage(headNode, glGame.user.get("headURL"));
        }
        this.myself.getChildByName("myid").getComponent(cc.Label).string = this.lttData.get("mynickname")
        let result = this.lttData.get("myWinningCoin");
        let settleGold = this.lttData.get("myResultGold");
        let myscore = this.myself.getChildByName("myscore")
        this.setScoreColor(myscore,result);
        let mysettle = this.myself.getChildByName("mysettle")
        this.setScoreColor(mysettle,settleGold);

        let arr = this.sortTopThreeData(topthree);
        for (let index = 0; index < arr.length; index++) {
            this.nodeThreeTop[index].getChildByName("nickname").getComponent(cc.Label).string = arr[index].nickname;
            this.setScoreColor(this.nodeThreeTop[index].getChildByName("score"), arr[index].winningCoin)
        }
        this._setSettleSpine(result,1);
    },

     //设置结算界面
     _setSettleSpine(score,time){
        if (parseFloat(score) > 0) {
            
            this.sp_bg.getComponent(sp.Skeleton).skeletonData = this.sp_win;
            this.sp_bg.getComponent(sp.Skeleton).setAnimation(0,"yql", false);
            if(time == 0){
                this.sp_bg.getComponent(sp.Skeleton).addAnimation(0,"yql", false,-4);
            }
            this.runac(time);
        }else{
            this.sp_bg.getComponent(sp.Skeleton).skeletonData = this.sp_lose;
            this.sp_bg.getComponent(sp.Skeleton).setAnimation(0,"jxnl", false);
            if(time == 0){
                this.sp_bg.getComponent(sp.Skeleton).addAnimation(0,"jxnl", false,-4);
            }
            this.runac(time);
        }
    },

    runac(time) {
        let dty = time == 0 ? 0 : 0.08;
        let aniList = [];
        for (let i = 0; i < this.showpanel.childrenCount; i++) {
            aniList.push(
                cc.delayTime(dty),
                cc.callFunc(() => {
                    cc.log("lttremovetrue")
                    this.showpanel.children[i].active = true;
                }),   //翻牌
            )
            if(i==this.showpanel.childrenCount-1){
                aniList.push(cc.delayTime(3));
                aniList.push(cc.callFunc(() => {
                    cc.log("lttremove")
                    this.remove()}))
            }
            this.node.runAction(cc.sequence(aniList));
        }
    },

    getBgColor(node, index) {
        switch (index) {
            case 0: node.color = cc.color(6, 15, 13); break;
            case 1: node.color = cc.color(63, 181, 33); break;
            case 2: node.color = cc.color(157, 0, 4); break;
        }
    },

    setScoreColor(node,value){
        node.color = Number(value)>0?cc.color(0,255,0):cc.color(255,0,0);
        node.getComponent(cc.Label).string = Number(value)>0?`+${this.lttData.getFloat(value)}`:this.lttData.getFloat(value);
    },

    sortTopThreeData(rankDatas){
        let sortArr = [];
        for(let key in rankDatas) {
            sortArr.push(rankDatas[key])
        }
        sortArr.sort(function(a, b){
            return b.winningCoin-a.winningCoin;
        });
        return sortArr;
    },

    enterBackground() {
        this.remove();
    },
    
    // update (dt) {},

    OnDestroy() {
        this.unRegisterEvent();
        glGame.emitter.off('EnterBackground', this);
    }
});

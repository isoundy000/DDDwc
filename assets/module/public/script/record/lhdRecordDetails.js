const RoomType = {
    1:"初级房",2:"中级房",3:"高级房",4:"贵宾房",5:"富豪房",99:"体验房"
}
glGame.baseclass.extend({

    properties: {
        cardAtlas:cc.SpriteAtlas,
        gameinfo:cc.Node,
        settleinfo:cc.Node,
        card:cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.updategameinfo();
        this.updatesettleinfo();
        this.updatecardinfo();
    },
    onClick (name, node) {
        switch (name) {
            case "close": this.close_cb(); break;
            default: console.error();
        }
    },
    updategameinfo(){
        let isDealer = JSON.parse(this.recordDetailsData.record).isDealer
        console.log("这是中奖金额",this.recordDetailsData)
        this.gameinfo.getChildByName("gameNo").getComponent(cc.Label).string = this.recordDetailsData.hand_number;
        this.gameinfo.getChildByName("roomType").getComponent(cc.Label).string = RoomType[this.recordDetailsData.bettype];
        this.gameinfo.getChildByName("isbanker").getComponent(cc.Label).string = isDealer?"是":"否";
        this.gameinfo.getChildByName("fee").getComponent(cc.Label).string = this.getFloat(this.recordDetailsData.winning_coin);
        this.gameinfo.getChildByName("profit").getComponent(cc.Label).string = this.recordDetailsData.number>0?"+"+this.getFloat(this.recordDetailsData.number):this.getFloat(this.recordDetailsData.number);
        this.gameinfo.getChildByName("profit").color = this.recordDetailsData.number>0?cc.color(0,255,0):cc.color(255,0,0);
    },
    updatesettleinfo(){
        let winarea = JSON.parse(this.recordDetailsData.record).cards.dictRate;
        for(let areaIndex in winarea){
            if(winarea[areaIndex]>0){
                //this.settleinfo.children[areaIndex-1].getComponent(cc.Sprite).spriteFrame = null;
                this.settleinfo.children[areaIndex-1].getChildByName("winlab").active = true;
            }
        }
        let chipInfo = JSON.parse(this.recordDetailsData.record).chipInfo;
        let areaSettleInfo = JSON.parse(this.recordDetailsData.record).areaSettleInfo;
        for(let i = 1;i<=11;i++){
            if(chipInfo[i]!=null){
                this.settleinfo.children[i-1].getChildByName("lab_Chipstring").getComponent(cc.Label).string = this.getFloat(chipInfo[i]);
                this.settleinfo.children[i-1].getChildByName("lab_Chipstring").color = cc.color(255,150,0);
                this.settleinfo.children[i-1].getChildByName("lab_settlestring").getComponent(cc.Label).string = areaSettleInfo[i]>0?"+"+this.getFloat(areaSettleInfo[i]):this.getFloat(areaSettleInfo[i]);
                this.settleinfo.children[i-1].getChildByName("lab_settlestring").color = areaSettleInfo[i]>=0?cc.color(0,255,0):cc.color(255,0,0);
            }else{
                this.settleinfo.children[i-1].getChildByName("lab_Chipstring").getComponent(cc.Label).string = 0;
                this.settleinfo.children[i-1].getChildByName("lab_Chipstring").color = cc.color(255,150,0);
                this.settleinfo.children[i-1].getChildByName("lab_settlestring").getComponent(cc.Label).string = 0;
                this.settleinfo.children[i-1].getChildByName("lab_settlestring").color = cc.color(255,0,0);
            }
        }
       

    },
    updatecardinfo(){
        let card = JSON.parse(this.recordDetailsData.record).cards.cardDict;
        let CardoneValue = this.getSixValue(card[1]);;
        let CardtwoValue = this.getSixValue(card[2]);
        this.card.children[0].getComponent(cc.Sprite).spriteFrame = this.cardAtlas._spriteFrames["bull1_"+CardoneValue];
        this.card.children[1].getComponent(cc.Sprite).spriteFrame = this.cardAtlas._spriteFrames["bull1_"+CardtwoValue];
    },
    getSixValue(logicNum) {
        logicNum = parseInt(logicNum);
        let str = logicNum < 14 ? "0x0" : "0x";
        return str + logicNum.toString(16);
    },
    close_cb() {
        if (this["modelType"] == 1) {
            this.node.parent.parent.getChildByName("panel").active = true;
            this.node.parent.parent.getChildByName("mask").active = true;
        }
        this.remove();
    },
    getFloat(value) {
        return (Number(value).div(100)).toString();
    },
    set(key,value){
        this[key] = value;
    }
    // update (dt) {},
});

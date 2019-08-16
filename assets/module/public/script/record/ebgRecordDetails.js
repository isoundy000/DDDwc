const special_Card = {
    0:"天王",
    1:"一宝",
    2:"二宝",
    3:"三宝",
    4:"四宝",
    5:"五宝",
    6:"六宝",
    7:"七宝",
    8:"八宝",
    9:"九宝",
    10:"二八杠"
}
const common_Card ={
    1:"一点",
    2:"二点",
    3:"三点",
    4:"四点",
    5:"五点",
    6:"六点",
    7:"七点",
    8:"八点",
    9:"九点",
    10:"鳖十"
}
const roomtype = {
    1:"初级房",2:"中级房",3:"高级房",4:"贵宾房",5:"富豪房",99:"体验房"
}
glGame.baseclass.extend({

    properties: {
        ebg_cardAtlas:cc.SpriteAtlas,
        CardInfo:cc.Node,
        myinfo:cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.loseFntColor = new cc.Color(255, 60, 60);//红色
        this.winFntColor = new cc.Color(102, 255, 0);//绿色
        this.myColor = new cc.Color(255, 108, 0);//橙色
        console.log("这是二八杠的数据",this.recordDetailsData)
        this.updateAllPlayerinfo();
        this.updatemyinfo();
    },
    updatemyinfo(){
        this.myinfo.getChildByName("number").getComponent(cc.Label).string = this.recordDetailsData.hand_number;
        this.myinfo.getChildByName("roomtype").getComponent(cc.Label).string = roomtype[this.recordDetailsData.bettype];
        this.myinfo.getChildByName("blinds").getComponent(cc.Label).string = this.getFloat(this.recordDetailsData.baseChip);
        let settle = Number(this.recordDetailsData.number)>0?"+"+this.getFloat(this.recordDetailsData.number):this.getFloat(this.recordDetailsData.number);
        this.myinfo.getChildByName("settle").getComponent(cc.Label).string = settle;
        this.myinfo.getChildByName("settle").color = settle>0?this.winFntColor:this.loseFntColor;
    },
    updateAllPlayerinfo(){
        let record = JSON.parse(this.recordDetailsData.record);
        console.log("这是当前的记录",record)
        for(let i=0;i<record.length;i++){
            if(glGame.user.get("logicID") == record[i].logicid){
                this.CardInfo.children[i].getChildByName("layout").getChildByName("username").color = this.myColor;
            }
            this.CardInfo.children[i].getChildByName("layout").getChildByName("username").getComponent(cc.Label).string = record[i].nickname;
            if(this.Card_Type(record[i].cards)!=10){
                this.CardInfo.children[i].getChildByName("valuebg").getChildByName("value").getComponent(cc.Label).string = this.Card_Type(record[i].cards);
            }else{
                this.CardInfo.children[i].getChildByName("bieshi").active = true;
            }
            this.CardInfo.children[i].getChildByName("CardValue").children[0].getComponent(cc.Sprite).spriteFrame = this.ebg_cardAtlas._spriteFrames[record[i].cards[0]];
            this.CardInfo.children[i].getChildByName("CardValue").children[1].getComponent(cc.Sprite).spriteFrame = this.ebg_cardAtlas._spriteFrames[record[i].cards[1]];
            if(record[i].isBanker){
                this.CardInfo.children[i].getChildByName("bets").getComponent(cc.Label).string = `抢${record[i].grabBankerTimes}倍`;
                this.CardInfo.children[i].getChildByName("bets").color = this.loseFntColor;
                this.CardInfo.children[i].getChildByName("layout").getChildByName("banker").active = true;
            }else{
                this.CardInfo.children[i].getChildByName("bets").getComponent(cc.Label).string = `下${record[i].betTimes}倍`
                this.CardInfo.children[i].getChildByName("bets").color = this.myColor;
            }
            this.CardInfo.children[i].getChildByName("settle").getComponent(cc.Label).string =record[i].totalWin>0?"+"+this.getFloat(record[i].totalWin):this.getFloat(record[i].totalWin);
            this.CardInfo.children[i].getChildByName("settle").color = record[i].totalWin>0?this.winFntColor:this.loseFntColor
        }
        console.log("这是当前的记录",record)
    },
    onClick (name, node) {
        switch (name) {
            case "btn_close": this.close_cb(); break;
            default: console.error();
        }
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
    //判断牌型
    Card_Type(Cardarr){
        if(Cardarr[0] == Cardarr[1]){
            return special_Card[Cardarr[0]]
        }else{
            if(Cardarr[0]+Cardarr[1] == 10&&(Cardarr[0]==8||Cardarr[1]==8)){
                return special_Card[10]
            }else if(Cardarr[0]+Cardarr[1] == 10&&Cardarr[0]==5&&Cardarr[1]==5){
                return special_Card[5]
            }
            if(Cardarr[0]+Cardarr[1] == 10){
                return 10;
            }else{
                let count = Cardarr[0]+Cardarr[1]>10?Cardarr[0]+Cardarr[1]-10:Cardarr[0]+Cardarr[1]
                if(Cardarr[0]==0||Cardarr[1]==0){
                    return common_Card[count]+"半"
                }else{
                    return common_Card[count]
                }
            }
        }
    },
    set(key,value){
        this[key] = value;
    }
    // update (dt) {},
});

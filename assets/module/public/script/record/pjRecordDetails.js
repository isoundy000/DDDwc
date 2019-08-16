const cardType = {
    0:"零点",1:"一点",2:"二点",3:"三点",4:"四点",5:"五点",6:"六点",7:"七点",8:"八点",9:"九点",10:"地高九",11:"天高九",12:"地杠",
    13:"天杠",14:"地王",15:"天王",16:"杂五",17:"杂七",18:"杂八",19:"杂九",20:"双零霖",21:"双高脚",22:"双红头",23:"双斧头",24:"双板凳",
    25:"双长三",26:"双梅",27:"双鹅",28:"双人",29:"双地",30:"双天",31:"至尊"
}
const RoomType = {
    1:"初级房",2:"中级房",3:"高级房",4:"贵宾房",5:"富豪房",99:"体验房"
}
glGame.baseclass.extend({

    properties: {
        roominfo:cc.Node,
        playerDetail:cc.Node,
        paijiu_cardAtlas:cc.SpriteAtlas
    },
    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this.loseFntColor = new cc.Color(255, 60, 60);//红色
        this.winFntColor = new cc.Color(102, 255, 0);//绿色
        this.updateroominfo();
        this.updateplayerdetail();
    },
    onClick (name, node) {
        switch (name) {
            case "close": this.close_cb(); break;
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
    updateroominfo(){
        this.roominfo.getChildByName("roomid").getComponent(cc.Label).string = this.recordDetailsData.hand_number;
        this.roominfo.getChildByName("roomType").getComponent(cc.Label).string = RoomType[this.recordDetailsData.bettype];
        this.roominfo.getChildByName("basechip").getComponent(cc.Label).string = this.getFloat(this.recordDetailsData.baseChip);
        this.roominfo.getChildByName("choushui").getComponent(cc.Label).string = this.getFloat(this.recordDetailsData.gainFee);
        this.roominfo.getChildByName("number").getComponent(cc.Label).string = 
        this.recordDetailsData.number>0?"+"+this.getFloat(this.recordDetailsData.number):this.getFloat(this.recordDetailsData.number);
        this.roominfo.getChildByName("number").color = this.recordDetailsData.number>0?this.winFntColor:this.loseFntColor 
    },
    updateplayerdetail(){
        let record = JSON.parse(this.recordDetailsData.record);
        console.log('详情信息',record)
        for(let i=0;i<this.playerDetail.childrenCount;i++){
            this.playerDetail.children[i].getChildByName("id").getComponent(cc.Label).string = record[i].nickname;
            this.playerDetail.children[i].getChildByName("id").color = record[i].logicId == glGame.user.get('logicID')?cc.color(255,108,0):cc.color(195,158,108);
            this.playerDetail.children[i].getChildByName("cardType").getComponent(cc.Label).string = cardType[record[i].cardType];
            this.playerDetail.children[i].getChildByName("bettype").getComponent(cc.Label).string = 
            record[i].isBanker?`抢${record[i].multiple}倍`:`下${record[i].multiple}倍`;
            this.playerDetail.children[i].getChildByName("img_zhuangbiaozhi").active = record[i].isBanker? true:false;
            this.playerDetail.children[i].getChildByName("bettype").color = record[i].isBanker?cc.color(255,60,60):cc.color(252,154,67);
            this.playerDetail.children[i].getChildByName("number").getComponent(cc.Label).string = record[i].winCoin>0?"+"+this.getFloat(record[i].winCoin):this.getFloat(record[i].winCoin);
            this.playerDetail.children[i].getChildByName("number").color = record[i].winCoin>0?this.winFntColor:this.loseFntColor 
            this.playerDetail.children[i].getChildByName("cardone").getComponent(cc.Sprite).spriteFrame = 
            this.paijiu_cardAtlas._spriteFrames["paijiu_card_"+record[i].cards[0]];
            this.playerDetail.children[i].getChildByName("cardtwo").getComponent(cc.Sprite).spriteFrame = 
            this.paijiu_cardAtlas._spriteFrames["paijiu_card_"+record[i].cards[1]];
        }
    },
    getFloat(value) {
        return (Number(value).div(100)).toString();
    },
    set(key,value){
        this[key] = value;
    }
    // update (dt) {},
});

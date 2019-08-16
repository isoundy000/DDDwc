
const roomType = {
    1:"初级房",2:"中级房",3:"高级房",4:"贵宾房",5:"富豪房"
};

glGame.baseclass.extend({
    extends: cc.Component,

    properties: {
        item: cc.Node,
        content: cc.Node,
        gameInfo: cc.Node,
        caijin: cc.Label,
        myChip: [cc.Node],
        sprite_quan: [cc.SpriteFrame],
        sprite_zhuang: [cc.SpriteFrame],
        sprite_head: [cc.SpriteFrame],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.record = JSON.parse(this.recordDetailsData.record);
        this.initPanel();
    },

    initPanel() {
        console.log("森林舞会",  this.record);
        this.gameInfo.children[0].getComponent(cc.Label).string = this.recordDetailsData.hand_number;
        this.gameInfo.children[1].getComponent(cc.Label).string = roomType[this.recordDetailsData.bettype];
        this.gameInfo.children[3].getComponent(cc.Label).string = this.recordDetailsData.number>0?"+"+this.cutDownNum(this.recordDetailsData.number):this.cutDownNum(this.recordDetailsData.number);
        this.gameInfo.children[3].color = this.recordDetailsData.number>0?cc.color(0,255,0):cc.color(255,0,0);
        this.initContent();
    },
    initContent(){
        let count = 1;
        for(let chipId in this.record.betInfo){
            this.myChip[Number(chipId) - 1].getChildByName("chip").getComponent(cc.Label).string = this.cutDownNum(this.record.betInfo[chipId]);
        }
        for(let chipId in this.record.rewardMultipeMap){
            this.myChip[Number(chipId) - 1].getChildByName("beishu").getChildByName("mul").getComponent(cc.Label).string = this.record.rewardMultipeMap[count];
            count++;
        }

        let item = cc.instantiate(this.item);
        item.parent = this.content;
        item.active = true;
        item.getChildByName("headBg").getComponent(cc.Sprite).spriteFrame = this.sprite_quan[Math.floor(Number(this.record.drawLotterysDatas.bankerOrPlayerArea)/5) - 1];
        item.getChildByName("headBg").children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_zhuang[Math.floor(Number(this.record.drawLotterysDatas.bankerOrPlayerArea)/5) - 1];
        if(this.record.drawLotterysDatas.handselArea){
            for(let i = 0;i < this.record.drawLotterysDatas.handselArea.handselRecord.length;i++){
                if(this.record.drawLotterysDatas.handselArea.handselRecord[i].logicId == glGame.user["logicID"]){
                    this.caijin.string = this.cutDownNum(this.record.drawLotterysDatas.handselArea.handselRecord[i].handsel);
                    return;
                }
            }
        }else{
            this.caijin.string = "0";
        }
        let result = this.record.drawLotterysDatas.animalArea.rewardAreaIds;
        for(let i = 0;i < result.length;i++){
            let item = cc.instantiate(this.item);
            item.parent = this.content;
            item.active = true;
            switch (this.record.drawLotterysDatas.animalArea.rewardType) {
                case "1"://正常
                    item.getChildByName("headBg").getComponent(cc.Sprite).spriteFrame = this.sprite_quan[Math.floor(Number(result[i])/5)];
                    if(Number(result[i])%5 != 0){
                        item.getChildByName("headBg").children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_head[Number(result[i])%5 - 1];
                    }else{
                        item.getChildByName("headBg").children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_zhuang[Math.floor(Number(result[i])/5)];
                    }
                    break;
                case "2":
                case "3"://闪电
                    item.getChildByName("headBg").getComponent(cc.Sprite).spriteFrame = this.sprite_quan[Math.floor(Number(result[i])/5)];
                    item.getChildByName("headBg").children[1].active = true
                    if(this.record.drawLotterysDatas.animalArea.rewardType == "2"){
                        item.getChildByName("headBg").children[1].getComponent(cc.Label).string = "x2";
                    }else{
                        item.getChildByName("headBg").children[1].getComponent(cc.Label).string = "x3";
                    }
                    if(Number(result[i])%5 != 0){
                        item.getChildByName("headBg").children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_head[Number(result[i])%5 - 1];
                    }else{
                        item.getChildByName("headBg").children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_zhuang[Math.floor(Number(result[i])/5)];
                    }
                    break;
                case "4"://大三元
                    item.getChildByName("headBg").getComponent(cc.Sprite).spriteFrame = this.sprite_quan[Number(this.record.drawLotterysDatas.animalArea.rewardType) - 1];
                    item.getChildByName("headBg").width = 65;
                    item.getChildByName("headBg").height = 65;
                    if(Number(result[i])%5 != 0){
                        item.getChildByName("headBg").children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_head[Number(result[i])%5 - 1];
                    }else{
                        item.getChildByName("headBg").children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_zhuang[Math.floor(Number(result[i])/5)];
                    }
                    return;
                case "5"://大四喜
                    item.getChildByName("headBg").getComponent(cc.Sprite).spriteFrame = this.sprite_quan[Math.floor(Number(result[i])/5)];
                    if(Number(result[i])%5 != 0){
                        item.getChildByName("headBg").children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_head[Number(this.record.drawLotterysDatas.animalArea.rewardType) - 1];
                    }
                    return;

                default:
                    break;
            }
        }
    },
    //截取小数点后两位
    cutDownNum(value, num = 2) {
        if (isNaN(value)) return;
        if (~~value === value) {
            return value.div(100).toString();
        } else {
            value = Number(value).div(100);
            return (Math.floor(value * 100) / 100).toFixed(num);
        }
    },

    //----btn callback------
    onClick(name, node) {
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

    set(_key, _value) {
        this[_key] = _value;
    },

    // update (dt) {},
});

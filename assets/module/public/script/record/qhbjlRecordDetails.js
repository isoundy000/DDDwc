
const roomType = {
    1:"初级房",2:"中级房",3:"高级房",4:"贵宾房",5:"富豪房"
};

glGame.baseclass.extend({
    extends: cc.Component,

    properties: {
        ranking_spriteFrame: [cc.SpriteFrame],
        item: cc.Node,
        content: cc.Node,
        gameInfo: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.record = JSON.parse(this.recordDetailsData.record);
        switch (this.record.redPacket.currentUseType) {
            case "first":
                this.ranking = 0;
                break;
            case "second":
                this.ranking = 1;
                    break;
            case "last":
                this.ranking = this.record.redPacket.betedPlayers.length - 1;
                    break;
            default:
                break;
        }
        this.initPanel();
    },

    initPanel() {
        this.gameInfo.children[0].getComponent(cc.Label).string = this.recordDetailsData.hand_number;
        this.gameInfo.children[1].getComponent(cc.Label).string = roomType[this.recordDetailsData.bettype];
        this.gameInfo.children[2].getComponent(cc.Label).string = this.record.redPacket.betedPlayers[this.ranking].uid == glGame.user["userID"]?"是":"否";
        this.gameInfo.children[3].getComponent(cc.Label).string = this.recordDetailsData.number>0?"+"+this.cutDownNum(this.recordDetailsData.number):this.cutDownNum(this.recordDetailsData.number);
        this.gameInfo.children[3].color = this.recordDetailsData.number>0?cc.color(0,255,0):cc.color(255,0,0);
        this.initContent();
    },
    initContent(){
        let betedPlayers = this.record.redPacket.betedPlayers;
        for(let i = 0;i < betedPlayers.length;i++){
            let item = cc.instantiate(this.item);
            item.parent = this.content;
            item.active = true;
            if(betedPlayers[i].uid != 0){
                item.getChildByName("name").getComponent(cc.Label).string = betedPlayers[i].nickname;
            }else{
                item.getChildByName("name").getComponent(cc.Label).string = "系统回收";
                item.getChildByName("name").color = cc.color(255,0,0)
            }
            if(betedPlayers[i].uid == glGame.user["userID"]){
                item.getChildByName("name").color = cc.color(255,108,0)
            }
            item.getChildByName("wincoin").getComponent(cc.Label).string = this.cutDownNum(betedPlayers[i].winCoin);
            if(i < 3){
                item.getChildByName("ranking").active = true;
                item.getChildByName("ranking").getComponent(cc.Sprite).spriteFrame = this.ranking_spriteFrame[i];
            }else{
                item.getChildByName("rankLabel").active = true;
                item.getChildByName("rankLabel").getComponent(cc.Label).string = i + 1;
            }
            if(i == this.ranking){
                item.getChildByName("jie").active = true;
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

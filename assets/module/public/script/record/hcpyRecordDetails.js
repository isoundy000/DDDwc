
const RoomType = {
    1:"初级房",2:"中级房",3:"高级房",4:"贵宾房",5:"富豪房",99:"体验房"
}
glGame.baseclass.extend({

    properties: {
        resultItem:cc.Node,
        gameinfo:cc.Node,
        chipinfo:cc.Node,
        resultinfo:cc.Node,
        hcpySprite:[cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.updategameinfo();
        this.updateChipinfo();
        this.updateRewar()

    },
    onClick (name, node) {
        switch (name) {
            case "close": this.close_cb(); break;
            default: console.error();
        }
    },
    updategameinfo(){
        console.log("这是豪车飘移的中奖金额",this.recordDetailsData)
        this.gameinfo.getChildByName("gameNo").getComponent(cc.Label).string = this.recordDetailsData.hand_number;
        this.gameinfo.getChildByName("roomType").getComponent(cc.Label).string = RoomType[this.recordDetailsData.bettype];
        this.gameinfo.getChildByName("fee").getComponent(cc.Label).string = this.getFloat(this.recordDetailsData.winning_coin);
        this.gameinfo.getChildByName("profit").getComponent(cc.Label).string = this.recordDetailsData.number>0?"+"+this.getFloat(this.recordDetailsData.number):this.getFloat(this.recordDetailsData.number);
        this.gameinfo.getChildByName("profit").color = this.recordDetailsData.number>0?cc.color(0,161,11):cc.color(255,0,0);
    },
    updateChipinfo(){
        let chipinfo = JSON.parse(this.recordDetailsData.record).chipsInfo
        for(let i=1;i<=8;i++){
            if(chipinfo[i]!=null&&chipinfo[i]!= 0){
                this.chipinfo.children[i-1].getComponent(cc.Label).string = this.getFloat(chipinfo[i])
            }else{
                this.chipinfo.children[i-1].getComponent(cc.Label).string = "-";
            }
        }
    },
    updateRewar(){
        let rewardArr = JSON.parse(this.recordDetailsData.record).winAreaIndex;
        for(let i in rewardArr){
        console.log(rewardArr[i]+"开奖记录")
        let resultItem = cc.instantiate(this.resultItem);
        resultItem.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = this.hcpySprite[i-1];
        resultItem.getChildByName("number").getComponent(cc.Label).string = "X"+ rewardArr[i];
        resultItem.parent = this.resultinfo;
        resultItem.active = true;
        }
    },
    close_cb() {
        console.log("aaaaaaaaaaaaaa")
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

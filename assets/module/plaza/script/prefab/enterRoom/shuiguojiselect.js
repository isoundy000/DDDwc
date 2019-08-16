
glGame.baseclass.extend({
    extends: cc.Component,

    properties: {
        content:cc.Node,
        node_record:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        glGame.readyroom.reqEnterArea(glGame.scenetag.SHUIGUOJI);
        this.registerEvent();
        this.roomType = 1;
        this.gameState = {
            BASE:0,
        }
    },

    start () {

    },

    onClick(name,node){
        cc.log('33')
        switch(name){
            case 'toggle_base':
            if(this.roomType != 1){
                this.roomType = 1;
                this.updateUI();
            }
            break;
            case 'toggle_elementary':
            cc.log('33')
            if(this.roomType != 2){
                this.roomType = 2;
                this.updateUI();
                cc.log('11')
            }
            break;
            case 'toggle_medium':
            if(this.roomType != 3){
                this.roomType = 3;
                this.updateUI();
            }
            break;
            case 'toggle_higher':
            if(this.roomType != 4){
                this.roomType = 4;
                this.updateUI();
            }
            break;
            case 'btn_enter':
            cc.log(node.parent.getChildByName('roomId').getComponent(cc.Label).string,node.parent.tag);
            glGame.readyroom.enterHundredsRoom(node.parent.getChildByName('roomId').getComponent(cc.Label).string,node.parent.tag);
            break;
        }
    },

    //事件监听
    registerEvent(){
        glGame.emitter.on("onGameInfolist_area", this.onGameInfolist, this);
    },
    //事件销毁
    unregisterEvent(){
        glGame.emitter.off("onGameInfolist_area", this);
    },
    //事件回调
    //进入游戏信息回调
    onGameInfolist(){
        this.roomList = glGame.readyroom.roomlist;
        this.updateUI();
    },
    //更新UI
    updateUI(){
        cc.log('this.roomList==',this.roomList)
        this.content.destroyAllChildren();
        for(let roomid in this.roomList[this.roomType]){
            let infoNode = cc.instantiate(this.node_record);
            infoNode.parent = this.content;
            infoNode.active = true;
            infoNode.getChildByName('roomId').getComponent(cc.Label).string = roomid;
            infoNode.getChildByName('onlineNum').getComponent(cc.Label).string = '在线' + this.roomList[this.roomType][roomid].online;
            infoNode.tag = this.roomList[this.roomType][roomid].roomserverid;
            // infoNode.getChildByName('lackTime').getComponent(cc.Label).string = this.roomList[this.roomType][i].lackTime;
            // infoNode.getChildByName('gameState').getComponent(cc.Label).string = this.roomList[this.roomType][i].gameState;
            //this.content.height += 170;
        }
    },


    OnDestroy() {
        this.unregisterEvent();
    },
});

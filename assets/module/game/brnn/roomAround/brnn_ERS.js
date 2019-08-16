/*
*这3个按钮主要是要放在等待游戏中蒙蔽的上方，
*考量以后觉得单拿3个按钮出来最方便
*/
let CONFIGS = require("brnn_const");
glGame.baseclass.extend({

    properties: {
        btn_menu: cc.Node,
        node_menu: cc.Node,
    },
    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this.curLogic = require("brnnlogic").getInstance();
    },
    start() {

    },
    // 重写父类按钮点击事件
    onClick(name, node) {
        switch (name) {
            case "img_guize": this.rule_cb(); break;
            case "img_shezhi": this.set_cb(); break;
            case "exit": this.exitRoom(); break;
            case "btn_zhanji": this.zhanji_cb(); break;
            case "menuBtn": this.menu_cb(); break;
            case "close": this.close_cb(); break;
            default: console.error("no find button name -> %s", name);
        }
    },
    exit_cb() {

    },
    menu_cb() {
        this.node_menu.active = !this.node_menu.active;
        this.node.getChildByName("menuBtn").active = false;
        this.node.getChildByName("close").active = true;
    },

    close_cb() {
        this.node_menu.active = false;
        this.node.getChildByName("menuBtn").active = true;
        this.node.getChildByName("close").active = false;
    },

    //设置
    set_cb() {
        cc.log("点击了设置");
        if (cc.director.getScene().getChildByName("setting")) return;
        glGame.panel.showSetting(25);
        this.close_cb();
    },

    //规则
    rule_cb() {
        cc.log("点击了规则");
        if (cc.director.getScene().getChildByName("gamerule")) return;
        let gameid = glGame.scenetag.BRNN;
        glGame.panel.showNewGameRule(gameid, 25);
        this.close_cb();
    },

    zhanji_cb() {
        if (cc.director.getScene().getChildByName("record")) return;
        let gameid = glGame.scenetag.BRNN;
        glGame.panel.showNewGameRecord(gameid, 25);
        this.close_cb();
    },

    //退出房间
    exitRoom() {
        cc.log("WWWEEEEEE退出房间");
        let isdealer = this.curLogic.getT_isDealer();
        if (isdealer) {
            glGame.emitter.emit("showTip", 12);
            return;
        }
        if(this.curLogic.get("betLeiji") == 0){
            glGame.room.exitRoom();
        }else{
            glGame.panel.showExitRoomPanel('hundred',99)
        }
    },

    OnDestroy() {

    },
    // update (dt) {},
});

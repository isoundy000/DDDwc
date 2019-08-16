let CONFIGS = require("brnn_const");
glGame.baseclass.extend({
    properties: {
        node_content: cc.Node,
        node_item: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.dealerList = null;
        this.curLogic = require("brnnlogic").getInstance();
        this.regisrterEvent();
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);    //切换后台
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
    },

    start() {
        this.dealerList = this.curLogic.get("grabList");
        this.addItems(this.dealerList);
    },
    //绑定事件
    onClick(name, node) {
        switch (name) {
            case 'close': this.btn_close_cb(); break;
        }
    },
    btn_close_cb() {
        cc.log("关闭上列表");
        this.node.destroy();
    },
    //添加上庄列表的玩家单项
    addItems(_dealerList) {
        if (this.node_content) {
            this.node_content.removeAllChildren();
        }
        for (let i = 0; i < _dealerList.length; i++) {
            let item = cc.instantiate(this.node_item);
            item.parent = this.node_content;
            item.active = true;
            let id = item.getChildByName("id");
            id.getComponent(cc.Label).string = _dealerList[i].nickname;
            if (_dealerList[i].uid == this.curLogic.get("myUid")) {
                id.color = cc.color(255, 0, 0);
                id.getComponent(cc.Label).string = glGame.user.isTourist() ? "游客" : _dealerList[i].nickname;
            }
        }
    },
    /**
   * 网络数据监听
   */
    regisrterEvent() {
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onGrabListChange, this.onGrabListChange, this); //上庄列表发生了改变
    },
    unregisrterEvent() {
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onGrabListChange, this);

    },
    //上庄列表发生改变
    onGrabListChange() {
        this.dealerList = this.curLogic.get("grabList");
        this.addItems(this.dealerList)
    },

    OnDestroy() {
        this.unregisrterEvent();
        glGame.emitter.off("EnterBackground", this);    //切换后台
        glGame.emitter.off("EnterForeground", this);
    },
    EnterBackground() {
        this.unregisrterEvent();
    },
    EnterForeground() {
        this.regisrterEvent();
    }
    // update (dt) {},
});

const lttConst = require("lttConst");
glGame.baseclass.extend({
    properties: {
        content: cc.Node,
        itemPrefab: cc.Node,
        scrollViewNode: cc.ScrollView,
    },

    onLoad() {
        this.lttData = require("luckturntablelogic").getInstance();
        this.playersList = [];
        this.dataCount = 20;
        this.addTime = 0;
        this.total = this.lttData.get("playersCount");
        this.rePlayersList(20);
        this.regisrterEvent();
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);    //切换后台
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
        this.scrollViewNode.node.on("scroll-to-bottom", this.updateList, this);
    },

    rePlayersList(dataCount, addTime) {
        console.log("最后一个玩家的uid", addTime)
        glGame.gameNet.send_msg("xydzpRoom.xydzpRoomHandler.getPlayerList", {
            addTime: addTime,
            count: dataCount,
        });
        glGame.panel.showRoomJuHua();
    },

    updateList() {
        this.total = this.lttData.get("playersCount");
        if (this.total <= this.content.childrenCount) return;
        this.rePlayersList(20, this.addTime);
    },

    oprGetPlayersList(msg) {
        console.log("玩家列表的回复数据", msg)
        glGame.panel.closeRoomJuHua();
        this.playersList = msg;
        if (this.playersList.length == 0) return
        this.addTime = this.playersList[this.playersList.length - 1].addTime;
        this.addItems();
        console.log("总的玩家列表数据", this.playersList)
    },

      //添加项
      addItems() {
        for (let i = 0; i < this.playersList.length; i++) {
            let item = cc.instantiate(this.itemPrefab);
            item.parent = this.content;
            item.active = true;
            let name = item.getChildByName("name");
            name.getComponent(cc.Label).string = this.playersList[i].nickname;
            let gold = item.getChildByName("gold");
            gold.getComponent(cc.Label).string = glGame.user.GoldTemp(this.playersList[i].gold);
            if (this.playersList[i].uid == this.lttData.get("myUid")) {
                name.color = cc.color(255, 0, 0);
                name.getComponent(cc.Label).string = glGame.user.isTourist() ? "游客" : this.playersList[i].nickname;
            }
        }
    },
    /**
     * 网络数据监听
     */
    regisrterEvent() {
        glGame.emitter.on("xydzpRoom.xydzpRoomHandler.getPlayerList", this.oprGetPlayersList, this);
    },
    unregisrterEvent() {
        glGame.emitter.off("xydzpRoom.xydzpRoomHandler.getPlayerList", this);
    },

    //绑定事件
    onClick(name, node) {
        switch (name) {
            case 'close': this.remove(); break;
        }
    },

    OnDestroy() {
        glGame.emitter.off("EnterBackground", this);    //切换后台
        glGame.emitter.off("EnterForeground", this);
        this.unregisrterEvent();
    },

    EnterBackground() {
        this.unregisrterEvent();
    },

    EnterForeground() {
        this.regisrterEvent();
    }
});

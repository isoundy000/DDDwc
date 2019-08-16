const lttDef = require("lttDef");
const lttConst = require("lttConst");
glGame.baseclass.extend({
    properties: {
        content: cc.Node,
        itemPrefab: cc.Prefab,
        bgSpr: [cc.SpriteFrame],
        historyList:cc.Node,
    },

    onLoad() {
        this.lttData = require("luckturntablelogic").getInstance();
        this.syncData();
        this.registerEvent();
    },

    registerEvent() {
        glGame.emitter.on(lttConst.globalEvent.onMidEnter, this.syncData, this);
        glGame.emitter.on(lttConst.globalEvent.showWinArea, this.showWinNumber, this);
    },

    unRegisterEvent() {
        glGame.emitter.off(lttConst.globalEvent.onMidEnter, this);
        glGame.emitter.off(lttConst.globalEvent.showWinArea, this);
    },

    syncData() {
        this.changehistoryList();
        let data = this.lttData.get("history") || [];
        let min = data.length >= 9 ? data.length - 9 : 0;
        let index = 0;
        for (let i = data.length - 1; i >= min; i--) {
            let node = this.historyList.children[index]
            node.getChildByName("label").getComponent(cc.Label).string = data[i];
            this.getBgColor(node, lttDef.judgeColor(data[i]));
            node.active = true;
            index++
        }
    },

    changehistoryList() {
        for (let i = 0; i < this.historyList.childrenCount; i++) {
            this.historyList.children[i].active = false;
        }
    },

    getBgColor(node, index) {
        switch (index) {
            case 0: node.color = cc.color(6, 15, 13); break;
            case 1: node.color = cc.color(63, 181, 33); break;
            case 2: node.color = cc.color(157, 0, 4); break;
        }
    },
    showWinNumber() {
        this.changehistoryList();
        let data = this.lttData.get("history") || [];
        let min = data.length >= 9 ? data.length - 9 : 0;
        let index = 0;
        for (let i = data.length - 1; i >= min; i--) {
            let node = this.historyList.children[index]
            node.getChildByName("label").getComponent(cc.Label).string = data[i];
            this.getBgColor(node,lttDef.judgeColor(data[i]));
            node.active = true;
            index++;
            cc.log("历史战绩",node.active,data[i])
        }
    },

    // update (dt) {},
    OnDestroy() {
        this.unRegisterEvent();
    }
});

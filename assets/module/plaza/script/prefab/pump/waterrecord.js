/**
 * 返水记录
 */
const status = {
    0: "审核中",
    1: "已发放",
    2: "自动发放",
    3: "审核未通过",
}

glGame.baseclass.extend({
    properties: {
        content: cc.Node,
        recorditem: cc.Node,
        noitem: cc.Node,
    },

    onLoad() {
        this.registerEvent();
        glGame.user.ReqRebateFlowRecord();
    },

    start() {

    },

    getColor(str) {
        let statusColor;
        switch (str) {
            case "审核中": statusColor = cc.color(255, 144, 0); break;
            case "已发放": statusColor = cc.color(0, 255, 0); break;
            case "自动发放": statusColor = cc.color(0, 255, 0); break;
            case "审核未通过": statusColor = cc.color(255, 0, 0); break;
            default:
                statusColor = cc.color(0, 255, 0); break;
        }
        return statusColor;
    },
    registerEvent() {
        glGame.emitter.on("updateReqRebateFlowRecord", this.updateReqRebateFlowRecord, this);
    },

    unRegisterEvent() {
        glGame.emitter.off("updateReqRebateFlowRecord", this);
    },

    updateReqRebateFlowRecord() {
        let list = glGame.user.get("userPumpRecord")[1].list;
        this.initUI(list);
    },
    initUI(list) {
        for (let i = 0; i < list.length; i++) {
            let node = cc.instantiate(this.recorditem);
            node.parent = this.content;
            node.active = true;
            node.getChildByName("time").getComponent(cc.Label).string = list[i].create_time;
            node.getChildByName("coin").getComponent(cc.Label).string = this.cutFloat(list[i].number);
            node.getChildByName("status").getComponent(cc.Label).string = list[i].state;
            node.getChildByName("status").color = this.getColor(list[i].state);
            node.getChildByName("bg").active = i % 2 == 0
        }
        this.noitem.active = list.length == 0
    },
    OnDestroy() {
        this.unRegisterEvent();
    },

    onClick(name, node) {
        switch (name) {
            case "close": return this.remove();
        }
    },

    //浮点型运算取俩位
    cutFloat(value) {
        return Number(value).div(100).toFixed(2).toString();
    },

});

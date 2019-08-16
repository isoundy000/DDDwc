const lttDef = require("lttDef");
const lttConst = require("lttConst");
glGame.baseclass.extend({
    properties: {
        bg: cc.Node,
        contentList: [cc.Node],
        numBg: [cc.SpriteFrame],
        item: cc.Node,
    },

    onLoad() {
        this.lttData = require("luckturntablelogic").getInstance();
        glGame.emitter.on(lttConst.globalEvent.onProcess, this.onProcess, this);
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
        glGame.emitter.on("refreshRecordUi", this.initContent, this);
        glGame.emitter.on("recordOpen", this.recordOpen, this);
        this.bg.getComponent(cc.Widget).updateAlignment();
        this.position = this.bg.position;
        this.nextPos = cc.v2(this.position.x + 417,this.position.y);
    },

    recordOpen() {
        this.recordPanelAction(2);
    },

    onProcess() {
        this.onProcessAction(false);
    },

    EnterBackground() {
        this.node.stopAllActions();
        this.bg.stopAllActions();
        this.bg.position = this.position;
    },

    EnterForeground() {
        this.onProcessAction(true);
    },

    onProcessAction(bool) {
        let curTime = this.lttData.getCurTime();
        let BetTime = (this.lttData.get("BetTime") - 1);
        let process = this.lttData.get("process");
        if (process == lttConst.process.chooseChip) {
            let DTY = curTime > BetTime ? curTime - BetTime : 0
            let delayTime = cc.delayTime(DTY);
            let cb = cc.callFunc(() => {
                this.recordPanelAction(2);
            })
            this.node.runAction(cc.sequence(delayTime, cb));
        } else if (process == lttConst.process.settleEffect) {
            this.recordPanelAction(1);
        } else {
            if (bool) this.recordPanelAction(1);
        }
    },

    onClick(ButtonName, ButtonNode) {
        switch (ButtonName) {
            case "btn_zoushiclose": this.recordPanelAction(1);; break;
            default: console.error("no find button name -> %s", name);
                break;
        }
    },

    recordPanelAction(state) {
        this.bg.stopAllActions();
        let moveTo;
        if (state == 1) {
            moveTo = cc.moveTo(0.3, this.position);
            this.bg.runAction(moveTo);
            glGame.emitter.emit("showZoushibtn", true);
        } else if (state == 2) {
            moveTo = cc.moveTo(0.3, this.nextPos);
            glGame.emitter.emit("showZoushibtn", false);
            this.bg.runAction(moveTo);
        }
    },

    getReIndex() {
        let index = 0;
        let process = this.lttData.get("process");
        let curtime = this.lttData.getMidCurTime();
        if (process == lttConst.process.settleEffect && curtime >= 4000) {
            index = 1;
            let dty = cc.delayTime(parseInt((curtime - 4000) / 1000));
            let cb = cc.callFunc(() => {
                this.initContent();
            });
            this.node.runAction(cc.sequence(dty, cb));
        };
        return index;
    },

    initContent() {
        let trendData = this.lttData.get("history");
        let induceData = this.lttData.induce();
        let length = this.contentList[0].childrenCount;
        let datalength = trendData.length - this.getReIndex();
        //判断是否要新增节点
        if (length < datalength) {
            for (let i = 0; i < (datalength - length); i++) {
                let curNode = cc.instantiate(this.item);
                curNode.parent = this.contentList[0];
                curNode.active = true;
            }
        } else {
            //7 10
            for (let i = datalength; this.contentList[0].children[i];) {
                this.contentList[0].children[i].removeFromParent();
            }
        }
        cc.log("走势的数据", induceData, trendData)
        //trendData.length = 10；subNumber：0  i = 10
        for (let i = 0; i < datalength; i++) {
            let curNode = this.contentList[0].children[i];
            if (!curNode) debugger
            curNode.getComponent(cc.Sprite).spriteFrame = this.numBg[lttDef.judgeColor(trendData[i])];
            curNode.getChildByName("value").getComponent(cc.Label).string = trendData[i];
        }

        for (let j = 0; j < 5; ++j) {
            let lblList = this.contentList[1].children[j].children;
            for (let k in induceData[j]) {
                lblList[parseInt(k) - 1].getComponent(cc.Label).string = `${this.lttData.handleNumber(induceData[j][k] / trendData.length * 100)}%`;
            }
        }
    },

    OnDestroy() {
        glGame.emitter.off(lttConst.globalEvent.onProcess, this);
        glGame.emitter.off("EnterBackground", this);
        glGame.emitter.off("EnterForeground", this);
        glGame.emitter.off("refreshRecordUi", this);
        glGame.emitter.off("recordOpen", this);
    },
    // update (dt) {},
});

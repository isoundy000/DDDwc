let CONFIGS = require("ddzconst");

glGame.baseclass.extend({

    properties: {
        displaySwitch: cc.Node,
        countNodes: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    registerEvent() {
        glGame.emitter.on(CONFIGS.CCEvent.onPlayCardResult, this.updateUI, this);
        glGame.emitter.on(CONFIGS.CCEvent.onProcess, this.onProcess, this);
        glGame.emitter.on(CONFIGS.CCEvent.onSyncData, this.onSyncData, this);

    },

    unRegisterEvent() {
        glGame.emitter.off(CONFIGS.CCEvent.onPlayCardResult, this);
        glGame.emitter.off(CONFIGS.CCEvent.onProcess, this);
        glGame.emitter.off(CONFIGS.CCEvent.onSyncData, this);
    },

    registerGlobalEvent() {
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
    },

    unRegisterGlobalEvent() {
        glGame.emitter.off("EnterBackground", this);
        glGame.emitter.off("EnterForeground", this);
    },

    EnterBackground() {
        this.backgroundState = true;
        this.unRegisterEvent();
    },

    EnterForeground() {
        if (this.backgroundState) {
            this.backgroundState = false;
            this.registerEvent();
        }
        let processSt = this.curLogic.get('process');
        if (processSt == CONFIGS.gameProcess.loop) {
            this.updateUI();
            this.node.active = true;
            // this.node.active = false;
            this.refreshNodePos();
            glGame.emitter.emit("refreshLordCardDisplay");
        }
    },

    OnDestroy() {
        this.unRegisterEvent();
        this.unRegisterGlobalEvent();
    },

    onSyncData() {
        let processSt = this.curLogic.get('process');
        if (processSt == CONFIGS.gameProcess.loop) {
            this.updateUI();
            this.node.active = true;
            // this.node.active = false;
            this.refreshNodePos();
            glGame.emitter.emit("refreshLordCardDisplay");
        }
    },

    onLoad() {
        this.curLogic = require("ddzlogic").getInstance()
        this.backgroundState = false;
        // this.node.active = false;
        this.updateUI();
        this.registerEvent();
        this.registerGlobalEvent();
    },

    onProcess() {
        let processSt = this.curLogic.get('process');
        if (processSt == CONFIGS.gameProcess.loop) {
            this.updateUI();
            this.node.active = true;
            // this.node.active = false;
            this.refreshNodePos();
            glGame.emitter.emit("refreshLordCardDisplay");
        }
    },

    refreshNodePos () {
        if (this.displaySwitch.getComponent(cc.Toggle).isChecked) {
            this.displaySwitch.position = cc.v2(-111, 300)
        } else {
            this.displaySwitch.position = cc.v2(135, 300)
        }
    },

    //出现牌的变动，调用该函数刷新记牌器数据
    updateUI() {
        let nodes = this.countNodes.children;
        let pokersData = this.curLogic.get('pokersRecord');
        for (let i = 0; i < nodes.length; i++) {
            let key = nodes[i].name;
            nodes[i].getComponent(cc.Label).string = pokersData[key];
            nodes[i].color = pokersData[key] == 0 ? cc.color(184, 169, 163) : cc.color(214, 73, 0);
        }
    },

    start() {

    },

    onClick(name, node) {
        switch (name) {
            case 'Background':
                this.curLogic.set("isRecordDisplay", this.displaySwitch.getComponent(cc.Toggle).isChecked);
                this.refreshNodePos();
                glGame.emitter.emit("refreshLordCardDisplay");
                break;
        }
    },

    // update (dt) {},
});

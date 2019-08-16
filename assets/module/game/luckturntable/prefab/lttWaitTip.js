let lttConst = require('lttConst');

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.lttData = require("luckturntablelogic").getInstance();
        glGame.emitter.on(lttConst.globalEvent.onProcess, this.onProcess, this);
    },

    onProcess() {
        if (this.lttData.get("process") == lttConst.process.chooseChip) {
            this.node.destroy();
        }
    },

    // update (dt) {},

    onDestroy() {
        glGame.emitter.off(lttConst.globalEvent.onProcess, this);
    }
});

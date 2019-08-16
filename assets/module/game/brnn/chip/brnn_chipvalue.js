let CONFIGS = require("brnn_const");
glGame.baseclass.extend({
    properties: {
        lab_roominfo: cc.Label,
    },
    onLoad() {
        this.curLogic = require("brnnlogic").getInstance();
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onEnterRoom, this.onEnterRoom, this);
        this._initChipArea();
    },
    start() {

    },
    _initChipArea() {
        let areaNum = 5;
        for (let i = 1; i < areaNum; i++) {
            let curNode = this.node.children[i];
            curNode.getComponent("brnn_chipArea").set("_areaIndex", i);
        }
    },
    onEnterRoom() {
        this.lab_roominfo.string = `百人牛牛  -  ${CONFIGS.roomType[this.curLogic.get("roomtype")]}  -  ${this.curLogic.get("roomid")}`
    },
    OnDestroy() {
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onEnterRoom, this);
    },
});

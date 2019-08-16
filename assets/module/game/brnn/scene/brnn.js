let CONFIGS = require("brnn_const");
glGame.baseclass.extend({

    properties: {
        BGM: {
            type: cc.AudioClip,
            default: null
        },
        prefab_roomAround: cc.Prefab,  //周围
        prefab_seat: cc.Prefab,        //座位
        prefab_clock: cc.Prefab,       //闹钟
        prefab_chipvalue: cc.Prefab,   //天玄地黄
        prefab_card: cc.Prefab,         //牌的位置
        prefab_settle: cc.Prefab,       //结算
        prefab_sixSeat: cc.Prefab,     //6人座位
        prefab_tip: cc.Prefab,
        prefab_chipAni: cc.Prefab,
        prefab_ERS: cc.Prefab,         //退出房间，设置，规则
        prefab_record: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        glGame.audio.playBGM(this.BGM);
        this.curLogic = require("brnnlogic").getInstance();
        this._install();
    },
    start() {
        //走势
        let recordPanel = glGame.panel.showPanel(this.prefab_record);
        recordPanel.zIndex = 20;
        //添加结算
        let settlePanel = glGame.panel.showPanel(this.prefab_settle);
        settlePanel.zIndex = 21;
    },
    _install() {
        //添加天玄地黄
        glGame.panel.showPanel(this.prefab_chipvalue)
        //添加闹钟
        glGame.panel.showPanel(this.prefab_clock)
        //添加房间周边
        glGame.panel.showPanel(this.prefab_roomAround)
        //添加卡牌
        glGame.panel.showPanel(this.prefab_card)
        //添加6位置
        glGame.panel.showPanel(this.prefab_sixSeat)
        //座位
        glGame.panel.showPanel(this.prefab_seat)
        //添加chipAni
        glGame.panel.showPanel(this.prefab_chipAni)
        //添加tip
        glGame.panel.showPanel(this.prefab_tip)
        //添加设置，退出房间，规则
        glGame.panel.showPanel(this.prefab_ERS)
        this.showNotice();
        // let scene = cc.director.getScene();
        // console.log('scene-------')
    },
    //(pos = cc.v2(700, 500), size = cc.size(600, 50))
    showNotice() {
        let size = cc.size(cc.winSize.width * 0.53, 30);
        let pos = cc.v2(cc.winSize.width * 0.5, 708);
        glGame.panel.showRollNotice(pos, size);
    },

    OnDestroy() {

    },

    // update (dt) {},
});

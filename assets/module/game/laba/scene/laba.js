
glGame.baseclass.extend({
    properties: {
        Lb_AwardExplain: cc.Prefab,
        Lb_Award: cc.Prefab,
        Lb_LeftFrame: cc.Prefab,
        Lb_MiddleFrame: cc.Prefab,
        Lb_RightFrame: cc.Prefab,
        Lb_SelectStrip: cc.Prefab,
        Lb_TopFrame: cc.Prefab,
        Lb_Setting: cc.Prefab,
        Lb_effect: cc.Prefab,
        BGM: {
            type: cc.AudioClip,
            default: null
        },
        sp_win: cc.Node,
    },

    onLoad() {
        glGame.panel.showRoomLoading();

        this.lbmgr = require("labalogic").getInstance();
        glGame.panel.showPanel(this.Lb_LeftFrame);
        glGame.panel.showPanel(this.Lb_MiddleFrame);
        glGame.panel.showPanel(this.Lb_RightFrame);
        glGame.panel.showPanel(this.Lb_TopFrame);
        glGame.panel.showPanel(this.Lb_effect);
        let size = cc.size(cc.winSize.width * 0.53, 30);
        let pos = cc.v2(cc.winSize.width * 0.5, 708);
        glGame.panel.showRollNotice(pos, size);
        glGame.scene.setNextSceneTag(glGame.scenetag.PLAZA);

        glGame.emitter.on("lb.openselect", this.openselect, this);
        glGame.emitter.on("lb.openawardexplain", this.openawardexplain, this);
        glGame.emitter.on("lb.awardshow", this.awardshow, this);
        glGame.emitter.on("lb.setting", this.setting, this);
        glGame.emitter.on("lb.hideWinSp", this.hideWinSp, this);
        glGame.emitter.on("lb.showWinSp", this.showWinSp, this);
        glGame.audio.playBGM(this.BGM);

        glGame.panel.closeLoading();
    },
    start() {
    },

    OnDestroy() {
        glGame.emitter.off("lb.openselect", this);
        glGame.emitter.off("lb.openawardexplain", this);
        glGame.emitter.off("lb.awardshow", this);
        glGame.emitter.off("lb.setting", this);
        glGame.emitter.off("lb.showWinSp", this);
        glGame.emitter.off("lb.hideWinSp", this);
        this.lbmgr.destroy();
    },
    //开启线条设置界面
    openselect() {
        glGame.panel.showPanel(this.Lb_SelectStrip);
    },
    //开启奖励说明界面
    openawardexplain() {
        glGame.panel.showPanel(this.Lb_AwardExplain);
    },
    //开启获胜界面
    awardshow() {
        glGame.panel.showPanel(this.Lb_Award);
    },
    //开启设置界面
    setting() {
        glGame.panel.showSetting();
    },

    showWinSp() {
        this.sp_win.active = true;
    },

    hideWinSp() {
        this.sp_win.active = false;
    },
});


glGame.baseclass.extend({
    properties: {
        label_award: cc.Label,
        sl_audio: {
            type: cc.AudioClip,
            default: null
        },
        win_font: cc.Font,
        sp_win: sp.Skeleton,
    },

    onLoad() {

        this.lbmgr = require("labalogic").getInstance();
        if (this.lbmgr.award_count != 0) {
            this.sp_win.node.active = true;
            // this.sp_win.setAnimation(0,'gxzj',false)
            // this.node.getChildByName("award_num").active = true;
            // this.node.getChildByName("btnClose").active = true;
            // this.node.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(()=>{this.awardshow()})));
            // this.label_award.string = "";
            this.actionShowClose();
            //播放结束音效
            glGame.audio.playSoundEffect(this.sl_audio);
        } else {
            this.btnClose();
        }
    },
    start() {
    },

    onClick(name, node) {
        switch (name) {
            case "btnClose": return this.btnClose();
            default: console.error("no find button name -> %s", name);
        }
    },
    //显示胜利分数
    awardshow() {
        this.label_award.font = this.win_font;
        this.label_award.string = "" + this.lbmgr.getFloat(this.lbmgr.award_count);
    },
    //显示结束时清理以及时间分发
    awardShowEnd() {
        // this.lbmgr.repeatInit();
        // glGame.emitter.emit("lb.stopstrip");
        // glGame.user.reqMyInfo();
        //glGame.emitter.emit("loginSuccess");
    },
    //设置延迟关闭界面
    actionShowClose() {
        this.node.runAction(cc.sequence(cc.delayTime(0), cc.callFunc(() => { this.awardShowEnd(); }), cc.removeSelf()));
    },
    btnClose() {
        this.awardShowEnd();
        this.remove();
    },
});

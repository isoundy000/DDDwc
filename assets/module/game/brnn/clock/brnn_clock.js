let CONFIGS = require("brnn_const");
glGame.baseclass.extend({

    properties: {
        label_time: cc.Label,
        sprite_bg: cc.Node,
        node_tip: cc.Node,
        ft_blue: cc.Font,
        ft_red: cc.Font,
        audio_countDown: {
            type: cc.AudioClip,
            default: null
        },
        spriteframe_state: [cc.SpriteFrame],
        spriteframe_BGstate: [cc.SpriteFrame],

        node_time: cc.Node,

        atlas_red: cc.SpriteAtlas,
        atlas_bule: cc.SpriteAtlas,
    },
    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this.intervalID = null;
        this.curLogic = require("brnnlogic").getInstance();
        this.regisrterEvent();
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onMidEnter, this.midEnter, this);
    },
    start() {

    },
    /**
   * 网络数据监听
   */
    regisrterEvent() {
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onProcess, this.onProcess, this);
    },
    unregisrterEvent() {
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onProcess, this);
    },
    onProcess() {
        let msg = this.curLogic.get("t_onProcess");
        if (msg.processType == CONFIGS.process.waitStart) {
            this.showTipState(2);
        }
        else if (msg.processType == CONFIGS.process.chooseChip) {
            this.startCountDown(false);
        } else if (msg.processType == CONFIGS.process.settleEffect) {
            this.clearCountDown();
            this.showTipState(1);
        }
    },
    showTipState(index) {
        this.node_tip.active = true;
        if (index == 2) {
            this.node_tip.getComponent(cc.Sprite).spriteFrame = this.spriteframe_state[2];
        } else if (index == 1) {
            this.node_tip.getComponent(cc.Sprite).spriteFrame = this.spriteframe_state[1];
        }
    },
    midEnter() {
        let msg = this.curLogic.get("t_onMidEnter");
        if (msg.processType == CONFIGS.process.waitStart) {
            this.showTipState(2);
        }
        else if (msg.processType == CONFIGS.process.chooseChip) {
            this.startCountDown(true);
        } else if (msg.processType == CONFIGS.process.settleEffect) {
            this.showTipState(1);
        }
    },

    // update (dt) {},
    startCountDown(bool) {
        let time = this.curLogic.getCurWaitTime();
        if (time > 0) {
            this.showCountDown(bool);
        }
    },

    //清除倒计时
    clearCountDown() {
        if (this.node_time.isValid) {
            this.sprite_bg.getComponent(cc.Sprite).spriteFrame = this.spriteframe_BGstate[0];
            this.node_time.active = false;
            this.node_time.stopAllActions();
        }
        clearInterval(this.intervalID);
        this.intervalID = null;
    },

    //显示倒计时        bool 是否断线重连
    showCountDown(bool) {
        let curTime = this.curLogic.getCurWaitTime();
        //倒计时特效
        let ScaTo = cc.scaleTo(0, 0.67);
        let ScaTo1 = cc.scaleTo(0.1, 0.75);
        let Dty = cc.delayTime(0.6);

        let ScaTo0 = cc.scaleTo(0, 0.75);
        let Dty1 = cc.delayTime(0.7);

        let FaTo = cc.fadeTo(0.3, 153);
        let ScaTo2 = cc.scaleTo(0.3, 1);

        let act1 = cc.sequence(ScaTo, ScaTo1, Dty, cc.spawn(FaTo, ScaTo2));
        let act2 = cc.sequence(ScaTo0, Dty1, cc.spawn(FaTo, ScaTo2));

        let beginBetTime = this.curLogic.get("BetTime") - CONFIGS.playCardTime - 1;
        if (curTime >= beginBetTime) {
            this.node_tip.active = true;
            this.node_tip.getComponent(cc.Sprite).spriteFrame = this.spriteframe_state[0];
        } else if (curTime < beginBetTime && curTime > 0) {
            this.node_time.active = true;
            this.node_tip.active = false;
            this.setCountDownState(curTime);
            this.node_time.scale = 0.75;
            this.node_time.opacity = 255;
            if (!bool) {
                this.node_time.runAction(act2);
            }
        }

        this.intervalID = setInterval(() => {
            curTime = this.curLogic.getCurWaitTime();
            if (curTime >= beginBetTime) {
                this.node_tip.active = true;
                this.node_tip.getComponent(cc.Sprite).spriteFrame = this.spriteframe_state[0];
            } else if (curTime < beginBetTime && curTime > 0) {
                this.node_time.active = true;
                this.node_tip.active = false;
                this.setCountDownState(curTime);
                this.node_time.stopAllActions();
                this.node_time.opacity = 255;
                this.node_time.runAction(curTime == beginBetTime - 1 ? act2 : act1);
            } else if (curTime <= 0) {
                this.clearCountDown();
            }
        }, 1000);
    },

    //渲染计时器状态
    setCountDownState(curTime) {
        let atlas = Number(curTime) > 5 ? this.atlas_bule : this.atlas_red;
        let str = curTime.toString()
        let arr = str.split("");
        this.node_time.children[0].active = false;
        this.node_time.children[1].active = false;
        for (let i = 0; i < arr.length; i++) {
            this.node_time.children[i].getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`${arr[i]}`);
            this.node_time.children[i].active = true;
        }
        this.sprite_bg.getComponent(cc.Sprite).spriteFrame = Number(curTime) > 5 ? this.spriteframe_BGstate[0] : this.spriteframe_BGstate[1];
        // this.label_time.getComponent(cc.Label).string = curTime;
        this.playCountDownAudio(curTime);
    },

    //播放倒计时音效
    playCountDownAudio(curTime) {
        if (curTime <= 5 && curTime > 1) {
            glGame.audio.playSoundEffect(this.audio_countDown[0]);
        } else if (curTime <= 1 && curTime > 0) {
            glGame.audio.playSoundEffect(this.audio_countDown[1]);
        }
    },

    OnDestroy() {
        this.node_time.stopAllActions()
        this.clearCountDown();
        this.unregisrterEvent();
        glGame.emitter.off("EnterBackground", this);
        glGame.emitter.off("EnterForeground", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onMidEnter, this);
    },
    EnterBackground() {
        this.unregisrterEvent();
        this.clearCountDown();
    },
    EnterForeground() {
        this.regisrterEvent();
        let msg = this.curLogic.get("t_onProcess");
        if (!msg) {
            msg = this.curLogic.get("t_onMidEnter");
        }
        if (msg.processType == CONFIGS.process.waitStart) {
            this.showTipState(2);
        }
        else if (msg.processType == CONFIGS.process.chooseChip) {
            this.startCountDown(true);
        } else if (msg.processType == CONFIGS.process.settleEffect) {
            this.showTipState(1);
        }
    }
});

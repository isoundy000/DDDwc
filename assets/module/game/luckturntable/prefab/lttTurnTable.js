const lttDef = require("lttDef");
const lttConst = require("lttConst");
const settleAngleList = [15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32];
const settleAniList = [35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12];
const rotateState = {
    normal: 0,
    start: 1,
    stop: 2,
}
const NumberState = {
    start: 1,
    stop: 2,
}
glGame.baseclass.extend({
    properties: {
        numberParent: cc.Node,
        table: cc.Node,
        needle: cc.Node,
        number: cc.Node,
        bigNumber: cc.Node,  //新增区域大转盘
        ballAnim: cc.Node,
        bigBallAnim: cc.Node,
        showArea: cc.Node,
        showNumberPanel: cc.Node,
        ballParent: cc.Node,
        bgSpr: [cc.SpriteFrame],

        _targetNumber: null,
        _subSpeed: 0,
        _totalAngle: 0,
        _rotateSpeed: 0,
        _rotateTime: 0,
    },

    onLoad() {
        this.audioMgr = cc.director.getScene().getChildByName("lttAudioMgr").getComponent("lttAudioMgr");
        this.lttData = require("luckturntablelogic").getInstance();
        this.registerEvent();
        this.registerGameEvent();
        this.numberState = NumberState.stop;
        this.isplayResultEff = false;
        this.needleState = this.needle.getComponent(cc.Animation).play();
    },

    registerEvent() {
        glGame.emitter.on(lttConst.globalEvent.onMidEnter, this.BrokenLineTurn, this);
        glGame.emitter.on(lttConst.clientEvent.onProcess, this.onProcess, this);
    },

    unRegisterEvent() {
        glGame.emitter.off(lttConst.globalEvent.onMidEnter, this);
        glGame.emitter.off(lttConst.clientEvent.onProcess, this);
    },

    registerGameEvent() {
        glGame.emitter.on('EnterBackground', this.enterBackground, this);
        glGame.emitter.on('EnterForeground', this.enterForeground, this);
    },

    onProcess() {
        let process = this.lttData.get("process");
        if (process == lttConst.process.settleEffect) {
            let dty = cc.delayTime(1);
            let cb = cc.callFunc(() => {
                this.turntable(6)
            })
            this.node.runAction(cc.sequence(dty, cb))
        }
    },

    enterBackground() {
        this.table.stopAllActions();
        this.node.stopAllActions();
        this.audioMgr.stopBallRotate();
        this.unRegisterEvent();

        this.ballAnim.getComponent(cc.Animation).stop();
        this.ballAnim.active = false;

        this.ballAnim.getComponent(cc.Animation).stop();
        this.ballAnim.active = false;
    },

    enterForeground() {
        this.registerEvent();
        this.isplayResultEff = false;
        this.BrokenLineTurn();
    },
    //[15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32];
    //改变静止转盘的角度
    changeBigNumber(node, value) {
        let list = settleAngleList;
        for (let i = 0; i < list.length; i++) {
            if (list[i] == Number(value)) {
                return node.angle = -(-i * 360 / 37);
            }
        }
    },

    //[35, 3, 26, 0, 32 , 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12];
    changeNumberAngle(value) {
        let list = settleAniList;
        for (let i = 0; i < list.length; i++) {
            if (list[i] == Number(value)) {
                this.ballParent.angle = -(i * 360 / 37);
                return;
            }
        }
    },

    update(dt) {
        if (this.numberState == NumberState.start) {
            this.setCurNumber();
        }
        this.numberParent.angle -= 60 * dt;
    },

    //大转盘停止的渲染
    stopAni(time) {
        //数字不再跳动
        this.numberState = NumberState.stop;
        this.needleState.speed = 1;

        //球的动画隐藏
        this._targetNumber = this.lttData.get("targetNumber");
        this.ballAnim.getComponent(cc.Animation).stop();
        this.ballAnim.active = false;
        this.bigBallAnim.getComponent(cc.Animation).stop();
        this.bigBallAnim.active = false;
        if (this._targetNumber || this._targetNumber == 0) {
            this.number.getChildByName(this._targetNumber.toString()).active = true;
            //关闭局部特写转盘
            this.changeBigNumber(this.bigNumber, this._targetNumber);
            this.bigNumber.getChildByName(this._targetNumber.toString()).active = true;
        }
        //停止结果变换
        this.showNumberPanel.getComponent(cc.Sprite).spriteFrame = this.bgSpr[lttDef.judgeColor(this._targetNumber)];
        this.showNumberPanel.getChildByName("label").getComponent(cc.Label).string = this._targetNumber;
        if (this.isplayResultEff) this.audioMgr.playResultEffect(this._targetNumber);

        if (time != 0) this.lttData.showWinArea();
        this.audioMgr.stopBallRotate();
        glGame.emitter.emit("refreshRecordUi");
    },

    //转盘转动
    turntable(time) {
        //开启转盘的状态
        if (time != 0) this.isplayResultEff = true

        this.setCurNumber();
        this.ballAnim.active = true;
        this.ballAnim.getComponent(cc.Animation).play("ballRotate", 6 - time);
        this.bigBallAnim.active = true;
        this.bigBallAnim.getComponent(cc.Animation).play("bigBallRotate", 6 - time);
        this.audioMgr.playBallRotate();

        if (this._targetNumber || this._targetNumber == 0) {     //碰到服务端拿不到targetNumber,加个防错
            this.number.getChildByName(this._targetNumber.toString()).active = false;
            this.bigNumber.getChildByName(this._targetNumber.toString()).active = false;
        }

        this._targetNumber = this.lttData.get("targetNumber");
        if (time == 6) {
            this.changeNumberAngle(this._targetNumber);
        }
        this.changeBigNumber(this.bigNumber, this._targetNumber);
        this.numberState = NumberState.start;
        let rounds = parseInt(time / 6 * 4);
        this.number.angle = 0;
        // let rotateBy1 = cc.rotateBy(time + 1, 360 * rounds);  //这里time+1受到easeQuarticActionOut的影响，不然转盘会提前1秒停下
        // let rotateBy = cc.rotateBy(time + 1, 360 * rounds);

        let rotateBy1 = cc.rotateBy(cc.sys.isNative ? time : time + 1, 360 * rounds);  //这里time+1受到easeQuarticActionOut的影响，不然转盘会提前1秒停下
        let rotateBy = cc.rotateBy(cc.sys.isNative ? time : time + 1, 360 * rounds);

        this.bigNumber.runAction(rotateBy1).easing(cc.easeQuarticActionOut());
        this.number.runAction(rotateBy).easing(cc.easeQuarticActionOut());
        this.needleState.speed = 2;

        let dty = cc.delayTime(time);
        let cb = cc.callFunc(() => {
            this.stopAni(time);                         //停止动画渲染
        })
        this.node.runAction(cc.sequence(dty, cb));

        if (time != 0) {
            let dty1 = cc.delayTime(time - 0.75);
            let cb1 = cc.callFunc(() => {
                this.audioMgr.playEffect("luozi");
            })
            this.node.runAction(cc.sequence(dty1, cb1));
        }
    },

    //断线重连
    BrokenLineTurn() {
        this.initTurnState();
        let process = this.lttData.get("process"),
            target = this.lttData.get("targetNumber");
        if (process == null || !target) return;
        this._targetNumber = target;

        if (process == lttConst.process.settleEffect) {
            let curTime = this.lttData.getCurTime();
            if (curTime > 4) {
                if (curTime > 10) {         //大于流程10秒，就是在播放结束下注动画，此时需要等待动画播完
                    let dty = cc.delayTime(curTime - 10);
                    let cb = cc.callFunc(() => {
                        curTime = this.lttData.getCurTime();
                        this.turntable(6);  //继续转
                    })
                    this.node.runAction(cc.sequence(dty, cb));
                } else {
                    this.turntable(curTime - 4);  //继续转
                }
            } else {
                this.stopAni(0);             //渲染停止动画
            }
        } else {
            this.stopAni(0);
        }
    },

    /**
     * 初始化转盘状态:
     * 球动画停止。球隐藏
     * 大球动画停止，大球隐藏
     * 转盘上的小白球全隐藏
     */
    initTurnState() {
        this.ballAnim.getComponent(cc.Animation).stop();
        this.ballAnim.active = false;
        this.bigBallAnim.getComponent(cc.Animation).stop();
        this.bigBallAnim.active = false;
        for (let i = 0; i < this.number.childrenCount; i++) {
            this.number.children[i].active = false;
        }
    },

    //在转的时候取得转盘白球在转盘的位置（只有转盘在转的时候才去渲染）
    setCurNumber() {
        let rotation_number = this.number.angle % 360;       //轮盘的角度
        let rotation_ani = this.ballAnim.angle % 360;        //白球位置的角度
        let rotation = rotation_ani - rotation_number;          //角度差

        let index, curNumber;
        //角度为正的，直接算是那个数字，角度为负的，就用37-|index|；
        if (rotation >= 0) {
            index = Math.ceil(rotation % (360 / 37));
        } else {
            index = 37 - Math.ceil(Math.abs(rotation) % (360 / 37))
        }
        curNumber = settleAniList[index];
        if (curNumber == Number(this.showNumberPanel.getChildByName("label").getComponent(cc.Label).string)) return

        this.showNumberPanel.getComponent(cc.Sprite).spriteFrame = this.bgSpr[lttDef.judgeColor(curNumber)];
        this.showNumberPanel.getChildByName("label").getComponent(cc.Label).string = curNumber;
    },

    OnDestroy() {
        this.table.stopAllActions();
        this.unRegisterEvent();
        glGame.emitter.off('EnterBackground', this);
        glGame.emitter.off('EnterForeground', this);
    }
});

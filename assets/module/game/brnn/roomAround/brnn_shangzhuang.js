let CONFIGS = require("brnn_const");
glGame.baseclass.extend({
    properties: {
        btn_zhuangjia: cc.Node,
        list_sprite: [cc.SpriteFrame],   //0申请上，1无法，2下庄，3退出
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        //----------变量声明
        this.dealerList = null;
        this._dealerUid = null;
        this._myUid = null;
        this.minGold = null;

        this.curLogic = require("brnnlogic").getInstance();
        this.registrterEvenet();
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);    //切换后台
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.updateInfo, this.updateBtnTip, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onMidEnter, this.onMidEnter, this);           //进度通知
        this.ani_node = new cc.Node;
        this.ani_node.parent = this.node.parent;
    },

    start() {

    },
    //网络监听
    registrterEvenet() {
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onConfirmGrab, this.onConfirmGrab, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.OnPlayerOp, this.OnPlayerOp, this); //玩家列表
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onProcess, this.onProcess, this);
    },
    unregisrterEvent() {
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onConfirmGrab, this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.OnPlayerOp, this); //玩家列表
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onProcess, this);            //进度通知
    },
    //改变玩家信息
    /**
     * 改变按钮提示
     * 庄家是自己，显示下庄
     * 庄家不是自己，有无法上庄、退出队列、上庄三种情况
     */
    //更改按钮显示
    updateBtnTip() {
        cc.log("更改按钮显示2", this.node.active)
        this.node.active = true;
        //如果我是庄家
        if (this._dealerUid == this._myUid) {
            cc.log("更改按钮显示11", this.node.active)
            this.btn_zhuangjia.getComponent(cc.Button).interactable = true;
            this.btn_zhuangjia.getComponent(cc.Sprite).spriteFrame = this.list_sprite[2];

        } else {  //我不是庄家
            this.dealerList = this.curLogic.get("grabList");
            if (this.dealerList) {//我在庄家列表中
                for (let i = 0; i < this.dealerList.length; i++) {
                    if (this.dealerList[i].uid == this._myUid) {
                        this.btn_zhuangjia.getComponent(cc.Button).interactable = true;
                        this.btn_zhuangjia.getComponent(cc.Sprite).spriteFrame = this.list_sprite[3];
                        return;
                    }
                }
            }
            //我不在上庄列表中，且我钱够
            if (this.curLogic.get("myGold") >= this.minGold) {
                this.btn_zhuangjia.getComponent(cc.Button).interactable = true;
                this.btn_zhuangjia.getComponent(cc.Sprite).spriteFrame = this.list_sprite[0];

            } else {//我不在上庄列表中，且我钱不够
                this.btn_zhuangjia.getComponent(cc.Sprite).spriteFrame = this.list_sprite[1];
            }
        }
    },
    // 重写父类按钮点击事件
    onClick(name, node) {
        switch (name) {
            case "btn_shangzhuang": this.zhuangjia_cb(); break;
            default: console.error("no find button name -> %s", name);
        }
    },
    //上庄按钮点击回调
    zhuangjia_cb() {
        this._dealerUid = this.curLogic.get("dealerUid");
        //如果系统为庄家
        if (this._dealerUid == 0) {
            if (this.curLogic.get("myGold") >= this.minGold) {//如果我的钱够，这时候显示的是退出队列
                this._dealerList = this.curLogic.get("grabList");
                if (this._dealerList) {//如果我在上庄列表中
                    for (let i = 0; i < this._dealerList.length; i++) {
                        if (this._dealerList[i].uid == this._myUid) {
                            //我在上庄队列中，发送退出队列信息
                            cc.log("点击了退出队列");
                            this.curLogic.reqExitGrabList();
                            glGame.emitter.emit("showTip", 10);
                            return;
                        }
                    }
                }
                //发送上庄消息
                this.curLogic.reqGrabDealer();
            } else {
                //弹出上庄失败tip
                this.showFailTip();
                return;
            }
        }
        //如果玩家为庄家
        else {
            //如果我是庄家
            if (this._dealerUid == this._myUid) {
                //发送下庄消息
                cc.log("发送下庄请求")
                this.curLogic.reqCancelDealer();
            } else {//如果我不是庄家
                this._dealerList = this.curLogic.get("grabList")
                if (this._dealerList) {
                    for (let i = 0; i < this._dealerList.length; i++) {
                        if (this._dealerList[i].uid == this._myUid) {
                            //我在上庄队列中，发送退出队列信息
                            cc.log("点击了退出队列");
                            this.curLogic.reqExitGrabList();
                            return;
                        }
                    }
                }
                //如果我没在上庄列表中，且金钱足够
                if (this.curLogic.get("myGold") >= this.minGold) {
                    //发送上庄消息
                    cc.log("别人钱够且在上庄了")
                    this.curLogic.reqGrabDealer();
                } else {
                    //弹出上庄失败tip
                    this.showFailTip();
                    return;
                }
            }
        }
    },
    showFailTip() {
        glGame.emitter.emit("showTip", 7);
    },

    //改变流程，更新按钮
    onProcess() {
        let msg = this.curLogic.get("t_onProcess");
        if (msg.processType == CONFIGS.process.chooseChip) {
            this.updateBtnTip();
        }
    },
    onMidEnter() {
        this.minGold = this.curLogic.get("roomInfo").BankerMoney;
        this._myUid = this.curLogic.get("myUid");
        this._dealerUid = this.curLogic.get("dealerUid");
        this.updateBtnTip();
    },
    //确认庄家
    onConfirmGrab() {
        let msg = this.curLogic.get("t_onConfirmGrab");
        this._dealerUid = msg.dealerUid;
        this.updateBtnTip();            //开牌阶段随意变
        cc.log("wwwww确认庄家");
    },

    OnPlayerOp(msg) {
        if (msg.oprType == CONFIGS.oprEvent.oprCancelDealer) {
            glGame.emitter.emit("showTip", 4);
            this.node.active = false;
        } else if (msg.oprType == CONFIGS.oprEvent.oprExitGrabList) {
            this.btn_zhuangjia.getComponent(cc.Button).interactable = true;
            this.btn_zhuangjia.getComponent(cc.Sprite).spriteFrame = this.list_sprite[0];
            glGame.emitter.emit("showTip", 10);
        } else if (msg.oprType == CONFIGS.oprEvent.oprChooseGrab) {
            this.btn_zhuangjia.getComponent(cc.Button).interactable = true;
            this.btn_zhuangjia.getComponent(cc.Sprite).spriteFrame = this.list_sprite[3];
            glGame.emitter.emit("showTip", 8);
        }
    },
    // update (dt) {},
    OnDestroy() {
        this.ani_node.stopAllActions();
        this.ani_node.destroy();
        this.unregisrterEvent();
        glGame.emitter.off("EnterBackground", this);    //切换后台
        glGame.emitter.off("EnterForeground", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onMidEnter, this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.updateInfo, this);
    },
    EnterBackground() {
        this.unregisrterEvent();
    },
    EnterForeground() {
        this.registrterEvenet();
        let process = this.curLogic.get("t_onProcess");
        if (!process) {
            process = this.curLogic.get("t_onMidEnter");
        }
        if (process.processType == CONFIGS.process.chooseChip) {
            this.updateBtnTip();
        }
    }
});

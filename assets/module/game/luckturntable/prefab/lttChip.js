const lttDef = require("lttDef");
const lttConst = require("lttConst");

glGame.baseclass.extend({

    init(obj) {
        this.lttData = require("luckturntablelogic").getInstance();
        this.pool = obj.pool;
        this.chipType = obj.type;

        this.node.getComponent(cc.Sprite).spriteFrame = obj.sprf;
        // this.lttData.setChipNumber(obj.num, this.node.getChildByName("number"));
    },

    reuse(obj, areaPanel) {
        this.registerEvent();
        glGame.emitter.on('EnterBackground', this.enterBackground, this);
        glGame.emitter.on('EnterForeground', this.enterForeground, this);
        this.betNumber = obj.betNumber;
        this.isMine = obj.isMine;
        this.betData = lttDef.betList[`bet_${this.betNumber}`].number;

        this.areaPanel = areaPanel;

        this.isEnd = false;
        this.node.opacity = 255;
    },

    unuse() {
        this.OnDestroy();
    },

    registerEvent() {
        glGame.emitter.on(lttConst.globalEvent.clearBet, this.clearBet, this);
        glGame.emitter.on(lttConst.globalEvent.changeChipView, this.changeChipView, this);
        glGame.emitter.on(lttConst.globalEvent.onProcess, this.onProcess, this);
        glGame.emitter.on(lttConst.globalEvent.onMidEnter, this.syncProcess, this);
    },

    unRegisterEvent() {
        glGame.emitter.off(lttConst.globalEvent.clearBet, this);
        glGame.emitter.off(lttConst.globalEvent.changeChipView, this);
        glGame.emitter.off(lttConst.globalEvent.onProcess, this);
        glGame.emitter.off(lttConst.globalEvent.onMidEnter, this);

    },

    onProcess() {
        let process = this.lttData.get("process");
        let curtime = this.lttData.getMidCurTime();
        if (process == lttConst.process.settleEffect) {
            let dty = cc.delayTime((curtime - 2600) / 1000);
            let cb = cc.callFunc(() => {
                this.comeBack();
            })
            this.node.runAction(cc.sequence(dty, cb));
        }
    },

    //断线重连，筹码销毁
    syncProcess() {
        this.pool.put(this.node)
    },

    //断线重连渲染
    recovery() {
        this.endPos = this.areaPanel.children[this.betNumber].position;
        let ox = Math.random() > 0.5 ? 1 : -1;
        let oy = Math.random() > 0.5 ? 1 : -1;
        let OffsetX = ox * (Math.random() * 8) + 12;
        let OffsetY = oy * (Math.random() * 8) + 12;
        this.node.x = this.endPos.x + OffsetX;
        this.node.y = this.endPos.y + OffsetY;
        this.node.opacity = this.isMine == 0 ? 255 : 0;
        let num = Math.random(1);
        let isPositive = num > 0.5 ? 1 : -1;
        let num1 = Math.random(1) * 360;
        this.node.angle = isPositive * num1;
        this.isEnd = true;
        let process = this.lttData.get("process");
        let curtime = this.lttData.getMidCurTime();
        if (process == lttConst.process.settleEffect) {
            if (curtime >= 2600) {
                curtime = (curtime - 2600) / 1000;
                let dty = cc.delayTime(curtime);
                let cb = cc.callFunc(() => {
                    this.comeBack();
                })
                this.node.runAction(cc.sequence(dty, cb));
            }
        }
    },

    //位置是相对与筹码父节点的。但是其他玩家和自己头像节点的父节点不是在下注区域，所以目前是手动的
    //自己的位置-762-302        其他人  569,314       系统赢 -571,101    chip的父节点是betArea。chippanel 
    //富人榜的位置 1： 17, 256             2:  206,256                3:399,256
    getPostion(index) {
        let pos = cc.v2(0, 0);
        switch (index) {
            case 0: pos.x = -762, pos.y = -302; break
            case 1: pos.x = -164, pos.y = 270; break
            case 2: pos.x = 23, pos.y = 270; break
            case 3: pos.x = 220, pos.y = 270; break
            case 10: pos.x = -749, pos.y = 114; break
            case 99: pos.x = 390, pos.y = 323; break
        }
        if (index == 10) {
            let dir = Math.random() > 0.5 ? 1 : -1;
            let offY = 30 * Math.random() * dir;
            dir = Math.random() > 0.5 ? 1 : -1;
            let offX = 30 * Math.random() * dir;
            pos.x += offX;
            pos.y += offY;
        }
        return pos;
    },

    //下注的时候
    goOut() {
        this.endPos = this.areaPanel.children[this.betNumber].position;

        this.node.position = this.getPostion(this.isMine);
        let ox = Math.random() > 0.5 ? 1 : -1;
        let oy = Math.random() > 0.5 ? 1 : -1;
        let OffsetX = ox * (Math.random() * 8);
        let OffsetY = oy * (Math.random() * 8);
        let moveTo = cc.moveTo(0.3, cc.v2({ x: this.endPos.x + OffsetX, y: this.endPos.y + OffsetY }));
        let num = Math.random(1);
        let isPositive = num > 0.5 ? 1 : -1;
        let num1 = Math.random(1) * 360;
        let rotateBy = cc.rotateBy(0.3, isPositive * num1);
        let moveCb = cc.callFunc(() => {
            this.isEnd = true;
        });
        let fadeOut = cc.fadeOut(1);
        if (this.isMine == 0) {
            this.node.runAction(cc.sequence(cc.spawn(moveTo, rotateBy), moveCb));
        } else {
            this.node.runAction(cc.sequence(cc.spawn(moveTo, rotateBy), moveCb, fadeOut));
        }
    },

    //庄家赔钱到区域    
    toArea() {
        this.endPos = this.areaPanel.children[this.betNumber].position;
        this.node.position = this.getPostion(10);
        let ox = Math.random() > 0.5 ? 1 : -1;
        let oy = Math.random() > 0.5 ? 1 : -1;
        let OffsetX = ox * (Math.random() * 8);
        let OffsetY = oy * (Math.random() * 8);
        let moveTo = cc.moveTo(0.4, cc.v2({ x: this.endPos.x + OffsetX, y: this.endPos.y + OffsetY }));
        let moveCb = cc.callFunc(() => {
            this.isEnd = true;
        });
        let DTY = cc.delayTime(0.1);
        let DTYCB = cc.callFunc(() => {
            this.toPlayer();    //回收的是庄家赔付的筹码
        })
        this.node.runAction(cc.sequence(moveTo, moveCb, DTY, DTYCB));
    },

    //区域飞往玩家
    toPlayer() {
        this.node.opacity = 255;
        let pos = this.getPostion(this.isMine);
        let moveto = cc.moveTo(0.4, pos);
        let dty = cc.delayTime(0.1);
        let cb = cc.callFunc(() => { this.pool.put(this.node) });
        this.node.runAction(cc.sequence(moveto, dty, cb));
    },

    //结算回收的时候    回收的是本金的筹码
    comeBack() {
        if (this.checkWinOrFail()) {
            this.node.opacity = 255;
            let dty = cc.delayTime(1);
            let cb1 = cc.callFunc(() => {
                this.toPlayer();
            })
            this.node.runAction(cc.sequence(dty, cb1))
        } else {
            this.node.opacity = 255;
            let pos = this.getPostion(10)
            this.node.runAction(cc.sequence(cc.moveTo(0.5, pos), cc.callFunc(() => { this.pool.put(this.node); })));
        }
    },

    checkWinOrFail() {
        let targetNumber = this.lttData.get("targetNumber");
        return this.betData.indexOf(targetNumber) >= 0 ? true : false;
    },

    clearBet() {
        if (this.isMine == 0) {
            let pos = this.getPostion(0)
            let clearMove = cc.moveTo(0.3, pos);
            let CB = cc.callFunc(() => { this.pool.put(this.node); });
            this.node.runAction(cc.sequence(clearMove, CB));
        }
    },

    changeChipView() {
        if (this.isEnd && this.isMine != 0) {
            this.node.opacity = this.lttData.get('showOtherChip') ? 255 : 0;
        }
    },

    enterBackground() {
        this.node.stopAllActions();
    },
    enterForeground() {
        //筹码销毁
        this.pool.put(this.node)
    },
    // update (dt) {},

    OnDestroy() {
        this.node.stopAllActions();
        this.unRegisterEvent();
        glGame.emitter.off('EnterBackground', this);
        glGame.emitter.off('EnterForeground', this);
    }
});

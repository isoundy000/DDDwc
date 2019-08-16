let CONFIGS = require("brnn_const");
glGame.baseclass.extend({

    properties: {
        font_win: cc.Font,
        font_lost: cc.Font,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.score = [];
        this.curLogic = require("brnnlogic").getInstance();
        this.regisrterEvent();
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onMidEnter, this.midEnter, this);
        this.pushSixScorePos();
        this.settleInfo = null;
        this.isShowRichScore = false;
    },

    start() {
        this.pushSixPos();
    },
    pushSixPos() {
        for (let i = 0; i < this.node.childrenCount; i++) {
            let pos = this.node.children[i].position;
            this.curLogic.setSixPos(pos);
        }
    },
    //push进去6个分数节点，用于还原分数节点位置
    pushSixScorePos() {
        for (let i = 0; i < this.node.childrenCount; i++) {
            let index;
            i > 2 ? index = 2 : index = 3;    //因为富人榜前三位多了一个节点
            let pos = this.node.children[i].children[index].position;
            this.score.push(pos);
        }
    },
    //更新富人榜信息
    updateInfo() {
        let _richList = this.curLogic.getT_richList();
        if (!_richList) return;
        let richData;
        // let length = _richList.length>6?6:_richList.length;       //最长为6，最短为富人榜长度
        for (let i = 0; i < 6; i++) {
            let node = this.node.children[i];
            richData = _richList[i];
            if (richData) {
                if (richData.uid == this.curLogic.get("myUid")) {
                    continue;
                }
                node.active = true
                let sprite = this.node.children[i].children[0];
                let url = richData.headurl;
                glGame.panel.showHeadImage(sprite, url)
                node.getChildByName("id").getComponent(cc.Label).string = richData.nickname;
                node.name = richData.uid.toString();
            } else {
                node.active = false;
            }
        }
    },
    //显示富人榜金币动画
    showRichScore() {
        if (this.isShowRichScore) return;
        let info = this.curLogic.getT_listRichInfo();
        let length = info.length > 6 ? 6 : info.length;       //最长为6，最短为富人榜长度
        for (let i = 0; i < length; i++) {
            let node = this.node.children[i].getChildByName("score");
            let score = info[i].settleGold;
            if (score == 0) {
                continue;
            }
            node.getComponent(cc.Label).string = this.curLogic.getNumber(score);
            this._setFont(node, score);
            node.active = true;
            let moveH = cc.moveBy(0.5, cc.v2(0, 80))
            node.runAction(moveH);
        }
        this.isShowRichScore = true;
    },

    //设置字体
    _setFont(node, score) {
        if (score > 0) {
            node.getComponent(cc.Label).font = this.font_win;
            node.getComponent(cc.Label).string = "+" + node.getComponent(cc.Label).string;
        } else {
            node.getComponent(cc.Label).font = this.font_lost
        }
    },

    /**
    *网络数据监听
    */
    regisrterEvent() {
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onRichListChange, this.onRichListChange, this); //座位发生了改变
        glGame.emitter.on(CONFIGS.logicGlobalEvent.settleEffect, this.onSettle, this);
        glGame.emitter.on("showBetAni", this.showBetAni, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onProcess, this.onProcess, this);
    },
    unregisrterEvent() {
        glGame.emitter.off(CONFIGS.logicGlobalEvent.settleEffect, this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onRichListChange, this); //座位发生了改变
        glGame.emitter.off("showBetAni", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onProcess, this);
    },
    midEnter() {
        this.updateInfo();
    },

    onProcess() {
        let msg = this.curLogic.get("t_onProcess");
        if (msg.processType == CONFIGS.process.chooseChip) {
            this.hideScore();
        }
    },

    hideScore() {
        let info = this.curLogic.getT_listRichInfo();
        let length = info.length > 6 ? 6 : info.length;       //最长为6，最短为富人榜长度
        for (let i = 0; i < length; i++) {
            this.node.children[i].getChildByName("score").active = false;
            this.node.children[i].getChildByName("score").position = this.score[i];
        }
    },
    //显示富人榜下注的动画
    showBetAni(uid) {
        for (let i = 0; i < this.node.childrenCount; i++) {
            if (Number(uid) == Number(this.node.children[i].name)) {
                this.node.children[i].stopAllActions();
                let sixPos = this.curLogic.get("sixPos");
                let moveto1, moveto2;
                if (i < 3) {
                    moveto1 = cc.moveTo(0.25, cc.v2(sixPos[i].x + 50, sixPos[i].y));
                } else {
                    moveto1 = cc.moveTo(0.25, cc.v2(sixPos[i].x - 50, sixPos[i].y));
                }
                moveto2 = cc.moveTo(0.25, sixPos[i]);
                this.node.children[i].runAction(cc.sequence(moveto1, moveto2));
            }
        }

    },
    //----------
    /**
* 设置头像
* @param {headSprite} 头像sprite组件
* @param {url} 图片url
*/
    setSeatHeadUrl(headSprite, url) {
        if (!url) { cc.log('url不存在'); return };
        glGame.loader.remoteLoad(url).then(data => {
            headSprite.spriteFrame = data;
        })
    },
    //富人榜
    onRichListChange() {
        this.updateInfo();
    },
    //结算信息
    onSettle() {
        let DTY = cc.delayTime(7)
        let cb = cc.callFunc(() => {
            this.isShowRichScore = false;
            this.showRichScore()
        });
        this.node.runAction(cc.sequence(DTY, cb));
    },

    OnDestroy() {
        this.node.stopAllActions();
        this.unregisrterEvent();
        glGame.emitter.off("EnterBackground", this);
        glGame.emitter.off("EnterForeground", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onMidEnter, this);
    },
    EnterBackground() {
        this.node.stopAllActions();
        for (let i = 0; i < 6; i++) {
            let index;
            i > 2 ? index = 2 : index = 3;    //因为富人榜前三位多了一个节点
            let node = this.node.children[i].children[index];
            node.stopAllActions();
            node.active = false;
        }
        this.unregisrterEvent();
    },
    EnterForeground() {
        this.regisrterEvent();
        this.updateInfo();
        this.hideScore();
        let process = this.curLogic.get("t_onProcess");
        if (!process) {
            process = this.curLogic.get("t_onMidEnter");
        }
        //显示富人榜分数动画
        if (process.processType == CONFIGS.process.settleEffect) {
            let curTime = this.curLogic.getMidEnterWaitTime();
            if (curTime - 1000 >= 0) {
                let delayTime = cc.delayTime((curTime - 1000) / 1000);
                let cb = cc.callFunc(() => {
                    this.isShowRichScore = false;
                    this.showRichScore()
                });
                this.node.runAction(cc.sequence(delayTime, cb));
            }
        }
    },

    // update (dt) {},
});

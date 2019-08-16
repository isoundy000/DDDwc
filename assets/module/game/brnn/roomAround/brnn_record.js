let CONFIGS = require("brnn_const");
glGame.baseclass.extend({

    properties: {
        bg: cc.Node,
        spriteFrame_win: cc.SpriteFrame,
        spriteFrame_lose: cc.SpriteFrame,

        prefab_item: cc.Node,
        prefab_itemValue: cc.Node,
        content: cc.Node,
        tianCout: cc.Label,
        diCout: cc.Label,
        xuanCout: cc.Label,
        huangCout: cc.Label,
        count: cc.Label,
        btn_zoushiClose: cc.Node,

        record_scorllview: cc.ScrollView,

        sp_waikuang: cc.Node,
    },
    onLoad() {
        this.waikuang = null;
        this.tianAreaCount = 0;
        this.diAreaCount = 0;
        this.xuanAreaCount = 0;
        this.huangAreaCount = 0;
        this.curLogic = require("brnnlogic").getInstance();
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onProcess, this.onProcess, this);
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
        glGame.emitter.on("refreshRecordUi", this.refreshUi, this);
        glGame.emitter.on("recordOpen", this.recordOpen, this);
    },

    start() {

    },

    recordOpen() {
        this.recordPanelAction(2);
    },

    onProcess() {
        this.onProcessAction(false);
    },

    EnterBackground() {
        this.node.stopAllActions();
        this.bg.stopAllActions();
        this.bg.position = cc.v2(0, 475)
    },
    EnterForeground() {
        this.onProcessAction(true);
    },

    onProcessAction(bool) {
        let curTime = this.curLogic.getCurWaitTime();
        let BetTime = (this.curLogic.get("BetTime") - CONFIGS.playCardTime - 1);
        let msg = this.curLogic.get("t_onProcess") || this.curLogic.get("t_onMidEnter");
        if (msg.processType == CONFIGS.process.chooseChip) {
            let DTY = curTime > BetTime ? curTime - BetTime : 0
            let delayTime = cc.delayTime(DTY);
            let cb = cc.callFunc(() => {
                this.recordPanelAction(2);
            })
            this.node.runAction(cc.sequence(delayTime, cb));
        } else if (msg.processType == CONFIGS.process.settleEffect) {
            this.recordPanelAction(1);
        } else {
            if (bool) this.recordPanelAction(1);
        }
    },

    // 重写父类按钮点击事件
    onClick(name, node) {
        switch (name) {
            case "btn_zhoushiclose": this.recordPanelAction(1); break;
            case "btn_zoushiopen": this.recordPanelAction(2); break;
            default: console.error("no find button name -> %s", name);
                break;
        }
    },

    recordPanelAction(state) {
        this.bg.stopAllActions();
        let moveTo;
        if (state == 1) {
            moveTo = cc.moveTo(0.5, cc.v2(0, 475));
            this.bg.runAction(moveTo);
        } else if (state == 2) {
            this.record_scorllview.stopAutoScroll();
            this.record_scorllview.scrollToRight(0);
            this.gameTrend = this.curLogic.get("t_RoomRecord")
            if (!this.gameTrend) return;
            moveTo = cc.moveTo(0.5, cc.v2(0, 280));
            this.bg.runAction(moveTo);
        }
    },

    //刷新界面
    refreshUi() {
        this.gameTrend = this.curLogic.get("t_RoomRecord")
        if (!this.gameTrend) return;
        let msg = this.curLogic.get("t_onProcess");
        if (msg) {
            if (msg.processType == CONFIGS.process.settleEffect) {
                let DTY;
                let time = this.curLogic.getCurWaitTime();
                DTY = time >= 5 ? time - 5 : 0;
                if (DTY != 0) {
                    this.updateRecord(this.gameTrend, true);
                }
                let delayTime = cc.delayTime(DTY);
                let callFunc = cc.callFunc(() => { this.updateRecord(this.gameTrend, false) });
                this.node.runAction(cc.sequence(delayTime, callFunc));
            } else {
                this.updateRecord(this.gameTrend, false);
            }
        } else {
            this.updateRecord(this.gameTrend, false);
        }
    },

    updateRecord(_gameTrend, bool) {
        this.clearAreaCout();
        this.initUI(_gameTrend, bool);
    },

    initUI(_gameTrend, bool) {
        let length = _gameTrend.length;
        if (this.waikuang) {
            this.waikuang.removeFromParent();
            this.waikuang = null;
        }
    
        let Count = this.content.childrenCount;
        if (length > Count) {                               //添加item，最多100个
            for (let i = 0; i < length - Count; i++) {
                if (this.content.childrenCount >= 100) break
                let node = cc.instantiate(this.prefab_item);
                node.parent = this.content;
                node.active = true;
            }
        } else if (length < Count) {                        //删除多余的item,保留基本的18个
            if (length <= 18) {         //0-100
                for (let i = 18; this.content.children[i];) {
                    this.content.children[i].removeFromParent();
                }
            } else {                    //80-100
                for (let i = length; this.content.children[i];) {
                    this.content.children[i].removeFromParent();
                }
            }
        };
        this.initRecord(_gameTrend, bool);
    },

    initRecord(_gameTrend, bool) {
        let length = _gameTrend.length;
        let endindex;
        if (length <= 100) {
            if (bool) {
                length - 1;
            }
            endindex = 0;
        } else if (length > 100) {
            if (bool) {
                endindex = length - 101;
            } else {
                endindex = length - 100;
            }
        }
        let addLength = 0; //添加的长度
        let maxLength = length;
        for (; length > endindex; length--) {
            if (_gameTrend[length - 1] == "{}") {
                continue
            };
            let zhanji = _gameTrend[length - 1];
            let index = 0;
            let node = this.content.children[length - 1];

            if (!node) break;
            if (!node.getChildByName("value")) {
                let item = cc.instantiate(this.prefab_itemValue);
                item.parent = node;
                item.active = true;
            }

            if (length == maxLength) {
                this.waikuang = cc.instantiate(this.sp_waikuang);
                this.waikuang.parent = node;
                this.waikuang.active = true;
            }
            
            for (let key in zhanji) {
                if (Number(key) == 0) continue;

                if (Number(zhanji[key]) == 1) {
                    node.getChildByName("value").children[key - 1].getComponent(cc.Sprite).spriteFrame = this.spriteFrame_win;
                    this.setAreaCount(index);
                } else if (Number(zhanji[key]) == 0) {
                    node.getChildByName("value").children[key - 1].getComponent(cc.Sprite).spriteFrame = this.spriteFrame_lose;
                }
                index++;
            }
            addLength++;
            if (addLength >= 100) break;
        }
        this.setAreaValue(addLength);
    },

    setAreaCount(index) {
        switch (index) {
            case 0: this.tianAreaCount++; break;
            case 1: this.diAreaCount++; break;
            case 2: this.xuanAreaCount++; break;
            case 3: this.huangAreaCount++; break;
        }
    },
    clearAreaCout() {
        this.tianAreaCount = 0;
        this.diAreaCount = 0;
        this.xuanAreaCount = 0;
        this.huangAreaCount = 0;
    },
    setAreaValue(addLength) {
        this.tianCout.string = this.tianAreaCount;
        this.diCout.string = this.diAreaCount;
        this.xuanCout.string = this.xuanAreaCount;
        this.huangCout.string = this.huangAreaCount;
        this.count.string = addLength;
    },
    OnDestroy() {
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onProcess, this);
        glGame.emitter.off("EnterBackground", this);
        glGame.emitter.off("EnterForeground", this);
        glGame.emitter.off("refreshRecordUi", this);
        glGame.emitter.off("recordOpen", this);
    },
    // update (dt) {},
});

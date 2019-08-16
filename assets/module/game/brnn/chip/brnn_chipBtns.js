let CONFIGS = require("brnn_const");
glGame.baseclass.extend({
    properties: {
        node_chipsAni: cc.Node,
        node_content: cc.Node,

        atlas_chips: cc.SpriteAtlas,
        audio_selectChip: {
            type: cc.AudioClip,
            default: null
        },
        selectchipSp: [cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        //-----变量声明
        this._isBet = null;
        this._dealerUid = null;
        this._myUid = null;
        this._myGold = null;
        this._isdealer = null;
        this.chips = null;
        this.chipsValue = null;
        this.curLogic = require("brnnlogic").getInstance();
        this.regisrterEvent();
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);    //切换后台
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
    },
    reUI() {
        this.chips = this.curLogic.get("roomInfo").Chips;
        let chipValue = this.chips[0];
        this.curLogic.set("curChipValue", chipValue);
        this.tempindex = this.chips.length + 1;
        this.chipIcon = this.curLogic.get("roomInfo").ChipsIcon;
        this.curLogic.set("chipsMax", this.chips[4]);

        this.setChipBtnSprite();
        this._myUid = this.curLogic.get("myUid");
    },
    start() {

    },

    chipBtnAuto(bool) {
        if (bool) {
            for (let i = 1; i < this.node_content.childrenCount; i++) {
                this.node_content.children[i].color = new cc.Color(144, 144, 144)
            }
        } else {
            this.getIndex();
        }
    },

    copyArr(arr) {
        let temparr = [];
        for (let i = 0; i < arr.length; i++) {
            temparr.push(arr[i]);
        }
        return temparr;
    },
    //是否显示筹码按钮
    isShowChipsBtn() {
        if (this._dealerUid == this._myUid) {
            this.node.active = false;
        } else {
            this.node.active = true;
        }
    },

    /**
     * 以下3个函数，用于改变chipbtn的状态
     */
    //更改筹码是否变暗
    updateBtnState(index) {
        index = index <= this.tempindex ? index : this.tempindex;
        for (let i = 1; i < index; i++) {
            this.node_content.children[i].color = new cc.Color(255, 255, 255);
        }
        for (let i = index; i < this.node_content.childrenCount; i++) {
            this.node_content.children[i].color = new cc.Color(144, 144, 144);
        }
        this.tempindex = index;
    },

    //下注超过上限变灰
    getBetFull() {
        let mybetGold = this.curLogic.get("betLeiji");
        for (let i = 0; i < this.chips.length; i++) {
            if ((this.curLogic.getNumber(mybetGold + this.chips[i])) > this.curLogic.getNumber(this.curLogic.get("MaxBet"))) {
                this.updateBtnState(i + 1);
                return;
            }
        }
    },

    //更改筹码是否变暗,从i开始  这个是钱不够才变暗
    getIndex() {
        let index = this.chips.length + 1;
        this._myGold = this.curLogic.get("myGold");
        if (this._myGold) {
            let mybetGold = this.curLogic.get("betLeiji");
            for (let i = 0; i < this.chips.length; i++) {
                if ((this.chips[i] + mybetGold) * 10 > this._myGold) {
                    index = i + 1;                             //因为上面用的是不满足的条件，所以+1；
                    this.updateBtnState(index);
                    return;
                }
            }
        }
        this.updateBtnState(index);
    },
    allChiplight() {
        for (let i = 1; i < this.node_content.childrenCount; i++) {
            this.node_content.children[i].getComponent(cc.Sprite).spriteFrame = this.getchipbtnBg(i - 1);
            this.node_content.children[i].children[0].color = new cc.Color(255, 255, 255);
        }
    },
    // 重写父类按钮点击事件
    onClick(name, node) {
        switch (name) {
            default: console.error("no find button name -> %s", name);
        }
    },
    //渲染筹码图片
    setChipBtnSprite() {
        for (let i = 0; i < this.chips.length; i++) {
            this.node_content.children[i + 1].getComponent(cc.Sprite).spriteFrame = this.atlas_chips.getSpriteFrame(this.chipIcon[i]);

            let bool = Number(this.chipIcon[i].substring(4)) < 100;
            this.node_content.children[i + 1].name = bool ? "circle" : "square";
            this.node_chipsAni.getComponent(cc.Sprite).spriteFrame = bool ? this.selectchipSp[0] : this.selectchipSp[1];
            let parent = this.node_content.children[i + 1].getChildByName("layout");
            this.node_content.children[i + 1].getChildByName("layout").removeAllChildren();
            this.setvalue(parent, this.chips[i], bool);
        }
        this.node_chipsAni.position = this.node_content.children[1].position;
        this.node_chipsAni.getComponent(cc.Sprite).spriteFrame = this.node_content.children[1].name == "circle" ? this.selectchipSp[0] : this.selectchipSp[1];
        this.setBntsScsle(1);
    },
    setvalue(node, curChipValue, bool) {
        let chipValue = this.curLogic.getNumber(curChipValue)
        if (Number(chipValue) < 10000) {
            chipValue = parseFloat(Number(chipValue).toFixed(1));
            let arr = String(chipValue).split("");
            for (let i = 0; i < arr.length; i++) {
                let value = new cc.Node();
                value.parent = node;
                if (arr[i] == ".") {
                    value.addComponent(cc.Sprite).spriteFrame = this.atlas_chips.getSpriteFrame("img_chipdian");
                    value.y = -5;
                } else {
                    value.addComponent(cc.Sprite).spriteFrame = this.atlas_chips.getSpriteFrame(`img_chip${arr[i]}`);
                }
            }
        }
        // else if (Number(chipValue) < 10000 && Number(chipValue) >= 1000) {
        //     let TempValue = Number(chipValue).div(1000);
        //     let arr = String(TempValue).split("");
        //     for (let i = 0; i < arr.length; i++) {
        //         let value = new cc.Node();
        //         value.parent = node;
        //         if (arr[i] == ".") {
        //             value.addComponent(cc.Sprite).spriteFrame = this.atlas_chips.getSpriteFrame("img_chipdian");
        //             value.y = -5;
        //         } else {
        //             value.addComponent(cc.Sprite).spriteFrame = this.atlas_chips.getSpriteFrame(`img_chip${arr[i]}`);
        //         }
        //     }
        //     let qian = new cc.Node();
        //     qian.parent = node;
        //     qian.addComponent(cc.Sprite).spriteFrame = this.atlas_chips.getSpriteFrame("img_chipqian");
        // } 
        else if (Number(chipValue) >= 10000) {
            let TempValue = parseFloat(Number(chipValue).div(10000).toFixed(1));
            let arr = String(TempValue).split("");
            for (let i = 0; i < arr.length; i++) {
                let value = new cc.Node();
                value.parent = node;
                if (arr[i] == ".") {
                    value.addComponent(cc.Sprite).spriteFrame = this.atlas_chips.getSpriteFrame("img_chipdian");
                    value.y = -5;
                } else {
                    value.addComponent(cc.Sprite).spriteFrame = this.atlas_chips.getSpriteFrame(`img_chip${arr[i]}`);
                }
            }
            let wan = new cc.Node();
            wan.parent = node;
            wan.addComponent(cc.Sprite).spriteFrame = this.atlas_chips.getSpriteFrame("img_chipwan");
        }

        node.getComponent(cc.Layout).updateLayout();
        let maxWidth = bool ? 54 : 72;
        if (node.width > maxWidth) {
            for (let i = 0; i < node.childrenCount; i++) {
                node.children[i].width = node.children[i].width * maxWidth / node.width;
                node.children[i].height = node.children[i].height * maxWidth / node.width;
            }
            node.getComponent(cc.Layout).updateLayout();
        }
    },

    chips0() {
        this.chips_cb(0)
    },
    chips1() {
        this.chips_cb(1);
    },
    chips2() {
        this.chips_cb(2);
    },
    chips3() {
        this.chips_cb(3);
    },
    chips4() {
        this.chips_cb(4);
    },
    //筹码的点击回调
    chips_cb(index) {
        if (!this._isdealer) {
            glGame.audio.playSoundEffect(this.audio_selectChip);
            let spriteFrame = this.node_content.children[index + 1].name == "circle" ? this.selectchipSp[0] : this.selectchipSp[1];
            this.node_chipsAni.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            this.node_chipsAni.position = this.node_content.children[index + 1].position;
            let chipValue = this.chips[index];
            this.curLogic.set("curChipValue", chipValue);
            this.setBntsScsle(index + 1);
        }
    },
    //设置按钮节点的大小
    setBntsScsle(index) {
        for (let i = 1; i < this.node_content.childrenCount; i++) {
            let node = this.node_content.children[i];
            index == i ? node.setScale(1) : node.setScale(0.85);
        }
    },
    regisrterEvent() {
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onMatchdetail, this.onMatchdetail, this);        //比赛开始相关的信息
        glGame.emitter.on("ChipBtnState", this.getIndex, this);
        glGame.emitter.on("BetFull", this.getBetFull, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onProcess, this.onProcess, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onMidEnter, this.midEnter, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onEnterRoom, this.reUI, this);
        glGame.emitter.on("globalGameFinish", this.reUI, this)
        glGame.emitter.on("chipBtnAuto", this.chipBtnAuto, this)
    },
    unregisrterEvent() {
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onMatchdetail, this);        //比赛开始相关的信息
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onProcess, this);
        glGame.emitter.off("ChipBtnState", this);
        glGame.emitter.off("BetFull", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onMidEnter, this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onEnterRoom, this);
        glGame.emitter.off("globalGameFinish", this)
        glGame.emitter.off("chipBtnAuto", this)
    },
    onMatchdetail() {
        this._dealerUid = this.curLogic.get("dealerUid");
        this._myUid = this.curLogic.get("myUid");
        this.isShowChipsBtn();
    },
    onProcess() {
        let msg = this.curLogic.get("t_onProcess");
        this._dealerUid = this.curLogic.get("dealerUid");
        if (msg.processType == CONFIGS.process.waitStart) {
            this.tempindex = this.chips.length + 1;
        }
    },
    midEnter() {

        this._dealerUid = this.curLogic.get("dealerUid");
        this._myUid = this.curLogic.get("myUid");
        this.isShowChipsBtn();
        this.getIndex();

    },

    OnDestroy() {
        this.unregisrterEvent();
        glGame.emitter.off("EnterBackground", this);    //切换后台
        glGame.emitter.off("EnterForeground", this);

    },
    EnterBackground() {
        this.unregisrterEvent();
        this.node.stopAllActions();
    },
    EnterForeground() {
        this.regisrterEvent();
        this._dealerUid = this.curLogic.get("dealerUid");
        this._myUid = this.curLogic.get("myUid");
        this.isShowChipsBtn();
    }
    // update (dt) {},
});

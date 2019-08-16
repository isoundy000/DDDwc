let CONFIGS = require("brnn_const");
glGame.baseclass.extend({
    properties: {
        audio_fapai: {
            type: cc.AudioClip,
            default: null
        },
        node_dealerCard: cc.Node,
        node_playerCard1: cc.Node,
        node_playerCard2: cc.Node,
        node_playerCard3: cc.Node,
        node_playerCard4: cc.Node,
        node_resultPos: cc.Node,
        node_pd: cc.Node,
        resultPos: cc.Node,
        node_poker: cc.Node,
        atlas_poker: cc.SpriteAtlas,
        AllCard: [],
        cardPos: [],
        areaCards: [],
        cardResultType: [],

        resultspine: {
            default: [],
            type: sp.SkeletonData
        },
        resultPosSpine: [sp.Skeleton],
        //牛牛音效效声明
        audio_niu: {
            type: cc.AudioClip,
            default: []
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.ResultRate = null;
        this.isJumpProcess = false;
        //发牌
        this.addAllCard();
        this.allHide();
        this.curLogic = require("brnnlogic").getInstance();
        this.regisrterEvent();
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);    //切换后台
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onMidEnter, this.midEnter, this)
    },
    start() {
    },
    allHide() {
        this.node_poker.active = false;
        // this.node_pd.active = false;
        //把牌隐藏掉
        this.hideAllCard();
        //把结果隐藏掉
        this.hideResult();
    },
    //显示牌的类型的特效
    showResultType(index, result, time) {
        let node = this.resultPos.children[index];
        node.active = true;
        let spine = node.getComponent(sp.Skeleton);
        spine.skeletonData = this.resultspine[result];
        spine.setAnimation(0, this.getSpineName(result), false);
        if (time != 0) {
            spine.addAnimation(0, this.getSpineName(result), false, time);
        }
        if (index == this.areaCards.length - 1) {
            let DTY = time == 0 ? 0.8 : 0;
            let dty = cc.delayTime(DTY);
            let cb = cc.callFunc(() => {
                cc.log("显示区域输赢动画，card")
                glGame.emitter.emit("showAreaWinOrLose", time);
            })
            this.node.runAction(cc.sequence(dty, cb))
        }
    },
    getSpineName(index) {
        let name;
        switch (index) {
            case 0: name = "mn_2"; break
            case 1: name = "n1"; break
            case 2: name = "n2"; break
            case 3: name = "n3"; break
            case 4: name = "n4"; break
            case 5: name = "n5"; break
            case 6: name = "n6"; break
            case 7: name = "n7"; break
            case 8: name = "n8"; break
            case 9: name = "n9"; break
            case 10: name = "nn_1"; break
            case 12: name = "szn"; break
            case 13: name = "thn"; break
            case 14: name = "hln"; break
            case 15: name = "zdn"; break
            case 17: name = "whn"; break
            case 18: name = "wxn"; break
        }
        return name;
    },
    //设置牌都是背面的
    coverCard(node) {
        let frame = this.atlas_poker.getSpriteFrame("bull1_0x00");
        node.getComponent(cc.Sprite).spriteFrame = frame;
    },
    //得到牌的16进制名字
    getSixValue(card) {
        card = parseInt(card);
        let str = card < 14 ? "bull1_0x0" : "bull1_0x";
        return str + card.toString(16);
    },
    //把所有的卡牌放在一起
    addAllCard() {
        //存5个发牌的位置(这边的-1,是减去一个扑克节点)
        if (this.cardPos.length > 0) return;
        for (let i = 0; i < this.node.childrenCount - 3; i++) {
            this.cardPos.push(this.node.children[i].position);
            this.areaCards.push(this.node.children[i].children[0]);
        }
        //把所有的子牌存在发完的牌池中
        for (let i = 0; i < this.node.childrenCount - 3; i++) {
            let node = this.node.children[i];
            for (let j = 0; j < node.children[0].childrenCount; j++) {
                let tempNode = node.children[0].children[j];
                this.AllCard.push(tempNode);
            }
        }
        //把牌的结果的节点存起来
        for (let i = 0; i < this.node.childrenCount - 3; i++) {
            let node = this.node.children[i];
            this.cardResultType.push(node.children[1]);
        }
    },
    //隐藏所有牌
    hideAllCard() {
        for (let i = 0; i < this.AllCard.length; i++) {
            this.AllCard[i].active = false;
            this.coverCard(this.AllCard[i]);
            this.AllCard[i].y = 0;
        }
    },
    //显示所有牌
    showAllCard() {
        for (let i = 0; i < this.AllCard.length; i++) {
            this.AllCard[i].active = true;
        }
    },
    //隐藏牛的结果特效
    hideResult() {
        for (let i = 0; i < this.resultPos.childrenCount; i++) {
            this.resultPos.children[i].active = false;
        }
    },

    //得到打开牌的牌组
    getOpenCardIndex() {
        let index = 0
        if (this.isJumpProcess) return index;
        let OpenSingleGroupTime = 800;
        let curWaitTime = this.curLogic.getMidEnterWaitTime()
        let time = 8000 - curWaitTime
        if (time >= 0) {
            index = Math.ceil(time / OpenSingleGroupTime);
            index > 5 ? index = 5 : index
        }
        return index;
    },
    //打开所有牌 ps:DTY等买定离手的时间
    openAllCard(result) {
        let aniList = [];
        let DYT = 0.8;
        let index = this.getOpenCardIndex();
        if (this.areaCards) {
            for (let i = 0; i < index; i++) {
                this.openCard(this.areaCards[i], result[i].cardIdList, result[i].resultType)
                this.showResultType(i, result[i].resultType, -4);
            }
            for (let i = index; i < this.areaCards.length; i++) {
                aniList.push(
                    cc.delayTime(DYT),
                    cc.callFunc(() => {
                        this.openCard(this.areaCards[i], result[i].cardIdList, result[i].resultType)
                        this.showResultType(i, result[i].resultType, 0);
                        this.playResultAudio(result[i].resultType);
                    }),   //翻牌
                )
                this.node.runAction(cc.sequence(aniList));
            }
        }
    },
    //打开牌 
    openCard(node, cardsList, resultType) {
        for (let i = 0; i < node.childrenCount; i++) {
            let name = this.getSixValue(cardsList[i]);
            let frame = this.atlas_poker.getSpriteFrame(name);
            node.children[i].getComponent(cc.Sprite).spriteFrame = frame;
            if (i > 2 && resultType != 0) {
                node.children[i].y = 12;
            }
        }
    },
    groupOpenThreeCard(result) {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                let listItem = result[i].cardIdList[j];
                let name = this.getSixValue(listItem);
                let frame = this.atlas_poker.getSpriteFrame(name);
                this.node_poker.getComponent(cc.Sprite).spriteFrame = frame;
                this.AllCard[(i * 5 + j)].getComponent(cc.Sprite).spriteFrame = frame;
            }
        }
    },
    //翻3张牌
    openThreeCards(dictAllCards) {
        if (!dictAllCards) return;
        //这个index是第几个人，index1是第几张牌
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                let listItem = dictAllCards[i][j];
                let name = this.getSixValue(listItem);
                let frame = this.atlas_poker.getSpriteFrame(name);
                this.node_poker.getComponent(cc.Sprite).spriteFrame = frame;
                this.AllCard[(i * 5 + j)].getComponent(cc.Sprite).spriteFrame = frame;
            }
        }
    },
    //播放牌型音效
    playResultAudio(resultType) {
        if (this.audio_niu[resultType]) {
            glGame.audio.playSoundEffect(this.audio_niu[resultType]);
        }
    },
    //从哪张牌开始发
    getDealCardIndex() {
        let index = 0
        let dealSingleCardTime = 120;
        let curWaitTime = this.curLogic.getMidEnterWaitTime()
        let BetTime = this.curLogic.get("BetTime") * 1000;
        let time = BetTime - curWaitTime;    //19000  下注流程有19秒 算出已经发到第几张牌
        if (time >= 0) {
            index = Math.ceil(time / dealSingleCardTime);
            index = index > 25 ? 25 : index;
        }
        return index;
    },
    //发牌
    allCardAni(dictAllCards) {
        // this.node_pd.active = true;
        cc.log("前三张牌", dictAllCards)
        let playCardindex = this.getDealCardIndex();
        let aniList = [];
        if (this.AllCard) {
            for (let i = 0; i < playCardindex; i++) {
                let index = i % 5;                //第几个人  例：7，第3个人，第2张牌
                let index1 = parseInt(i / 5);    //第几张牌 
                this.AllCard[(index * 5 + index1)].active = true;
            }
            for (let i = playCardindex; i < this.AllCard.length; i++) {
                let index = i % 5;                //第几个人  例：7，第3个人，第2张牌
                let index1 = parseInt(i / 5);    //第几张牌 
                let pos = this.getPokerPos(index);
                aniList.push(
                    cc.callFunc(() => {
                        glGame.audio.playSoundEffect(this.audio_fapai);
                        this.setPokerSpriteFrame(index, index1)
                    }
                    ),
                    cc.moveTo(0.12, pos),
                    cc.callFunc(() => { this.node_poker.setPosition(this.node_pd.position) }),
                    // cc.delayTime(0.1),
                    cc.callFunc(() => {
                        this.AllCard[(index * 5 + index1)].active = true;
                        this.node_poker.active = false
                    }),
                )
            }
            this.node_poker.active = true;
            if (aniList.length > 0) {
                this.node_poker.runAction(cc.sequence(aniList));
            } else {
                this.node_poker.active = false
            }
            // let DTY2 = cc.delayTime(0.18*(25-index));
            // // // let cb = cc.callFunc(()=>{ this.node_pd.active = false});
            // let callFunc = cc.callFunc(()=>{ this.openThreeCards(dictAllCards)});
            // this.node.runAction(cc.sequence(DTY2,callFunc));
        }
    },

    //设置卡牌为背面
    setPokerSpriteFrame(index, index1) {
        let name = this.getSixValue(0);
        let frame = this.atlas_poker.getSpriteFrame(name);
        this.node_poker.getComponent(cc.Sprite).spriteFrame = frame;
        // this.AllCard[(index * 5 + index1)].getComponent(cc.Sprite).spriteFrame = frame;
        this.node_poker.active = true;
    },
    //得到卡牌位置
    getPokerPos(index) {
        let pos;
        switch (index) {
            case 0: pos = this.cardPos[0]; break;
            case 1: pos = this.cardPos[1]; break;
            case 2: pos = this.cardPos[2]; break;
            case 3: pos = this.cardPos[3]; break;
            case 4: pos = this.cardPos[4]; break;
        }
        return pos;
    },
    /**
   * 网络数据监听
   */
    regisrterEvent() {
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onProcess, this.onProcess, this);            //进度通知
        glGame.emitter.on(CONFIGS.logicGlobalEvent.settleEffect, this.onSettle, this);
    },
    unregisrterEvent() {
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onProcess, this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.settleEffect, this);
    },
    //断线重连，刚才在结算，且自己有下注
    midEnter() {
        this.isJumpProcess = false;
        let msg = this.curLogic.get("t_onMidEnter");
        if (msg.processType == CONFIGS.process.settleEffect) {
            //中途加入进来，直接显示牌型，
            let lastSettleInfo = this.curLogic.get("lastSettleInfo");
            if (lastSettleInfo) {
                let resultDict = lastSettleInfo.resultDict;
                this.showAllCard();
                this.isJumpProcess = false;
                this.openAllCard(resultDict);
            }
        } else if (msg.processType == CONFIGS.process.chooseChip) {
            let dictAllCards = this.curLogic.get("dictAllCards");
            if (dictAllCards) {
                this.openThreeCards(dictAllCards)
                this.allCardAni(dictAllCards);
            }
        } else if (msg.processType == CONFIGS.process.waitStart) {
            this.allHide();
        }
    },
    onProcess() {
        let msg = this.curLogic.get("t_onProcess");
        if (msg.processType == CONFIGS.process.waitStart) {
            this.allHide();
        } else if (msg.processType == CONFIGS.process.chooseChip) {
            this.allHide();
            let dictAllCards = this.curLogic.get("dictAllCards");
            this.openThreeCards(dictAllCards)
            this.allCardAni(dictAllCards);
        }
    },
    /*同步数据 @dealerUid @dealerSettleGold @mySettleGold
    *         @dealerCards @dictOtherCards 
    */
    onSettle() {
        let msg = this.curLogic.get("t_onSettle");
        this.isJumpProcess = true;
        let dty = cc.delayTime(0.2);
        let cb = cc.callFunc(() => {
            if (!msg.resultDict) return
            this.openAllCard(msg.resultDict);
        })
        this.node.runAction(cc.sequence(dty, cb));
    },
    OnDestroy() {
        cc.log("kapai切前后台-场景销毁")
        this.node_poker.stopAllActions();
        this.node.stopAllActions();
        this.unregisrterEvent();
        glGame.emitter.off("EnterBackground", this);    //切换后台
        glGame.emitter.off("EnterForeground", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onMidEnter, this)
    },
    EnterBackground() {
        this.node_poker.stopAllActions();
        this.node.stopAllActions();
        this.unregisrterEvent();
    },
    EnterForeground() {
        this.regisrterEvent();
        this.allHide();
        this.isJumpProcess = false;
        let Process = this.curLogic.get("t_onProcess");
        if (!Process) {
            Process = this.curLogic.get("t_onMidEnter");
        }
        if (Process.processType == CONFIGS.process.settleEffect) {
            let msg = this.curLogic.get("t_onSettle");
            this.showAllCard();
            this.groupOpenThreeCard(msg.resultDict)
            this.openAllCard(msg.resultDict);
        } else if (Process.processType == CONFIGS.process.chooseChip) {
            this.allHide();
            let dictAllCards = this.curLogic.get("dictAllCards");
            this.openThreeCards(dictAllCards)
            this.allCardAni(dictAllCards);
        } else {
            this.allHide();
        }
    },
    // update (dt) {},
});

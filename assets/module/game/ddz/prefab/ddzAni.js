let CONFIGS = require("ddzconst");
let Judgement = require("doudizhuFP");
glGame.baseclass.extend({
    properties: {
        node_pillage: cc.Node,
        node_outcardS: cc.Node,
        node_notOver: cc.Node,
        node_cardResult: cc.Node,
        pokerAlast: cc.SpriteAtlas,

        pillages: [cc.SpriteFrame],
        showCardNode: cc.Node,
        sp_cardResult: [sp.SkeletonData],
        audio_playcard: {
            type: cc.AudioClip,
            default: null
        },
        spine_audios: {
            type: cc.AudioClip,
            default: []
        },
        spf_cardIcon: cc.SpriteFrame,
        malePassAudio: {
            type: cc.AudioClip,
            default: []
        },
        femalePassAudio: {
            type: cc.AudioClip,
            default: []
        },
        only2Audio: {
            type: cc.AudioClip,
            default: []
        },
        only1Audio: {
            type: cc.AudioClip,
            default: []
        },
        audioScore: {
            type: cc.AudioClip,
            default: []
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.curLogic = require("ddzlogic").getInstance();
        this.backgroundState = false;
        this.registerEvent();
        this.registerGlobalEvent();
    },

    start() {

    },
    registerEvent() {
        glGame.emitter.on(CONFIGS.CCEvent.onDealCard, this.onDealCard, this);
        glGame.emitter.on(CONFIGS.CCEvent.onPlayCard, this.onPlayCard, this);
        glGame.emitter.on(CONFIGS.CCEvent.onPlayCardResult, this.onPlayCardResult, this);
        glGame.emitter.on(CONFIGS.CCEvent.onGameOver, this.onGameOver, this);
        glGame.emitter.on(CONFIGS.CCEvent.onLandownerResult, this.onLandownerResult, this);
        glGame.emitter.on(CONFIGS.CCEvent.onHandCards, this.onHandCards, this);
        glGame.emitter.on(CONFIGS.CCEvent.onSyncData, this.onSyncData, this);
        glGame.emitter.on(CONFIGS.CCEvent.onProcess, this.onProcess, this);
    },

    unRegisterEvent() {
        glGame.emitter.off(CONFIGS.CCEvent.onDealCard, this);
        glGame.emitter.off(CONFIGS.CCEvent.onGameOver, this);
        glGame.emitter.off(CONFIGS.CCEvent.onPlayCard, this);
        glGame.emitter.off(CONFIGS.CCEvent.onPlayCardResult, this);
        glGame.emitter.off(CONFIGS.CCEvent.onLandownerResult, this);
        glGame.emitter.off(CONFIGS.CCEvent.onHandCards, this);
        glGame.emitter.off(CONFIGS.CCEvent.onSyncData, this);
        glGame.emitter.off(CONFIGS.CCEvent.onProcess, this);
    },

    registerGlobalEvent() {
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
    },

    unRegisterGlobalEvent() {
        glGame.emitter.off("EnterBackground", this);
        glGame.emitter.off("EnterForeground", this);
    },

    EnterBackground() {
        this.backgroundState = true;
        for (let i = 0; i < 3; i++) {
            let actionNode = this.getOutCardParent(i);
            actionNode.stopAllActions();
        }
        this.unRegisterEvent();
    },

    EnterForeground() {
        if (this.curLogic.get("process") == CONFIGS.gameProcess.loop) {
            this.clearPillage();
            let outCardArr = this.curLogic.get("outCardArr");
            let landlordID = this.curLogic.get("landlordID");
            console.log("最近一轮的出牌情况", outCardArr);
            for (let seatid in outCardArr) {
                this.clearOutCard(seatid)
                if (this.curLogic.get("opSeatId") == seatid) continue;
                console.log("哪几个进行了渲染", seatid, this.curLogic.get("opSeatId"))
                let node = this.getOutCardParent(this.curLogic.getViewSeatID(seatid));
                let cardlist = outCardArr[seatid];
                cardlist = Judgement.SortOutCardList(cardlist);
                if (cardlist.length != 0) {
                    for (let i = 0; i < cardlist.length; i++) {
                        if (Array.isArray(cardlist[i])) {
                            for (let j = 0; j < cardlist[i].length; j++) {
                                this.initCardNode(cardlist[i][j], node, j == cardlist[i].length - 1 && seatid == landlordID);
                            }
                        } else {
                            this.initCardNode(cardlist[i], node, i == cardlist.length - 1 && seatid == landlordID);
                        }
                    }
                } else {
                    let notOvernode = this.getNotOver(this.curLogic.getViewSeatID(seatid));
                    notOvernode.active = true;
                }
            }
        }
        if (this.curLogic.get("process") == CONFIGS.gameProcess.pillgae) {
            let allScore = this.curLogic.get("allScore");
            for (let seatid in allScore) {
                if (allScore[seatid] == -1) continue;
                this.showPillage(seatid, allScore[seatid]);
            }
        }
        if (this.curLogic.get("process") == CONFIGS.gameProcess.gamefinish) {
            this.onGameOver();
        }

        if (this.backgroundState) {
            this.backgroundState = false;
            this.registerEvent();
        }
    },

    OnDestroy() {
        this.unRegisterEvent();
        this.unRegisterGlobalEvent();
    },

    onSyncData() {
        let processSt = this.curLogic.get("process");
        if (processSt == CONFIGS.gameProcess.pillgae) {
            let allScore = this.curLogic.get("allScore");
            for (let seatid in allScore) {
                if (allScore[seatid] == -1) continue;
                this.showPillage(seatid, allScore[seatid]);
            }
        } else if (processSt == CONFIGS.gameProcess.loop) {
            let cardlist = this.curLogic.get("lastOutCard")
            let lastseatid = this.curLogic.get("lastOpSeatid")
            if (cardlist.length != 0) {
                let viewID = this.curLogic.getViewSeatID(lastseatid);
                let landlordID = this.curLogic.get("landlordID")
                let node = this.getOutCardParent(viewID);
                this.clearOutCard(lastseatid)
                for (let i = 0; i < cardlist.length; i++) {
                    this.initCardNode(cardlist[i], node, i == cardlist.length - 1 && landlordID == lastseatid);
                }
            }
        } else if (processSt == CONFIGS.gameProcess.gamefinish) {
            let otherPlayer = this.curLogic.get("otherPlayer");
            for (let i in otherPlayer) {
                if (i == this.curLogic.getMySeatID()) continue;
                let viewid = this.curLogic.getViewSeatID(i);
                let posY = otherPlayer[i].pokerLen <= 12 ? 50 : 100;
                let noOutCardNode = this.showCardNode.getChildByName(`showCards_${viewid}`);
                noOutCardNode.active = true;
                noOutCardNode.y = posY;
                this.showNotOutCard(noOutCardNode, otherPlayer[i].pokerArr, viewid);
            }
            this.showOutCard(this.curLogic.get("opSeatId"), this.curLogic.get("nowPokerArr"));
        }
    },

    onProcess() {
        let processSt = this.curLogic.get("process")
        if (processSt != CONFIGS.gameProcess.pillgae) {
            this.clearPillage();
        }

    },

    onDealCard() {
        this.clearPillage();
    },

    onPlayCardResult() {
        let seatid = this.curLogic.get("opSeatId");
        let cardList = this.curLogic.get("curOutCard");
        let cardNumber = this.curLogic.get("myCardList").length;
        console.log("剩牌音效me0", cardNumber, cardList.length, seatid, this.curLogic.getMySeatID())
        if (seatid == Number(this.curLogic.getMySeatID()) && cardNumber < 3) {
            if (cardNumber == 2) {
                console.log("剩牌音效me2", this.curLogic.players[seatid].sex)
                glGame.audio.playSoundEffect(this.only2Audio[this.curLogic.players[seatid].sex - 1])
            } else if (cardNumber == 1) {
                console.log("剩牌音效me1", this.curLogic.players[seatid].sex)
                glGame.audio.playSoundEffect(this.only1Audio[this.curLogic.players[seatid].sex - 1])
            }
        }


        this.showOutCard(seatid, cardList);
    },
    onPlayCard() {
        let seatid = this.curLogic.get("opSeatId");
        this.clearOutCard(seatid);
    },
    //显示叫地主的分值
    onLandownerResult() {
        let seatid = this.curLogic.get("opSeatId");
        let score = this.curLogic.get("pillageScore");
        this.showPillage(seatid, score);
    },
    //确认地主，隐藏叫分
    onHandCards() {
        // this.clearPillage();
    },

    //==============打出去的牌的渲染
    getOutCardParent(viewid) {
        return this.node_outcardS.children[viewid];
    },
    getNotOver(viewid) {
        return this.node_notOver.children[viewid];
    },
    onGameOver() {
        let outcards = this.node_outcardS.children;
        let cardlist = this.curLogic.get('finalHandCard')
        for (let i = 0; i < outcards.length; i++) {
            if (!cardlist[i] || cardlist[i].length == 0) continue;
            if (i == this.curLogic.getMySeatID()) {
                this.clearOutCard(i);
                continue;
            }
            let viewid = this.curLogic.getViewSeatID(i);
            let posY = cardlist[i].length <= 12 ? 50 : 100;
            this.showCardNode.getChildByName(`showCards_${viewid}`).active = true;
            this.showCardNode.getChildByName(`showCards_${viewid}`).y = posY;
            console.log("玩家剩余的手牌", cardlist[i], viewid)
            this.showNotOutCard(this.showCardNode.getChildByName(`showCards_${viewid}`), cardlist[i], viewid);
            this.clearOutCard(i);
            // this.showOutCard(i, cardlist[i])
        }

    },

    showNotOutCard(cardnode, cardData, viewid) {
        let nodes = cardnode.children;
        for (let i = 0; i < nodes.length; i++) {
            let newSpriteFrameName = null;
            if (viewid == 1) {
                if (i <= 11) {
                    if (!cardData[i]) {
                        nodes[11 - i].active = false;
                        continue;
                    }
                    newSpriteFrameName = this.getSixValue(cardData[i]);
                    nodes[11 - i].getComponent(cc.Sprite).spriteFrame = this.pokerAlast.getSpriteFrame(newSpriteFrameName);
                    // nodes[11 - i].getComponent
                } else if (i > 11) {
                    if (!cardData[i]) {
                        nodes[19 - (i - 12)].active = false;
                        continue;
                    }
                    newSpriteFrameName = this.getSixValue(cardData[i]);
                    nodes[19 - (i - 12)].getComponent(cc.Sprite).spriteFrame = this.pokerAlast.getSpriteFrame(newSpriteFrameName);
                }
            }
            else {
                if (!cardData[i]) {
                    nodes[i].active = false;
                    continue;
                }
                newSpriteFrameName = this.getSixValue(cardData[i]);
                nodes[i].getComponent(cc.Sprite).spriteFrame = this.pokerAlast.getSpriteFrame(newSpriteFrameName);
            }
        }
    },

    showOutCard(seatId, cardList) {
        let viewID = this.curLogic.getViewSeatID(seatId);
        //修改
        this.addOutCards(cardList, viewID, seatId);
    },

    clearOutCard(seatId) {
        let viewID = this.curLogic.getViewSeatID(seatId);
        let node = this.getOutCardParent(viewID);
        node.removeAllChildren();
        let notOver = this.getNotOver(viewID);
        notOver.active = false;
    },
    /**
     * @describe: 增加一个seatId参数
     */
    addOutCards(list, viewID, seatId) {

        let node = this.getOutCardParent(viewID);
        let landlordID = this.curLogic.get('landlordID');
        for (let i = 0; i < list.length; ++i) {
            if (!list[i]) continue;
            let actCall = cc.callFunc(() => {
                if (Array.isArray(list[i])) {
                    let arr = list[i];
                    for (let k = 0; k < arr.length; k++) {
                        this.initCardNode(arr[k], node, k == arr.length - 1 && landlordID == seatId);
                    }
                } else {
                    this.initCardNode(list[i], node, i == list.length - 1 && landlordID == seatId);
                }
            });
            let actDelay = cc.delayTime(0.05 * i);
            if (list.length >= 4) {
                node.runAction(cc.sequence(actDelay, actCall));
            } else {
                this.initCardNode(list[i], node, i == list.length - 1 && landlordID == seatId);
            }
        }
        if (list.length <= 3) {
            node.runAction(cc.sequence(cc.scaleTo(0.01, 1.4),
                cc.scaleTo(0.1, 1.0)
            ));
        }
        if (this.curLogic.get("process") <= CONFIGS.gameProcess.loop) {
            let cardlist = this.curLogic.get('tempOutCard');
            let cardType = Judgement.GetCardType(cardlist);
            this.playCardTypeAnim(viewID, cardType, 0, cardlist.length);
            cc.log("播放特效", cardType)
        }
        if (!list || list.length == 0) {
            let viewid = this.curLogic.getViewSeatID(this.curLogic.get("opSeatId"));
            this.node_notOver.children[viewid].active = true;
            let randomIndex = Math.floor(Math.random() * 1000) >= 500 ? 1 : 2;

            let audioArr = this.curLogic.players[seatId].sex === 1 ? this.malePassAudio : this.femalePassAudio;
            console.log("pass音效", audioArr, randomIndex)
            glGame.audio.playSoundEffect(audioArr[randomIndex - 1])
            return;
        }
        //播放打牌音效
        glGame.audio.playSoundEffect(this.audio_playcard);
        this.playCardValueSoundEffect(seatId);
    },
    /**
     * @describe: 播放音效
     */
    playCardValueSoundEffect(seatId) {
        let list = this.curLogic.get('tempOutCard');
        let cardType = Judgement.GetCardType(list);
        console.log("播放音效", cardType)
        if (cardType >= CONFIGS.cardType.CT_THREE) {
            if (cardType > 14 || cardType == 6) return;
            cardType = cardType == 14 ? 13 : cardType;
            console.log("最终播放音效", cardType)

            glGame.emitter.emit("playAudio", {
                cardType: cardType,
                value: cardType,
                sex: this.curLogic.players[seatId].sex
            })
        } else {
            let cardValue = Judgement.GetCardValue(list[0]);

            if (list[0] == 78) {
                cardValue = 14;
            } else if (list[0] == 79) {
                cardValue = 15;
            }

            glGame.emitter.emit("playAudio", {
                cardType: cardType,
                value: cardValue,
                sex: this.curLogic.players[seatId].sex

            })
        }

    },

    initCardNode(list, node, isLast) {
        let Cardnode = new cc.Node();
        Cardnode.addComponent(cc.Sprite);
        let spriteFrameName = this.getSixValue(list);
        Cardnode.getComponent(cc.Sprite).spriteFrame = this.pokerAlast.getSpriteFrame(spriteFrameName);
        Cardnode.parent = node;
        Cardnode.width = 80;
        Cardnode.height = 107;
        let landLordSeatId = this.curLogic.get('landlordID');
        if (isLast) {
            let cardIconNode = new cc.Node();
            cardIconNode.anchorX = 1;
            cardIconNode.anchorY = 0;
            cardIconNode.setScale(0.7);
            cardIconNode.position = cc.v2(Cardnode.width / 2 - 2, -Cardnode.height / 2 + 3);
            cardIconNode.addComponent(cc.Sprite);
            cardIconNode.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.CUSTOM;
            cardIconNode.parent = Cardnode;
            cardIconNode.getComponent(cc.Sprite).spriteFrame = this.spf_cardIcon;
        }
    },

    //显示牌的类型的特效
    //time:从什么时候开始播，默认为0
    playCardTypeAnim(viewID, cardType, time, cardLength) {
        // let node = this.node_cardResult.children[viewID];
        // let getClips = node.getComponent(cc.Animation).getClips();
        // if(!getClips[cardType])return;
        // node.active = true;
        // node.getComponent(cc.Animation).play(getClips[cardType].name,time);
        // let DTY  = cc.delayTime(1.5);
        // let callFunc = cc.callFunc(()=>{
        //    node.active = false;
        // })
        // this.node.runAction(cc.sequence(DTY,callFunc));

        //cardType为0~3是没有动画效果
        if (cardType < 4) return;
        console.log("idididid", viewID)
        let curNode = this.node_cardResult.getChildByName("view" + viewID);
        curNode.active = true;
        let outcardNode = this.getOutCardParent(viewID);
        if (viewID == 0) {
            curNode.x = outcardNode.x + cardLength * 15 - 30;
        } else if (viewID == 1) {
            curNode.x = outcardNode.x - 30;
        } else if (viewID == 2) {
            curNode.x = outcardNode.x + cardLength * 30;
        }
        curNode.y = outcardNode.y - 30;
        //筛选播放什么类型
        let spine = curNode.getComponent(sp.Skeleton);
        let index = Number(CONFIGS.carResultSpineFile[cardType]);
        let animationName = CONFIGS.cardResultSpineAnimationsName[cardType];
        spine.skeletonData = this.sp_cardResult[index];
        spine.setAnimation(0, animationName, false);

        let audioFile = this.spine_audios[cardType];
        if (audioFile) {
            glGame.audio.playSoundEffect(audioFile);
        }
        let DTY = cc.delayTime(1.5);
        let callFunc = cc.callFunc(() => {
            curNode.active = false;
        })
        this.node.runAction(cc.sequence(DTY, callFunc));
    },

    //把所有的牌清理了
    clearAllOutCards() {
        for (let i = 0; i < this.node_outcardS.childrenCount; ++i) {
            this.node_outcardS.children[i].removeAllChildren();
        }
    },
    //================显示叫地主表现
    showPillage(seatId, score) {
        let viewID = this.curLogic.getViewSeatID(seatId);
        let node = this.node_pillage.children[viewID];
        node.active = true;
        node.getComponent(cc.Sprite).spriteFrame = this.pillages[score];
        if (!this.backgroundState) {
            let index = this.curLogic.players[seatId].sex === 1 ? score : score + 4;
            glGame.audio.playSoundEffect(this.audioScore[index])
        }
    },
    clearPillage() {
        for (let i = 0; i < this.node_pillage.childrenCount; i++) {
            this.node_pillage.children[i].active = false;
        }
    },
    getSixValue(value) {
        return value < 16 ? 'bull1_0x0' + value.toString(16) : 'bull1_0x' + value.toString(16)
    },
    // update (dt) {},

});

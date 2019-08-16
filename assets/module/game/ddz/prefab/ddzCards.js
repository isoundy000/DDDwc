let CONFIGS = require("ddzconst");
let Judgement = require("doudizhuFP");
glGame.baseclass.extend({
    properties: {
        pokerAlast: cc.SpriteAtlas,

        node_lordCards: cc.Node,
        node_myHandCard: cc.Node,
        node_dealCard: cc.Node,
        node_viewSeat1: cc.Node,
        node_viewSeat2: cc.Node,
        node_viewSeat0: cc.Node,
        selectAudio: {
             type:cc.AudioClip,
             default:null
        },
        dealAudio: {
             type:cc.AudioClip,
             default:null
        },
        alarmAudio: {
             type:cc.AudioClip,
             default:null
        },
        redealcard: cc.Node,
        spf_cardIcon: cc.SpriteFrame,
        labGameTimes: cc.Label,
        labBaseScore: cc.Label,
        only1Audio:{
             type:cc.AudioClip,
             default:[]
        },
        only2Audio:{
             type:cc.AudioClip,
             default:[]
        }
    },
    onLoad() {
        this.curLogic = require("ddzlogic").getInstance();
        // myCardList = CONFIGS.testCardList;
        // Judgement.SortCardList(myCardList,1);
        this.refreshLordCardsDisplay();
        this.resetData();
        this.bindSelectEvent(this.node_myHandCard);
        this.registerEvent()
        this.registerGlobalEvent()

        // this.cardData = [0x01,0x02,0x04,0x06,0x08,0x0A,0x0B];
        // Judgement.SortCardList(this.cardData, 1);
        // console.log("bbbbbbbbbbbbbbbbbbb", this.cardData)
        // let result = Judgement.SearchLineCardType(this.cardData, 0, 1, 0);
        // console.log("aaaaaaaaaaaaaaaaaa", result)
    },

    resetData() {
        this.fapaiCount = 1;
        this.timerPool = [];
        //每次点击的其实位置
        this.startPosX = null;
        //存放选中出牌的数据
        this.flag = [0, 0, 0];
        this.only1AudioFlag = [1, 1, 1];
        this.only2AudioFlag = [1, 1, 1];
        this.willOut = [];
        this.outCardList = this.curLogic.get("outCardList");
    },

    initGameInfo () {
        this.gameTimes = this.curLogic.get('gameTimes');
        this.labGameTimes.string = "x"+this.gameTimes;
        this.labBaseScore.string = this.curLogic.getFloat(this.curLogic.get("gameBaseBet"));
    },

    refreshGameTimes () {
        let maxTimes = this.curLogic.maxGameTimes;
        let gameTimes = this.curLogic.get('gameTimes');
        this.gameTimes = gameTimes>=maxTimes ? maxTimes : gameTimes;
        console.log("gameTimes", this.gameTimes)
        this.labGameTimes.string = "x"+this.gameTimes;
    },

    refreshBaseScore () {
        this.labBaseScore.string = this.curLogic.getFloat(this.curLogic.get("gameBaseBet"));
    },

    registerEvent() {
        glGame.emitter.on("initRoomUI", this.initGameInfo, this)
        glGame.emitter.on("refreshLordCardDisplay", this.refreshLordCardsDisplay, this);
        glGame.emitter.on(CONFIGS.CCEvent.onProcess, this.onProcess, this);
        glGame.emitter.on(CONFIGS.CCEvent.onDealCard, this.onDealCard, this);
        glGame.emitter.on(CONFIGS.CCEvent.onHandCards, this.onHandCards, this);
        glGame.emitter.on(CONFIGS.CCEvent.onPlayCardResult, this.onPlayCardResult, this);
        glGame.emitter.on(CONFIGS.CCEvent.onLandownerResult, this.onLandownerResult, this);
        glGame.emitter.on(CONFIGS.CCEvent.onAutoPlay, this.onAutoPlay, this);
        glGame.emitter.on("cancelSelect", this.cancelSelect, this);
        glGame.emitter.on("tipSelectCard", this.tipSelectCard, this);
        glGame.emitter.on(CONFIGS.CCEvent.onSyncData, this.onSyncData, this);
        glGame.emitter.on("selectCardError", this.cancelSelect, this);
        glGame.emitter.on(CONFIGS.CCEvent.onGameOver, this.onGameOver, this);
    },

    unRegisterEvent() {
        glGame.emitter.off("initRoomUI", this)
        glGame.emitter.off("refreshLordCardDisplay", this);
        glGame.emitter.off(CONFIGS.CCEvent.onProcess, this);
        glGame.emitter.off(CONFIGS.CCEvent.onDealCard, this);
        glGame.emitter.off(CONFIGS.CCEvent.onHandCards, this);
        glGame.emitter.off(CONFIGS.CCEvent.onAutoPlay, this);
        glGame.emitter.off(CONFIGS.CCEvent.onPlayCardResult, this);
        glGame.emitter.off(CONFIGS.CCEvent.onLandownerResult, this);
        glGame.emitter.off("cancelSelect", this);
        glGame.emitter.off("tipSelectCard", this);
        glGame.emitter.off(CONFIGS.CCEvent.onSyncData, this);
        glGame.emitter.off("selectCardError", this);
        glGame.emitter.off(CONFIGS.CCEvent.onGameOver, this);
    },

    registerGlobalEvent() {
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
    },

    unRegisterGlobalEvent() {
        glGame.emitter.off("EnterBackground", this);
        glGame.emitter.off("EnterForeground", this);
    },

    EnterForeground() {
        console.log("切回前台")
        let processSt = this.curLogic.get("process");
        this.initGameInfo()

        if (processSt == CONFIGS.gameProcess.loop) {
            let lordCard = this.curLogic.get("lordCards");
            //显示地主牌
            this.showLoadCards(lordCard);
            //刷新出牌按钮
            glGame.emitter.emit("selectCardEnd")
            //刷新手牌
            this.refAllCard();
        }
        if (processSt == CONFIGS.gameProcess.gamefinish) {
            let lordCard = this.curLogic.get("lordCards");
            //显示地主牌
            this.showLoadCards(lordCard);
            //刷新手牌
            this.refAllCard();
            this.onGameOver();
        }
        if (processSt == CONFIGS.gameProcess.pillgae) {
            let landlordID = this.curLogic.get("landlordID");
            let viewid = null;
            if (landlordID || landlordID == 0) {
                viewid = this.curLogic.getViewSeatID(landlordID);
            }
            this.curLogic.set('cardNumViewId1', viewid == 1 ? 20 : 17);
            this.curLogic.set('cardNumViewId2', viewid == 2 ? 20 : 17);
            this.refAllCard();
        }
        if (processSt == CONFIGS.gameProcess.dealcard) {
            this.curLogic.set('cardNumViewId1', 17);
            this.curLogic.set('cardNumViewId2', 17);
            this.refAllCard();
        }
        if (this.curLogic.get('backgroundState')) {
            this.curLogic.set("backgroundState", false);
            this.registerEvent()
        }
    },

    EnterBackground() {
        console.log("切到后台")
        this.node.stopAllActions();
        this.curLogic.set("backgroundState", true);
        this.unRegisterEvent();
        //取消选牌
        this.willOut.splice(0, this.willOut.length);
        this.outCardList.splice(0, this.outCardList.length);
        if (this.timerPool) {
            this.timerPool.forEach((timer) => { clearTimeout(timer) })
            this.timerPool = []
        }
        this.node_myHandCard.removeAllChildren();
    },

    onSyncData() {
        console.log("牌界面的重连入口")
        this.initGameInfo();
        if (this.curLogic.get("process") == CONFIGS.gameProcess.loop) {
            this.refAllCard();
            //渲染地主牌
            let list = this.curLogic.get("lordCards")
            for (let i = 0; i < list.length; i++) {
                let node = this.node_lordCards.children[i];
                node.active = true;
                this.setSingelCardSpriteFrame(node, list[i]);
            }
            this.node_lordCards.active = this.curLogic.get("roomInfo").roomRule.MemoryCard == 0;
        } else if (this.curLogic.get("process") == CONFIGS.gameProcess.pillgae) {
            console.log("叫分阶段的发牌");
            this.refAllCard();
        } else if (this.curLogic.get("process") == CONFIGS.gameProcess.gamefinish) {
            this.refAllCard();
        }
    },

    refAllCard() {
        console.log("牌数据是否正确", this.curLogic.get("myCardList"))
        this.removeDealerCardNode();
        this.refMyCards(this.curLogic.get("myCardList"));
        for (let i = 0; i < 3; i++) {
            this.isShowAlarm(i)
            if (i != 0) {
                let cardNum = this.curLogic.get(`cardNumViewId${i}`);
                this[`node_viewSeat${i}`].active = true;
                this[`node_viewSeat${i}`].getChildByName('cardNum').getComponent(cc.Label).string = cardNum;
            }
        }
    },

    onProcess() {
        let processSt = this.curLogic.get("process");
        if (processSt == CONFIGS.gameProcess.loop) {
            this.refreshBaseScore();
            this.cancelSelect();
        }
    },
    //托管的时候把已经选中的牌取消，并且清理数据
    onAutoPlay() {
        let isAuto = this.curLogic.get("isAuto");
        if (!isAuto[this.curLogic.getMySeatID()]) {
            return;
        }
        this.cancelSelect();
    },
    onDealCard() {
        if (this.fapaiCount > 1) {
            this.redealcard.active = true;
            this.timerPool.push(setTimeout(() => {
                this.node_myHandCard.removeAllChildren();
                this.clearHandCard();
                this.removeDealerCardNode();
                this.redealcard.active = false;
                let cardList = this.curLogic.get("myCardList");
                this.dealCards(cardList);
                this.dealOtherCards();
            }, 1500))
        } else {
            this.timerPool.push(setTimeout(() => {
                this.clearHandCard();
                this.removeDealerCardNode();
                let cardList = this.curLogic.get("myCardList");
                this.dealCards(cardList);
                this.dealOtherCards();
            }, 1000))
        }
        this.fapaiCount++;
    },
    //清理自己的手牌和别人的手牌
    clearHandCard() {
        this.node_dealCard.removeAllChildren();
        this.node_viewSeat1.active = false;
        this.node_viewSeat2.active = false;
    },
    //牌打出去
    onPlayCardResult() {
        let seatID = this.curLogic.get("opSeatId");
        let viewID = this.curLogic.getViewSeatID(seatID);
        this.refreshGameTimes();
        if (viewID == 0) {
            cc.log("托管有没有进来？")
            if (this.curLogic.get("isAuto")[this.curLogic.getMySeatID()]
                || (this.outCardList.length == 0 && this.curLogic.get("curOutCard").length != 0)) {
                cc.log("this.curLogic.get)", this.curLogic.get("tempOutCard"))
                this.autoPlayCard(this.curLogic.get("tempOutCard"));
            } else {
                this.playCard();
            }
            this.clearMyCardData();
        } else if (viewID == 1) {
            let cardNum1 = this.curLogic.get("cardNumViewId1");
            this.node_viewSeat1.active = (cardNum1 != 0);
            this.node_viewSeat1.getChildByName('cardNum').getComponent(cc.Label).string = cardNum1;
            this.playOnlyCardEffect(seatID, cardNum1);
        } else if (viewID == 2) {
            let cardNum2 = this.curLogic.get("cardNumViewId2");
            this.node_viewSeat2.active = (cardNum2 != 0)
            this.node_viewSeat2.getChildByName("cardNum").getComponent(cc.Label).string = cardNum2;
            this.playOnlyCardEffect(seatID, cardNum2);
        }
        this.isShowAlarm(viewID);
    },

    onLandownerResult () {
        this.refreshGameTimes();
    },
    /**
     * @describe: 播放剩余2张或者1张牌时候的音效
     * @param viewID : 座位号
     * @param cardNum : 牌数
     */
    playOnlyCardEffect(seatID, cardNum) {
        let sexFlag = this.curLogic.players[seatID].sex;
        let viewID = this.curLogic.getViewSeatID(seatID);
        if (cardNum === 1 && this.only1AudioFlag[viewID] == 1) {
            console.log("剩牌音效1", viewID, sexFlag)
            this.only1AudioFlag[viewID]++;
            glGame.audio.playSoundEffect(this.only1Audio[sexFlag]);
        } else if (cardNum === 2 && this.only2AudioFlag[viewID] == 1) {
            console.log("剩牌音效2", viewID, sexFlag)
            this.only2AudioFlag[viewID]++;
            glGame.audio.playSoundEffect(this.only2Audio[sexFlag]);
        }
    },
    //确认地主
    onHandCards() {
        this.fapaiCount = 1;
        let lordCard = this.curLogic.get("lordCards");
        this.showLoadCards(lordCard);
        this.removeDealerCardNode();
        let cardList = this.curLogic.get("myCardList");
        this.refMyCards(cardList);
        let seatId = this.curLogic.get("landlordID");
        let viewId = this.curLogic.getViewSeatID(seatId);
        if (viewId == 0) {
            this.SelectCard(lordCard);
        } else if (viewId == 1) {
            let cardNum1 = this.curLogic.get("cardNumViewId1");
            this.node_viewSeat1.getChildByName('cardNum').getComponent(cc.Label).string = cardNum1;
        } else if (viewId == 2) {
            let cardNum2 = this.curLogic.get("cardNumViewId2");
            this.node_viewSeat2.getChildByName("cardNum").getComponent(cc.Label).string = cardNum2;
        }
    },

    onGameOver() {
        this.refreshGameTimes();
        this.node_viewSeat0.getChildByName("alarm").active = false;
        this.hideOthersCards(1);
        this.hideOthersCards(2);
        this.closeSelectEvent(this.node_myHandCard);
    },

    hideOthersCards(viewid) {
        this[`node_viewSeat${viewid}`].getChildByName("cardNum").active = false;
        this[`node_viewSeat${viewid}`].getChildByName("alarm").active = false;
        this[`node_viewSeat${viewid}`].getChildByName("threeCard").active = false;
    },

    OnDestroy() {
        this.unRegisterEvent()
        this.unRegisterGlobalEvent()
        if (this.timerPool) {
            this.timerPool.forEach((timer) => { clearTimeout(timer) })
            this.timerPool = []
        }
    },
    //绑定牌事件
    bindSelectEvent(node) {
        node.on("touchstart", this.clickCallBack, this);
        node.on("touchmove", this.moveCallBack, this);
        node.on("touchend", this.moveEndCallBack, this);
        node.on("touchcancel", this.moveCancelCB, this);
    },

    closeSelectEvent(node) {
        node.off("touchstart", this.clickCallBack, this);
        node.off("touchmove", this.moveCallBack, this);
        node.off("touchend", this.moveEndCallBack, this);
        node.off("touchcancel", this.moveCancelCB, this);
    },
    //================选牌的点击事件回调=====================

    //手牌托选，在start和move过程中只改变手牌的颜色，作为选中标记
    //在end的中通过颜色标记统一进行数据的管理
    clickCallBack(event) {
        console.log("selectcard click")
        this.startPosX = event.target.parent.convertToNodeSpace(event.getLocation()).x;
        //console.log("target pos ", this.startPosX);
        let cards = event.target.children;
        for (let i = 0; i < cards.length; ++i) {
            let posLeftX = cards[i].x - cards[i].width / 2;
            let posRightX = cards[i].x - cards[i].width / 26;
            if (i == cards.length - 1) {
                posRightX = cards[i].x + cards[i].width / 2;
            }
            if (this.startPosX >= posLeftX && this.startPosX <= posRightX) {
                console.log("selectcard clicked")
                cards[i].color = cc.Color.GRAY;
            }
        }
    },

    moveCallBack(event) {
        let curMovePos = event.getLocation();
        let curMovePosX = event.target.parent.convertToNodeSpace(curMovePos).x;
        let cards = event.target.children;
        for (let i = 0; i < cards.length; ++i) {
            let posX = cards[i].x;
            let start = this.startPosX;
            let end = curMovePosX;
            if (i == cards.length - 1 && this.startPosX > curMovePosX) {
                end = end - cards[i].width / 2;
            }
            if (i == cards.length - 1 && this.startPosX < curMovePosX) {
                start = start - cards[i].width / 2;
            }
            //从右往左
            if (posX - cards[i].width / 2 <= start && posX - cards[i].width / 26 >= end) {
                cards[i].color = cc.Color.GRAY;
                //console.log("selected card index", i)
            }
            //从左往右
            else if (posX - cards[i].width / 26 >= start && posX - cards[i].width / 2 <= end) {
                cards[i].color = cc.Color.GRAY;
                //console.log("selected card index", i)
            }
            else {
                if ((this.startPosX - curMovePosX > 40 && this.startPosX > curMovePosX)
                    || (curMovePosX - this.startPosX > 40 && curMovePosX > this.startPosX)) {
                    console.log("cccccccccc");
                    cards[i].color = cc.Color.WHITE;
                }
            }
        }
    },

    moveEndCallBack(event) {
        console.log("selectcard move end")
        let myCardList = this.curLogic.get("myCardList");
        let cards = event.target.children;
        for (let i = 0; i < cards.length; ++i) {
            if (cards[i].color.equals(cc.Color.GRAY)) {
                if (cards[i].y == 20) {
                    cards[i].y = 0;
                    cards[i].color = cc.Color.WHITE;
                    this.spliceCard(i);

                    continue;
                }
                cards[i].y = 20;
                cards[i].color = cc.Color.WHITE;
                this.willOut.push(i);
                let cardData = Number(myCardList[i]);
                this.outCardList.push(cardData);
            }
        }
        glGame.audio.playSoundEffect(this.selectAudio);
        console.log('array info2', this.willOut, this.outCardList, myCardList)
        //根据上家出牌的牌型进行选中牌的智能匹配
        this.judgeOutCardList();
        this.startPosX = null;
        glGame.emitter.emit("selectCardEnd")
    },

    moveCancelCB(event) {
        console.log("selectcard move cancel")
        let myCardList = this.curLogic.get("myCardList");
        let cards = event.target.children;
        for (let i = 0; i < cards.length; ++i) {
            //console.log("equals?", i, cards[i].color.equals(cc.Color.GRAY))
            if (cards[i].color.equals(cc.Color.GRAY)) {
                if (cards[i].y == 20) {
                    cards[i].y = 0;
                    cards[i].color = cc.Color.WHITE;
                    this.spliceCard(i);

                    //console.log('array info', this.willOut)
                    continue;
                }
                cards[i].y = 20;
                cards[i].color = cc.Color.WHITE;
                this.willOut.push(i);       //csy
                let cardData = Number(myCardList[i]);
                this.outCardList.push(cardData);
            }
        }
        glGame.audio.playSoundEffect(this.selectAudio);
        console.log('array info2', this.willOut, this.outCardList, myCardList)
        //根据上家出牌的牌型进行选中牌的智能匹配
        this.judgeOutCardList();
        this.startPosX = null;
        glGame.emitter.emit("selectCardEnd")
    },

    judgeOutCardList() {
        let result = null;
        Judgement.SortCardList(this.outCardList, 1);
        let tempCards = this.curLogic.get("referPokers");
        if (!tempCards.pokerArr) return;
        console.log("是否有进行牌型匹配判断", tempCards.pokerArr);
        let cardType = Judgement.GetCardType(tempCards.pokerArr);
        let resultCards = [];
        switch (cardType) {
            case CONFIGS.cardType.CT_THREE_LINE:
                result = Judgement.SearchThreeTwoLine(this.outCardList);
                console.log("judgeOutCardList three line", result)
                //if(result.count && result.count!=0){
                //    resultCards = result.result.cbResultCard[0];
                //}
                break;
            case CONFIGS.cardType.CT_DOUBLE_LINE:
                result = Judgement.SearchLineCardType(this.outCardList, 0, 2, 0);
                console.log("judgeOutCardList double line", result)
                break;
            case CONFIGS.cardType.CT_SINGLE_LINE:
                result = Judgement.SearchLineCardType(this.outCardList, tempCards.pokerArr, 1, tempCards.pokerArr.length);
                console.log('judgeOutCardList single line', result, this.outCardList)
                break;
            case CONFIGS.cardType.CT_THREE_TAKE_ONE:
                result = Judgement.SearchTakeCardType(this.outCardList, 0, 3, 1);
                console.log("judgeOutCardList three take one", result, this.outCardList)
                break;
            case CONFIGS.cardType.CT_THREE_TAKE_TWO:
                result = Judgement.SearchTakeCardType(this.outCardList, 0, 3, 2);
                console.log("judgeOutCardList three take two", result, this.outCardList)
                break;
            case CONFIGS.cardType.CT_FOUR_TAKE_ONE:
                result = Judgement.SearchTakeCardType(this.outCardList, 0, 4, 1);
                console.log("judgeOutCardList four take one", result, this.outCardList)
                break;
            case CONFIGS.cardType.CT_BOMB_CARD:
                result = Judgement.SearchSameCard(this.outCardList, 0, 4);
                console.log("judgeOutCardList four", result, this.outCardList)
                break;
            case CONFIGS.cardType.CT_FOUR_TAKE_TWO:
                result = Judgement.SearchTakeCardType(this.outCardList, 0, 4, 2);
                console.log("judgeOutCardList four take two", result, this.outCardList)
                break;
        }
        if (result && result.count && result.count != 0) {
            resultCards = result.result.cbResultCard[0]
            console.log("牌型所需的牌", resultCards);
            this.cardMoveBack(resultCards);
        }
    },

    cardMoveBack(resultCards) {
        let myCardList = this.curLogic.get("myCardList");
        for (let j = 0; j < this.outCardList.length;) {
            let cancelSel = true;
            for (let i = 0; i < resultCards.length; i++) {
                console.log("judgeOutCardList 是否在组合中", this.outCardList[j], resultCards[i])
                if (this.outCardList[j] == resultCards[i]) {
                    cancelSel = false;
                }
            }
            if (cancelSel) {
                console.log("judgeOutCardList 需要撤回的卡牌", this.outCardList[j])
                let index = myCardList.indexOf(this.outCardList[j])
                let cards = this.node_myHandCard.children;
                cards[index].y = 0;
                cards[index].color = cc.Color.WHITE;
                this.spliceCard(index);
            }
            if (!cancelSel) j++;
        }
    },

    spliceCard(index) {
        for (let i = 0; i < this.willOut.length; ++i) {
            if (index == this.willOut[i]) {
                this.willOut.splice(i, 1);
                for (let j = 0; j < this.outCardList.length; j++) {
                    let myCardList = this.curLogic.get("myCardList");
                    if (myCardList[index] == this.outCardList[j]) {
                        this.outCardList.splice(j, 1);
                        break;
                    }
                }
                break;
            }
        }
        console.log(`移除了index为${index}后的牌`, this.willOut, this.outCardList)
    },
    //================点击事件回调=====================

    start() {

    },
    //托管自动打牌手牌的渲染
    autoPlayCard(cardList) {
        let myCardNodes = this.node_myHandCard.children;
        cc.log("托管自动打牌cardList", cardList);
        for (let j = myCardNodes.length - 1; j >= 0; j--) {
            for (let i = 0; i < cardList.length; i++) {
                if (myCardNodes[j].cardValue == cardList[i]) {
                    cc.log("托管自动打牌myCardList", j)
                    myCardNodes[j].removeFromParent();
                    break;
                }
            }
        }
        if (myCardNodes.length != 0 && this.curLogic.get("landlordID") == this.curLogic.getMySeatID()) {
            myCardNodes[myCardNodes.length - 1].children[0].active = true;
        }
    },

    getPassDataIndex(searchResultData) {
        let arrPass = [],
            cardType = Judgement.GetCardType(searchResultData[0]);
        if (cardType != CONFIGS.cardType.CT_SINGLE && cardType != CONFIGS.cardType.CT_DOUBLE) return arrPass;
        for (let i = 0; i < searchResultData.length; i++) {
            if (!this.isFirstTip(searchResultData[i][0], cardType)) {
                arrPass.push(i);
            }
        }
        if (arrPass.length == searchResultData.length) {
            return arrPass = [];
        }
        return arrPass;
    },

    isFirstTip(cardData, cardType) {
        let
            myCardList = this.curLogic.get("myCardList"),
            logicValue = Judgement.GetCardLogicValue(cardData),
            count = 0;
        for (let j = 0; j < myCardList.length; j++) {
            if (logicValue == Judgement.GetCardLogicValue(myCardList[j])) {
                count++;
            }
        }
        if (cardType == CONFIGS.cardType.CT_SINGLE && count >= 2) {
            return false;
        } else if (cardType == CONFIGS.cardType.CT_DOUBLE && count >= 3) {
            return false;
        }
        return true;
    },

    //切换自动选牌
    tipSelectCard() {
        this.cancelSelect();
        let searchOutCardIndex = this.curLogic.get("searchOutCardIndex");
        let searchOutCardData = this.curLogic.get("searchOutCardData");
        if (!searchOutCardData.result) return;
        let cardData = searchOutCardData.result.cbResultCard;
        let arrPass = this.getPassDataIndex(cardData);
        console.log("跳过的组合", arrPass)
        console.log("未筛选的组合", cardData)
        let isFirst = true;
        for (let i = 0; i < arrPass.length; i++) {
            if (arrPass[i] == searchOutCardIndex) {
                isFirst = false;
                console.log("需要跳过的组合", searchOutCardIndex, cardData[searchOutCardIndex])
            }
        }
        if (cardData[searchOutCardIndex].length != 0 && isFirst) {
            this.SelectCard(cardData[searchOutCardIndex]);
        } else {
            this.nextTipData();
            this.tipSelectCard();
            return;
        }
        this.nextTipData();
    },
    //自动选牌
    SelectCard(cardList) {
        let node = this.node_myHandCard;
        console.log("selectcard", node.children);
        for (let i = 0; i < cardList.length; i++) {
            console.log("提示牌是否为数组", Array.isArray(cardList[i]))
            if (Array.isArray(cardList[i])) {
                let arr = cardList[i];
                for (let k = 0; k < arr.length; k++) {
                    this.addToOutCardList(arr[k])
                }
            } else {
                this.addToOutCardList(cardList[i])
            }
        }
    },

    addToOutCardList(cardData) {
        let node = this.node_myHandCard;
        let myCardList = this.curLogic.get("myCardList");
        for (let j = 0; j < myCardList.length; j++) {
            if (myCardList[j] == cardData) {
                //把手牌选中，把牌的数据存入牌
                this.outCardList.push(cardData);
                this.willOut.push(j)
                console.log("aaaaaaaaaaaaa", j)
                node.children[j].y = 20;
                // node.children[j].color = cc.Color.GRAY;
            }
        }
    },

    nextTipData() {
        let searchOutCardIndex = this.curLogic.get("searchOutCardIndex");
        if (searchOutCardIndex == 0) {
            this.curLogic.set("searchOutCardIndex", this.curLogic.get("searchOutCardLength") - 1);
        } else {
            this.curLogic.set("searchOutCardIndex", searchOutCardIndex - 1);
        }
    },

    //取消选牌
    cancelSelect() {
        this.outCardList.splice(0, this.outCardList.length);
        for (let i = 0; i < this.node_myHandCard.childrenCount; i++) {
            let node = this.node_myHandCard.children[i];
            node.y = 0;
            node.color = cc.Color.WHITE;
        }
        this.willOut.splice(0, this.willOut.length);
        this.outCardList.splice(0, this.outCardList.length);
    },
    //出牌把牌删掉
    playCard() {
        let cards = this.node_myHandCard.children;
        let tempOutCard = this.curLogic.get("tempOutCard");
        for (let i = cards.length - 1; i >= 0; i--) {
            for (let j = 0; j < tempOutCard.length; j++) {
                if (cards[i].cardValue == tempOutCard[j]) {
                    console.log("一张一张删除牌节点", i, cards[i].cardValue)
                    cards[i].removeFromParent();
                    break;
                }
            }
        }
        if (cards.length != 0 && this.curLogic.get("landlordID") == this.curLogic.getMySeatID()) {
            cards[cards.length - 1].children[0].active = true;
        }
        this.willOut.splice(0, this.willOut.length);
        cc.log("this.willOut", this.willOut);
    },
    //清除逻辑层的我的卡牌数据
    clearMyCardData() {
        let myCardList = this.curLogic.get("myCardList");
        let outCardList = this.curLogic.get("outCardList");
        let curOutCard = this.curLogic.get("curOutCard");
        let tempOutCard = this.curLogic.get("tempOutCard");
        outCardList.splice(0, outCardList.length); //待检验
        for (let i = myCardList.length - 1; i >= 0; i--) {
            for (let j = 0; j < tempOutCard.length; j++) {
                if (myCardList[i] == tempOutCard[j]) {
                    console.log("一张一张删除", i, myCardList[i])
                    myCardList.splice(i, 1);
                }
            }
        }
        console.log("删除后的牌", this.curLogic.get("myCardList"))
    },
    //检查是否需要显示报警
    isShowAlarm(viewId) {
        if (viewId == 0) {
            // let myCardList = this.curLogic.get("myCardList");
            // if (myCardList.length <= 3) {
            //     this.flag[0]++
            //     // this.node_viewSeat0.getChildByName("alarm").active = true;
            // }
        } else if (viewId == 1) {
            if (this.curLogic.get("cardNumViewId1") <= 3) {
                this.flag[1]++
                this.node_viewSeat1.getChildByName("alarm").active = true;
            }
        } else if (viewId == 2) {
            if (this.curLogic.get("cardNumViewId2") <= 3) {
                this.flag[2]++
                this.node_viewSeat2.getChildByName("alarm").active = true;
            }
        }
        if (viewId != 0 && this.flag[viewId] > 0 && this.flag[viewId] < 2) {
            glGame.audio.playSoundEffect(this.alarmAudio);
        }
    },

    setSingelCardSpriteFrame(node, value) {
        let name = this.getSixValue(value);
        let frame = this.pokerAlast.getSpriteFrame(name);
        node.getComponent(cc.Sprite).spriteFrame = frame;
    },
    //地主牌显示
    showLoadCards(list) {
        if (this.curLogic.get('backgroundState')) {
            for (let i = 0; i < list.length; i++) {
                let node = this.node_lordCards.children[i];
                node.active = true;
                this.setSingelCardSpriteFrame(node, list[i]);
            }
            return;
        }
        for (let i = 0; i < list.length; i++) {
            let node = this.node_lordCards.children[i];
            node.active = true;
            let actionto = cc.scaleTo(0.5, 0, 1)
            let callFunc = cc.callFunc(() => {
                this.setSingelCardSpriteFrame(node, list[i]);
            })
            let actionto1 = cc.scaleTo(0.5, 1, 1)
            node.runAction(cc.sequence(actionto, callFunc, actionto1))
        }
    },

    refreshLordCardsDisplay() {
        // this.node_lordCards.active = true;//!this.curLogic.get("isRecordDisplay")
        // this.node_lordCards.active = !this.curLogic.get("isRecordDisplay")
        this.node_lordCards.active = true;
        this.node_lordCards.position = this.curLogic.get("isRecordDisplay")?cc.v2(-305, 320):cc.v2(-61, 320);
        if (this.curLogic.get("process")<=CONFIGS.gameProcess.pillgae
            || this.curLogic.roomInfo.roomRule.MemoryCard!=1) {
            this.node_lordCards.position = cc.v2(0, 320);
        }
    },
    //其他人发牌
    dealOtherCards() {
        this.node_viewSeat1.active = true;
        this.node_viewSeat2.active = true;
        let aniList = [];
        for (let i = 1; i < 18; ++i) {
            aniList.push(
                cc.callFunc(() => {
                    this.curLogic.set("cardNumViewId1", i);
                    this.curLogic.set("cardNumViewId2", i)
                    let cardNum1 = this.curLogic.get("cardNumViewId1");
                    let cardNum2 = this.curLogic.get("cardNumViewId2");
                    this.node_viewSeat1.getChildByName('cardNum').getComponent(cc.Label).string = cardNum1;
                    this.node_viewSeat2.getChildByName("cardNum").getComponent(cc.Label).string = cardNum2;
                }),
                cc.delayTime(0.1)
            )
        }
        this.node.runAction(cc.sequence(aniList))

    },
    //自己人发牌
    dealCards(list) {
        let dealedArr = [];
        let Cardnode = new cc.Node();
        Cardnode.addComponent(cc.Sprite);
        Cardnode.parent = this.node_dealCard;
        Cardnode.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.CUSTOM;
        Cardnode.width = 103;
        Cardnode.height = 140;
        let name = this.getSixValue(list[0]);
        let frame = this.pokerAlast.getSpriteFrame(name);
        Cardnode.getComponent(cc.Sprite).spriteFrame = frame;
        Cardnode.position = cc.v2(this.node_dealCard.width / 2, 0);
        dealedArr.push(Cardnode);

        let moveX = Cardnode.width * 0.240;
        let aniList = [];
        for (let i = 1; i < list.length; ++i) {
            aniList.push(
                cc.callFunc(() => {
                    Cardnode = Cardnode = new cc.Node();
                    Cardnode.addComponent(cc.Sprite);
                    let index = this.node_dealCard.childrenCount - 1;
                    Cardnode.position = this.node_dealCard.children[index].position;
                    Cardnode.parent = this.node_dealCard;
                    Cardnode.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.CUSTOM;

                    Cardnode.width = 103;
                    Cardnode.height = 140;
                    name = this.getSixValue(list[i]);
                    frame = this.pokerAlast.getSpriteFrame(name);
                    Cardnode.getComponent(cc.Sprite).spriteFrame = frame;
                    glGame.audio.playSoundEffect(this.dealAudio);
                }),
                cc.delayTime(0.03),
                cc.callFunc(() => {
                    for (let k = 0; k < dealedArr.length; k++) {
                        let moveby = cc.moveBy(0.05, cc.v2(-moveX, 0));   //这个0.05是（0.03+0.07）/2
                        dealedArr[k].runAction(moveby);
                    }
                    let moveby1 = cc.moveBy(0.05, cc.v2(moveX, 0));
                    Cardnode.runAction(moveby1);
                    dealedArr.push(Cardnode);
                }),
                cc.delayTime(0.07)
            )
        }
        // aniList.push(cc.callFunc(() => {
        //     console.log("发地主牌")
        //     this.onDealLordCard();
        // }));
        aniList.push(cc.callFunc(() => {
            this.removeDealerCardNode();
            let cardList = this.curLogic.get("myCardList");
            this.refMyCards(cardList);
        }));
        this.node.runAction(cc.sequence(aniList))
    },

    onDealLordCard() {
        let lordCards = this.node_lordCards.children;
        for (let i = 0; i < lordCards.length-1; i++) {
            lordCards[i].active = true;
            let originalPos = lordCards[i].position;
            lordCards[i].position = cc.v2(0, -360);
            lordCards[i].scale = 0.2;
            let
                actSpawn = cc.spawn(cc.scaleTo(0.2, 1), cc.moveTo(0.2, originalPos)),
                actSequence = cc.sequence(cc.delayTime(0.1 * i), actSpawn, cc.callFunc(() => {
                    glGame.audio.playSoundEffect(this.dealAudio);
                }));
            lordCards[i].runAction(actSequence);
        }
    },

    //渲染自己的手牌
    removeDealerCardNode() {
        //for (let i = 0; i < this.node_dealCard.childrenCount;) {
        //    this.node_dealCard.children[i].removeFromParent();
        //}
        this.node_dealCard.removeAllChildren();
    },
    //根据数组渲染自己的手牌
    refMyCards(cardList) {
        this.node_myHandCard.removeAllChildren();
        for (let i = 0; i < cardList.length; i++) {
            let Cardnode = new cc.Node();
            Cardnode.addComponent(cc.Sprite);
            Cardnode.parent = this.node_myHandCard;
            Cardnode.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.CUSTOM;
            Cardnode.width = 103;
            Cardnode.height = 140;
            let name = this.getSixValue(cardList[i]);
            let frame = this.pokerAlast.getSpriteFrame(name);
            Cardnode.getComponent(cc.Sprite).spriteFrame = frame;
            Cardnode.cardValue = cardList[i];
            let landLordSeatId = this.curLogic.get('landlordID');
            if ((landLordSeatId || landLordSeatId == 0) && landLordSeatId == this.curLogic.getMySeatID()) {
                let cardIconNode = new cc.Node();
                cardIconNode.anchorX = 1;
                cardIconNode.anchorY = 0;
                cardIconNode.position = cc.v2(Cardnode.width / 2 - 2, -Cardnode.height / 2 + 4);
                cardIconNode.addComponent(cc.Sprite);
                cardIconNode.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.CUSTOM;
                cardIconNode.parent = Cardnode;
                cardIconNode.getComponent(cc.Sprite).spriteFrame = this.spf_cardIcon;
                cardIconNode.active = i == cardList.length - 1;
            }
        }
    },
    //得到牌的名字
    getSixValue(card) {
        card = parseInt(card);
        let str = card < 14 ? "bull1_0x0" : "bull1_0x";
        return str + card.toString(16);
    },
    // update (dt) {},
});

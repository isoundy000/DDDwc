glGame.baseclass.extend({

    properties: {
        pokerAlast: cc.SpriteAtlas,

        lab_allBet:cc.Label,
        lab_settle:cc.Label,

        gameSeries: cc.Label,
        gameType: cc.Label,
        gameBaseBet: cc.Label,
        gameProfit: cc.Node,
        myCard0:cc.Node,
        myCard1:cc.Node,
        oneCard:cc.Node,
        bankCard:cc.Node,
    },

    onLoad () {
        this.initData();
        this.refreshGameInfoContent();
        this.refreshPlayerItem();
    },

    initData () {
        console.log("recordrecordrecordrecord", this.recordDetailsData);
        this.roomTypeTitle = ['初级房', '中级房', '高级房', '贵宾房', '富豪房', '体验房'];
        this.seriesNum = this.recordDetailsData.hand_number;
        this.roomType = this.recordDetailsData.bettype;
        this.baseBet = this.recordDetailsData.baseChip;
        this.winCoin = this.recordDetailsData.number;
        this.gainFee = this.recordDetailsData.gainFee;
        this.players = JSON.parse(this.recordDetailsData.record);
        console.log("recordrecordrecordrecord2", this.players);
    },

    refreshGameInfoContent () {
        
        this.gameSeries.string = this.seriesNum;
        this.gameType.string = this.roomTypeTitle[this.roomType-1];
        this.gameBaseBet.string = this.getFloat(this.baseBet);
        let winNum = this.getFloat(this.winCoin);
        this.gameProfit.getComponent(cc.Label).string = winNum>0 ? `+${winNum}` : winNum;
        this.gameProfit.color = winNum>0 ? new cc.Color(0, 255, 0) : new cc.Color(255, 0, 0);
    },
    //设置牌值，牌型，对局状态
    //cards,牌列表     cardNode 节点 player玩家    isDouble是否双倍
    setCardValue(cards,cardNode,player,isDouble){
        for(let i = 0; i<cards.length;i++){
            cardNode.children[0].children[i].active = true;
            cardNode.children[0].children[i].getComponent(cc.Sprite).spriteFrame=this.pokerAlast.getSpriteFrame(this.getSixValue(cards[i]));
        }
        let data = this.getCardvalueOfArray(cards)
        let point = data.isTwoResult?data.value[0]+"/"+data.value[1]:data.value;
        let cardType = this.judgeCardType(cards)
        cardNode.children[1].getComponent(cc.Label).string =cardType == 2? point+'点':cardType;
        cardNode.children[1].active = true;
        let baoxian =player.isEnsure;
        cardNode.children[3].active =baoxian;
        if(isDouble) cardNode.children[2].active = true;
    },
    refreshPlayerItem () {
        let allPlayer =this.players.players;
        for(let key in allPlayer){ 
            if (allPlayer[key].logicid == glGame.user.get("logicID")) {
                this.setCardValue(allPlayer[key].cardInfoList[0].cards,this.oneCard,allPlayer[key],allPlayer[key].cardInfoList[0].isDouble)
                let winCoin =allPlayer[key].totalWin>0?'+'+allPlayer[key].totalWin:allPlayer[key].totalWin;
                this.lab_allBet.string = this.getFloat(allPlayer[key].betCoin);
                this.lab_settle.string = winCoin >0?'+'+this.getFloat(winCoin):this.getFloat(winCoin);
                this.lab_settle.node.color = allPlayer[key].totalWin>0?new cc.Color(0, 255, 0) : new cc.Color(255, 0, 0);
                if(allPlayer[key].isSperated){
                    this.oneCard.active =false;
                    this.setCardValue(allPlayer[key].cardInfoList[0].cards,this.myCard0,allPlayer[key],allPlayer[key].cardInfoList[0].isDouble)
                    this.setCardValue(allPlayer[key].cardInfoList[1].cards,this.myCard1,allPlayer[key],allPlayer[key].cardInfoList[1].isDouble)
                    this.myCard0.y = 90
                    this.myCard1.y = 0;                    
                }
            }
        }
        for(let j=0 ;j<this.players.bankerCards.length;j++){
            this.bankCard.children[0].children[j].active =true;
            this.bankCard.children[0].children[j].getComponent(cc.Sprite).spriteFrame = this.pokerAlast.getSpriteFrame(this.getSixValue(this.players.bankerCards[j]));
        }
        let bankeData = this.getCardvalueOfArray(this.players.bankerCards)
        let bankType = this.judgeCardType(this.players.bankerCards)
        let bankPoint = bankeData.isTwoResult?bankeData.value[0]+"/"+bankeData.value[1]:bankeData.value;
        this.bankCard.children[2].getComponent(cc.Label).string = bankType ==2? bankPoint +'点':bankType

    },

    refreshCards (nodes, cardData) {
        for (let i=0; i<cardData.length; i++) {
            nodes[i].getComponent(cc.Sprite).spriteFrame = this.pokerAlast.getSpriteFrame(this.getSixValue(cardData[i]));
        }
    },

    getSixValue(card) {
        card = parseInt(card);
        let str = card < 14 ?  "bull1_0x0" : "bull1_0x";
        return str + card.toString(16);
    },

    onClick (name, node) {
        switch (name) {
            case "close": this.close_cb(); break;
            default: console.error(name);
        }
    },

    close_cb() {
        if (this["modelType"] == 1) {
            this.node.parent.parent.getChildByName("panel").active = true;
            this.node.parent.parent.getChildByName("mask").active = true;
        }
        this.remove();
    },

    getFloat (value) {
        return (Number(value).div(100)).toString();
    },

    set (key, value) {
        this[key] = value;
    },

    get (key) {
        return this[key];
    },
    getCardvalueOfArray(array) {
        /** 点数和 */
        let points = 0;
        /** 牌A的数量 */
        let cardANum = 0;
        let otherPoints = -1;
        for (let index = 0; index < array.length; index++) {
            const value = this.getCardvalue(array[index]);
            if (value === 1) {
                // 牌A当作1
                // cardANum++;
                cardANum += 1;
            }
            points += value;
        }
        // 有牌A存在的时候，如果有多张A，也只算一张A的值为11
        if (cardANum >= 1) {
            otherPoints = points + 10;
        }

        if (otherPoints !== -1 && otherPoints <= 21) {
            return { isTwoResult: true, value: [points, otherPoints] };
        }
            return { isTwoResult: false, value: [points] };
    },
    getCardvalue(logicNum) {
        let value = logicNum & 0x0f;
        if (value >= 10) { value = 10; }
        return value;
    },
    //判断牌型
    judgeCardType(value) {
        let obj = this.getCardvalueOfArray(value);
        let points = obj.isTwoResult ? obj.value[1] : obj.value[0];
        console.log('点数',points)
        let result;
        /** 爆牌 */
        if (points > 21) {
            result = '爆牌';
        /** 黑杰克 */
        } else if (points === 21 && value.length === 2) {
            result = '黑杰克';
        /** 五小龙 */
        } else if (points <= 21 && value.length === 5) {
            result = '五小龙';
        }else {
            result = 2;
        }
        return result;
    },

    // start () {

    // },
    // update (dt) {},
});

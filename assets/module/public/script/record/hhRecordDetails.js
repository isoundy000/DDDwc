

glGame.baseclass.extend({

    properties: {
        gameInfoContent: cc.Node,
        redBetDetails: cc.Node,
        blackBetDetails: cc.Node,
        luckBetDetails: cc.Node,
        redResult: cc.Node,
        blackResult: cc.Node,
        redCards: cc.Node,
        blackCards: cc.Node,
        redCardType: cc.Sprite,
        blackCardType: cc.Sprite,
        pokerAlast: cc.SpriteAtlas,
        cardType: [cc.SpriteFrame],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.declareNodeValue();
        this.refreshBetDetails();
        this.refreshGameInfo();
        this.refreshWinArea();
        this.refreshCard();
    },

    declareNodeValue () {
        //区域下注情况的key对应的节点名称
        this.betDetailsNodeValue = {1:'blackBetDetails', 2:'redBetDetails', 3:'luckBetDetails'};
        //betType值对应的string值
        this.roomTypeStr = {1:"初级房",2:"中级房",3:"高级房",4:"贵宾房",5:"富豪房",99:"体验房"};
        //拆分数据
        //外层数据
        this.gameInfo = this.recordDetailsData;
        console.log("recordrecordrecord2", JSON.parse(this.gameInfo.record));
        this.gameSeries = this.gameInfo.hand_number;                //牌局编号
        this.roomType = this.gameInfo.bettype;                      //牌局类型
        this.gameProfit = this.gameInfo.number;                     //收益
        this.gameWinCoin = this.gameInfo.winning_coin;                    //抽水
        //record数据
        let record = JSON.parse(this.gameInfo.record);
        this.betInfo = record.chipInfo;                             //玩家各区域的下注数据
        this.settleInfo = record.areaSettleInfo;                    //玩家各区域的结算数据
        this.winArea = record.winDirType;                           //开牌结果
        let cards = record.cards;
        console.log("zmy cards", cards)
        for (let i in cards) {
            if (cards[i].tag == 1) {
                this.blackCardData = cards[i].cardIdList;           //黑方的牌
                this.blackType = cards[i].curType;                  //黑方的牌型
                this.sortCard(this.blackCardData);
            }
            else {
                this.redCardData = cards[i].cardIdList;             //红方的牌
                this.redType = cards[i].curType;                    //黑方的牌型
                this.sortCard(this.redCardData);
            }
        }
    },

    sortCard (cards) {
        cards.sort(function(a, b){
            return b%16-a%16;
        });
        if (cards[2]%16==1) {
            [cards[0], cards[1], cards[2]] = [cards[2], cards[0], cards[1]]
        }
        if (cards[1] % 16 == cards[2] % 16) {
            [cards[0], cards[2]] = [cards[2], cards[0]];
        }
    },

    start () {

    },
    //刷新下注详情以及结算详情
    refreshBetDetails () {
        for (let key in this.betInfo) {
            if (!this.betInfo[key]) continue;
            let refreshNode = this[this.betDetailsNodeValue[key]];
            let betNumNode =  refreshNode.getChildByName('bet').getChildByName('betNum');
            refreshNode.active = true;
            betNumNode.getComponent(cc.Label).string = this.getFloat(this.betInfo[key]);
            // betNumNode.color = new cc.Color(0, 161, 11);
        }

        for (let key in this.settleInfo) {
            if (!this.settleInfo[key]) continue;
            let refreshNode = this[this.betDetailsNodeValue[key]];
            let settleNumNode = refreshNode.getChildByName('settle').getChildByName('settleNum');
            settleNumNode.getComponent(cc.Label).string = this.settleInfo[key]>0 ? `+${this.getFloat(this.settleInfo[key])}` : this.getFloat(this.settleInfo[key]);
            settleNumNode.color = this.settleInfo[key]>0 ? new cc.Color(0, 161, 11) : new cc.Color(255, 0, 0);
        }
    },
    //刷新牌
    refreshCard () {
        let redCardNodes = this.redCards.children;
        for (let i=0; i<redCardNodes.length; i++) {
            let newSpriteFrame = this.pokerAlast.getSpriteFrame(this.getSixValue(this.redCardData[i]));
            redCardNodes[i].getComponent(cc.Sprite).spriteFrame = newSpriteFrame;
        }

        let blackCardNodes = this.blackCards.children;
        for (let i=0; i<blackCardNodes.length; i++) {
            let newSpriteFrame = this.pokerAlast.getSpriteFrame(this.getSixValue(this.blackCardData[i]));
            blackCardNodes[i].getComponent(cc.Sprite).spriteFrame = newSpriteFrame;
        }

        this.refreshCardType();
    },


    getSixValue(card) {
        card = parseInt(card);
        let str = card < 14 ?  "bull1_0x0" : "bull1_0x";
        return str + card.toString(16);
    },
    //刷新牌型
    refreshCardType () {
        this.redCardType.spriteFrame = this.getCardTypeFrame(this.redType);
        this.blackCardType.spriteFrame = this.getCardTypeFrame(this.blackType);
    },
    //获取牌型的贴图
    getCardTypeFrame (value) {
        console.log('zmy cardType', value)
        if (value>15) {
            return this.cardType[value-7];
        }
        if (value>1) {
            return this.cardType[value-5];
        }
        if (value<=1) {
            return this.cardType[value];
        }
    },
    //刷新牌局的总体记录
    refreshGameInfo () {
        this.gameInfoContent.getChildByName('gameSeries').getComponent(cc.Label).string = this.gameSeries;
        this.gameInfoContent.getChildByName('roomType').getComponent(cc.Label).string = this.roomTypeStr[this.roomType];
        this.gameInfoContent.getChildByName('gameCharge').getComponent(cc.Label).string = this.getFloat(this.gameWinCoin);
        this.gameInfoContent.getChildByName('gameProfit').getComponent(cc.Label).string = this.gameProfit>0 ? `+${this.getFloat(this.gameProfit)}` : this.getFloat(this.gameProfit);
        this.gameInfoContent.getChildByName('gameProfit').color = this.gameProfit>0 ? new cc.Color(0, 161, 11) : new cc.Color(255, 0, 0);
    },
    //刷新胜负方的显示
    refreshWinArea () {
        //winArea value: 1-黑方胜，2-红方胜
        this.redResult.getChildByName("win").active = this.winArea==2;
        // this.redResult.getChildByName('normal').active = this.winArea!=2;
        this.blackResult.getChildByName('win').active = this.winArea==1;
        // this.blackResult.getChildByName('normal').active = this.winArea!=1;
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
    }
    // update (dt) {},
});

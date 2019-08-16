glGame.baseclass.extend({

    properties: {
        pokerAlast: cc.SpriteAtlas,
        cardType: [cc.SpriteFrame],
        stateSp: [cc.SpriteFrame],

        gameSeries: cc.Label,
        gameType: cc.Label,
        gameBaseBet: cc.Label,
        gameProfit: cc.Node,

        playersNode: cc.Node,
        content: cc.Node,
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
        this.gameProfit.color = winNum>0 ? new cc.Color(0, 161, 11) : new cc.Color(255, 0, 0);
    },

    refreshPlayerItem () {
        let playerNodes = this.playersNode.children;
        for (let i=0; i<playerNodes.length; i++) {
            if (!this.players[i]) {
                playerNodes[i].active = false;
                continue;
            }
            let idNode = playerNodes[i].getChildByName('id'),
                cardTypeNode = playerNodes[i].getChildByName('cardType'),
                cardNodes = playerNodes[i].getChildByName('cards').children,
                profitNode = playerNodes[i].getChildByName('profit'),
                betNode = playerNodes[i].getChildByName('totalBet'),
                loseStage = playerNodes[i].getChildByName('state'),
                winCoin = this.players[i].winCoin;
            if (this.players[i].logicId == glGame.user.get("logicID")) idNode.color = new cc.Color(255, 108, 0);
            idNode.getComponent(cc.Label).string = this.players[i].nickname;
            profitNode.getComponent(cc.Label).string = winCoin>0 ? `+${this.getFloat(winCoin)}` : this.getFloat(winCoin);
            profitNode.color = winCoin>0 ? new cc.Color(0, 161, 11) : new cc.Color(255, 0, 0);
            betNode.getComponent(cc.Label).string = this.getFloat(this.players[i].totalChip);
            cardTypeNode.getComponent(cc.Sprite).spriteFrame = this.cardType[this.players[i].cardType-1];
            if (this.players[i].loseType==3){
                loseStage.getComponent(cc.Sprite).spriteFrame = this.stateSp[this.players[i].loseType-1];
            } else {
                loseStage.getComponent(cc.Sprite).spriteFrame = this.stateSp[this.players[i].loseType-1];
            }

            this.refreshCards(cardNodes, this.players[i].cards);
        }
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
    }

    // start () {

    // },
    // update (dt) {},
});

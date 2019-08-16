glGame.baseclass.extend({

    properties: {
        pokerAlast: cc.SpriteAtlas,

        gameSeries: cc.Label,
        gameType: cc.Label,
        gameBaseBet: cc.Label,
        gameProfit: cc.Node,
        gameTimes: cc.Label,

        playersNode: cc.Node,
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
        this.recordDetails = JSON.parse(this.recordDetailsData.record);
        this.players = this.recordDetails.players;
        this.times = this.recordDetails.multipleValue;
        this.landlordCards = this.recordDetails.diPai;
        console.log("recordrecordrecordrecord2", this.recordDetails);
    },

    refreshGameInfoContent () {
        this.gameSeries.string = this.seriesNum;
        this.gameType.string = this.roomTypeTitle[this.roomType-1];
        this.gameBaseBet.string = this.getFloat(this.baseBet);
        let winNum = this.getFloat(this.winCoin);
        this.gameProfit.getComponent(cc.Label).string = winNum>0 ? `+${winNum}` : winNum;
        this.gameProfit.color = winNum>0 ? new cc.Color(0, 161, 11) : new cc.Color(255, 0, 0);
        this.gameTimes.string = this.times;
    },

    refreshPlayerItem () {
        let playerNodes = this.playersNode.children;
        let playerIndex = 0;
        for (let key in this.players) {
            let idNode = playerNodes[playerIndex].getChildByName('nickName'),
                cardNodes = playerNodes[playerIndex].getChildByName('handCards').children,
                profitNode = playerNodes[playerIndex].getChildByName('result'),
                landlordIcon = playerNodes[playerIndex].getChildByName('landlordIcon');
            landlordIcon.active = this.players[key].isLandlord;
            if (key == glGame.user.get("logicID")) idNode.color = new cc.Color(255, 108, 0);
            idNode.getComponent(cc.Label).string = this.players[key].nickname;
            let winCoin = this.players[key].winCoin;
            profitNode.getComponent(cc.Label).string = winCoin>0 ? `+${this.getFloat(winCoin)}` : ' '+this.getFloat(winCoin);
            profitNode.color = winCoin>0 ? new cc.Color(0, 161, 11) : new cc.Color(255, 0, 0);

            this.refreshCards(cardNodes, this.players[key].cards);
            playerIndex++;
        }
    },

    isLandlordCard (cardData) {
        for (let i=0; i<this.landlordCards.length; i++) {
            if (this.landlordCards[i]==cardData) return true;
        }
        return false;
    },

    refreshCards (nodes, cardData) {
        for (let i=0; i<nodes.length; i++) {
            if (!cardData[i]) {
                nodes[i].active = false;
                continue;
            }
            if (this.isLandlordCard(cardData[i])) nodes[i].y += 20;
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


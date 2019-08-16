glGame.baseclass.extend({
    properties: {

        atlas_poker: cc.SpriteAtlas,   //卡牌图集

        resultNode: [cc.Node],
        node_result: cc.Node,            //牌的结果
        node_value: cc.Node,             //标题的值
    },
    onLoad() {
        this.roomType = { 1: "初级房", 2: "中级房", 3: "高级房", 4: "贵宾房", 5: "富豪房", 99: "体验房" }
        this.RefreshInfo(this["recordDetailsData"]);
    },
    onClick(name, node) {
        switch (name) {
            case "close": this.close_cb(); break;
            default: console.error();
        }
    },
    close_cb() {
        if (this["modelType"] == 1) {
            this.node.parent.parent.getChildByName("panel").active = true;
            this.node.parent.parent.getChildByName("mask").active = true;
        }
        this.remove();
    },

    //刷新数据
    RefreshInfo(data) {
        this.setTitle_value(data);
        let record = JSON.parse(this["recordDetailsData"].record);
        let isDealer = record.isDealer;
        this.setDealerWord(isDealer);
        let cards = record.cards;
        let chipInfo = record.chipInfo;
        let areaSettleInfo = record.areaSettleInfo;
        //牌与结果
        for (let key in cards) {
            let resultObj = cards[key].resultObj;
            let resultType = resultObj.resultType;
            let cardIdList = resultObj.cardIdList;

            let CardNode = this.node_result.children[Number(key)].getChildByName("card");
            this.setFiveCard(CardNode, cardIdList);

            let resultTypeNode = this.node_result.children[Number(key)].getChildByName("resultType");
            this.setResultType(resultTypeNode, resultType)
        }
        //下注信息
        for (let key in chipInfo) {
            let value = chipInfo[key];
            let chipNode = this.node_result.children[Number(key)].getChildByName("beted").children[0];
            chipNode.active = true;
            this.setBetInfo(chipNode, value);
        }
        //结算信息
        for (let key in areaSettleInfo) {
            let value = areaSettleInfo[key];
            let settleNode = this.node_result.children[Number(key)].getChildByName("settle").children[0];
            settleNode.active = true;
            this.setSettleInfo(settleNode, value);
        }
    },

    //设置主标题的值
    setTitle_value(data) {
        let no = this.node_value.getChildByName("no").getComponent(cc.Label);
        no.string = data.hand_number;
        let roomType = this.node_value.getChildByName("roomType").getComponent(cc.Label);
        roomType.string = this.roomType[data.bettype];
        let winning_coin = this.node_value.getChildByName("winning_coin");
        // winning_coin.getComponent(cc.Label).string = this.cutDownNum(data.winning_coin);
        this.setLabelColor(winning_coin, data.winning_coin);
        let gain = this.node_value.getChildByName("gain");
        // gain.getComponent(cc.Label).string = this.cutDownNum(data.number);
        this.setLabelColor(gain, data.number);
    },

    //设置字体颜色
    setLabelColor(node, _value) {
        let value = Number(_value);
        node.color = value > 0 ? new cc.Color(0, 255, 0) : new cc.Color(255, 0, 0);
        node.getComponent(cc.Label).string = value > 0 ? "+" + this.cutDownNum(value) : this.cutDownNum(value)
    },

    //设置5张卡牌
    setFiveCard(node, cardsList) {
        for (let i = 0; i < node.childrenCount; i++) {
            let name = this.getSixValue(cardsList[i]);
            let frame = this.atlas_poker.getSpriteFrame(name);
            node.children[i].getComponent(cc.Sprite).spriteFrame = frame;
        }
    },

    //显示牌的类型的特效
    setResultType(node, result) {
        let resNode = cc.instantiate(this.resultNode[result]);
        resNode.parent = node;
        resNode.active = true;
    },
    //设置下注的信息
    setBetInfo(node, value) {
        node.getComponent(cc.Label).string = this.cutDownNum(value);
    },

    //设置结算的信息
    setSettleInfo(node, value) {
        node.getComponent(cc.Label).string = Number(value) > 0 ? `+${this.cutDownNum(value)}` : this.cutDownNum(value);
        this.setLabelColor(node, value);
    },

    //显示庄家标识
    setDealerWord(bool) {
        let dealerWord = this.node_result.children[0].getChildByName("dealerWord");
        dealerWord.active = bool;
    },

    //得到牌的16进制名字
    getSixValue(card) {
        card = parseInt(card);
        let str = card < 14 ? "bull1_0x0" : "bull1_0x";
        return str + card.toString(16);
    },

    //截取小数点后两位
    cutDownNum(value, num = 2) {
        if (isNaN(value)) return;
        if (~~value === value) {
            return value.div(100).toString();
        } else {
            value = Number(value).div(100);
            return (Math.floor(value * 100) / 100).toFixed(num);
        }
    },

    OnDestroy() { },
    set(key, value) {
        this[key] = value;
    },
    get(key) {
        return this[key];
    }
});
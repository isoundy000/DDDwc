const chipTimes = {
    1: 1, 2: 11, 3: 11, 4: 1, 5: 8
};
const fntColor = {
    win: new cc.Color(0, 255, 0),
    lose: new cc.Color(255, 0, 0),
};
const roomType = {
    1:"初级房",2:"中级房",3:"高级房",4:"贵宾房",5:"富豪房",99:"体验房"
};

glGame.baseclass.extend({
    extends: cc.Component,

    properties: {
        atlas_poker: cc.SpriteAtlas,    //卡牌图集
        node_freeCard: cc.Node,
        node_bankerCard: cc.Node,
        spr_freeValue: cc.Sprite,
        spr_bankerValue: cc.Sprite,
        node_resultList: cc.Node,

        lab_gameNo: cc.Label,
        lab_roomType: cc.Label,
        lab_fee: cc.Label,
        lab_profit: cc.Label,
        lab_isDealer: cc.Label,
        sprCount: [cc.SpriteFrame],
        sprDian: [cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initPanel();
    },

    initPanel() {
        if (!this.recordDetailsData) return cc.error('record detail is null');
        let _roomType = roomType[this.recordDetailsData.bettype] || '无';
        let _gameNo = this.recordDetailsData.hand_number || '无';
        let _profit = this.cutDownNum(this.recordDetailsData.number) || '0';
        let _gainFee = this.cutDownNum(this.recordDetailsData.winning_coin) || '0';
        this.lab_roomType.string = _roomType;
        this.lab_gameNo.string = _gameNo;
        this.lab_profit.string = _profit > 0 ? `+${_profit}` : _profit;
        this.lab_profit.node.color = _profit > 0 ? fntColor.win : fntColor.lose;
        this.lab_fee.string = _gainFee;
        let detail = JSON.parse(this.recordDetailsData.record);
        let _isDealer = detail.isDealer;
        this.lab_isDealer.string = _isDealer ? '是' : '否';
        this.initCard(detail.cards);
        this.initChipIn(detail.chipInfo, detail.areaSettleInfo);
        console.log('牌局记录详情', this.recordDetailsData, detail)
    },
    initCard(cardList) {
        let freeCard = cardList[0];
        let bankerCard = cardList[1];
        for (let i = 0; i < freeCard.noSortCards.length; i++) {
            let cardName = `bull1_${this.getSixValue(freeCard.noSortCards[i])}`;
            this.node_freeCard.children[i].getComponent(cc.Sprite).spriteFrame = this.atlas_poker._spriteFrames[cardName];
            this.node_freeCard.children[i].active = true;
        }
        for (let i = 0; i < bankerCard.noSortCards.length; i++) {
            let cardName = `bull1_${this.getSixValue(bankerCard.noSortCards[i])}`;
            this.node_bankerCard.children[i].getComponent(cc.Sprite).spriteFrame = this.atlas_poker._spriteFrames[cardName];
            this.node_bankerCard.children[i].active = true;
        }

        this.spr_freeValue.spriteFrame = this.sprCount[freeCard.resultObj.value];
        this.spr_bankerValue.spriteFrame = this.sprCount[bankerCard.resultObj.value];

        if (freeCard.resultObj.value > 0) {
            this.spr_freeValue.node.getChildByName('dian').getComponent(cc.Sprite).spriteFrame = this.sprDian[1]
        } else {
            this.spr_freeValue.node.getChildByName('dian').getComponent(cc.Sprite).spriteFrame = this.sprDian[0]
        }

        if (bankerCard.resultObj.value > 0) {
            this.spr_bankerValue.node.getChildByName('dian').getComponent(cc.Sprite).spriteFrame = this.sprDian[1]
        } else {
            this.spr_bankerValue.node.getChildByName('dian').getComponent(cc.Sprite).spriteFrame = this.sprDian[0]
        }
        // this.lab_freeValue.string = `${freeCard.resultObj.value}点`;
        // this.lab_bankerValue.string = `${bankerCard.resultObj.value}点`;
    },
    initChipIn(chipInfo, settle) {
        for (let area in chipInfo) {
            let _node = this.node_resultList.children[area - 1];
            let chipLab = _node.getChildByName('chip').getComponent(cc.Label);
            let chipValue = this.cutDownNum(chipInfo[area]);
            chipLab.node.active = true;
            chipLab.string = chipValue;
        }
        for (let area in settle) {
            let _node = this.node_resultList.children[area - 1];
            let settleLab = _node.getChildByName('settle').getComponent(cc.Label);
            let settleValue = this.cutDownNum(settle[area]);
            settleLab.node.active = true;
            settleLab.string = settleValue > 0 ? `+${settleValue}` : settleValue;
            settleLab.node.color = settleValue > 0 ? fntColor.win : fntColor.lose;
        }
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

    //----btn callback------
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

    //获取牌的16进制值
    getSixValue(logicNum) {
        logicNum = parseInt(logicNum);
        let str = logicNum < 14 ? "0x0" : "0x";
        return str + logicNum.toString(16);
    },
    set(_key, _value) {
        this[_key] = _value;
    },

    // update (dt) {},
});

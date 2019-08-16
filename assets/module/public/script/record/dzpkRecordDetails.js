const fntColor = {
    banker: new cc.Color(255, 0, 0),
    player: new cc.Color(152, 72, 0),
    win: new cc.Color(0, 220, 80),
    lose: new cc.Color(255, 0, 0),
};
const roomType = {
    1:"初级房",2:"中级房",3:"高级房",4:"贵宾房",5:"富豪房",99:"体验房"
};
glGame.baseclass.extend({
    extends: cc.Component,

    properties: {
        item_record: cc.Node,
        node_resultList: cc.Node,
        lab_gameNo: cc.Label,
        lab_roomType: cc.Label,
        lab_baseChip: cc.Label,
        lab_profit: cc.Label,
        node_fenge:cc.Node,
        node_myDetail:cc.Node,
        node_public:cc.Node,
        atlas_poker: cc.SpriteAtlas,    //卡牌图集
        img_cardType: cc.SpriteAtlas,  //牌型
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initPanel();
    },

    initPanel() {
        console.log('本剧牌局记录详情:', this.recordDetailsData);
        if (!this.recordDetailsData) return cc.error('record detail is null');
        let recordList = JSON.parse(this.recordDetailsData.record) || [];
        let _roomType = roomType[this.recordDetailsData.bettype] || '无';
        let _gameNo = this.recordDetailsData.hand_number || '无';
        let _profit = this.cutDownNum(this.recordDetailsData.number) || '无';
        let _baseChip = this.cutDownNum(recordList.smallBaseChip) || '无';
        let _baseChip1 = this.cutDownNum(recordList.baseChip) || '无';
        let _commonCards = recordList.commonCards || [];
        this.lab_roomType.string = _roomType;
        this.lab_gameNo.string = _gameNo;
        this.lab_profit.string = _profit > 0 ? `+${_profit}` : _profit;
        this.lab_profit.node.color = _profit > 0 ? fntColor.win : fntColor.lose;
        this.lab_baseChip.string = `${_baseChip}/${_baseChip1}`;
        console.log('战绩详情', recordList)
        for(let i = 0; i <_commonCards.length;i++){
            let cardName = `bull1_${this.getSixValue(_commonCards[i])}`;
            this.node_public.children[i].getComponent(cc.Sprite).spriteFrame = this.atlas_poker._spriteFrames[cardName];
        }
        for (let i = 0; i < recordList.playerArr.length; i++) {
            if(recordList.playerArr[i].logicId == glGame.user.get('logicID')){
                this.node_myDetail.active = true;
                if(recordList.playerArr[i].isBanker){
                    this.node_myDetail.getChildByName('delaer').active = true;
                }
                if(recordList.playerArr[i].isAbandon){
                    this.node_myDetail.getChildByName('abandon').active = true;
                }
                this.node_myDetail.getChildByName('ID').getComponent(cc.Label).string = recordList.playerArr[i].nickname
                this.node_myDetail.getChildByName('totalChip').children[1].getComponent(cc.Label).string = this.cutDownNum(recordList.playerArr[i].totalChip);
                
                this.node_myDetail.getChildByName('settle').children[1].getComponent(cc.Label).string = this.cutDownNum(recordList.playerArr[i].winCoin) > 0 ? `+${this.cutDownNum(recordList.playerArr[i].winCoin)}` : this.cutDownNum(recordList.playerArr[i].winCoin);
                this.node_myDetail.getChildByName('settle').children[1].color = this.cutDownNum(recordList.playerArr[i].winCoin) > 0 ? fntColor.win : fntColor.lose;
                this.node_myDetail.getChildByName('resultType').getChildByName('type').getComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames[recordList.playerArr[i].cardType];
                for (let j = 0; j < recordList.playerArr[i].cards.length; j++) {
                    let cardName = `bull1_${this.getSixValue(recordList.playerArr[i].cards[j])}`;
                    this.node_myDetail.getChildByName('card').children[j].getComponent(cc.Sprite).spriteFrame = this.atlas_poker._spriteFrames[cardName];
                }
                continue;
            }
            this.addItem(recordList.playerArr[i]);
        }
    },

    addItem(_detail) {
        let _id = _detail.nickname || '无';
        let _cards = _detail.cards || [];
        let _cardType = _detail.cardType || 0;
        let _isBanker = _detail.isBanker || false;
        let _isAbandon = _detail.isAbandon || false;
        let _totalChip = this.cutDownNum(_detail.totalChip) || 0;
        let _winCoin = this.cutDownNum(_detail.winCoin) || 0;
        let recordNode = cc.instantiate(this.item_record);
        recordNode.parent = this.node_resultList;
        recordNode.active = true;
        let node_Id = recordNode.getChildByName('ID');
        let node_delaer = recordNode.getChildByName('delaer');
        let node_Abandon = recordNode.getChildByName('abandon');
        let node_card = recordNode.getChildByName('card');
        let node_niuType = recordNode.getChildByName('resultType');
        let node_totalChip = recordNode.getChildByName('totalChip');
        let node_settle = recordNode.getChildByName('settle');
        node_Id.getComponent(cc.Label).string = _id;
        if (_isBanker) {
            node_delaer.active = true;
        }
        if (_isAbandon) {
            node_Abandon.active = true;
        }
        node_totalChip.children[1].getComponent(cc.Label).string = _totalChip;
        node_totalChip.children[0].getComponent(cc.Label).string = '下注:';
        // node_totalChip.children[0].color = fntColor.player;
        // node_totalChip.children[1].color = fntColor.win;
        node_settle.children[1].getComponent(cc.Label).string = _winCoin > 0 ? `+${_winCoin}` : _winCoin;
        node_settle.children[1].color = _winCoin > 0 ? fntColor.win : fntColor.lose;
        node_niuType.getChildByName('type').getComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames[_cardType];
        for (let i = 0; i < _cards.length; i++) {
            let cardName = `bull1_${this.getSixValue(_cards[i])}`;
            node_card.children[i].getComponent(cc.Sprite).spriteFrame = this.atlas_poker._spriteFrames[cardName];
        }
    },

    /**
     * 获取牌的16进制值
     * @logicNum 牌的逻辑值
     */
    getSixValue(logicNum) {
        logicNum = parseInt(logicNum);
        let str = logicNum < 14 ? "0x0" : "0x";
        return str + logicNum.toString(16);
    },

    //截取小数点后两位
    cutDownNum (value, num = 2) {
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
    
    set(_key, _value) {
        this[_key] = _value;
    },

    // update (dt) {},
});

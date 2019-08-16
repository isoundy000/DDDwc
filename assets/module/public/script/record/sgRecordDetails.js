const fntColor = {
    myselfId: new cc.Color(250, 108, 0),
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
        let _roomType = roomType[this.recordDetailsData.bettype] || '无';
        let _gameNo = this.recordDetailsData.hand_number || '无';
        let _profit = this.cutDownNum(this.recordDetailsData.number) || '无';
        let _baseChip = this.cutDownNum(this.recordDetailsData.baseChip) || '无';
        let _gainFee = this.cutDownNum(this.recordDetailsData.gainFee) || 0;
        this.lab_roomType.string = _roomType;
        this.lab_gameNo.string = _gameNo;
        this.lab_profit.string = _profit > 0 ? `+${_profit}` : _profit;
        this.lab_profit.node.color = _profit > 0 ? fntColor.win : fntColor.lose;
        this.lab_baseChip.string = _baseChip;
        let recordList = JSON.parse(this.recordDetailsData.record) || [];
        console.log('战绩详情', recordList)
        for (let i = 0; i < recordList.length; i++) {
            this.addItem(recordList[i]);
        }
    },

    addItem(_detail) {
        console.log('_detail',_detail);
        let _id = _detail.nickname || '无';
        let _cards = _detail.cards || [];
        let _cardType = _detail.cardType || 0;
        let _isBanker = _detail.isBanker || false;
        let _totalChip = this.cutDownNum(_detail.totalChip) || 0;
        let _winCoin = this.cutDownNum(_detail.winCoin) || 0;
        let recordNode = cc.instantiate(this.item_record);
        recordNode.parent = this.node_resultList;
        recordNode.active = true;
        let node_Id = recordNode.getChildByName('ID');
        let node_card = recordNode.getChildByName('card');
        let node_niuType = recordNode.getChildByName('resultType');
        let node_totalChip = recordNode.getChildByName('totalChip');
        let node_settle = recordNode.getChildByName('settle');
        node_Id.getComponent(cc.Label).string = _id;
        if (_detail.logicId == glGame.user.get('logicID')) {
            node_Id.color = fntColor.myselfId;
        }
        if (_isBanker) {
            node_totalChip.children[0].active = false
            node_totalChip.children[1].active = false;
            node_totalChip.children[2].active = true;
        } else {
            node_totalChip.children[1].getComponent(cc.Label).string = _totalChip;
            node_totalChip.children[2].active = false;
        }
        node_settle.children[1].getComponent(cc.Label).string = _winCoin > 0 ? `+${_winCoin}` : _winCoin;
        node_settle.children[1].color = _winCoin > 0 ? fntColor.win : fntColor.lose;
        this.setResultType(node_niuType.getChildByName('type'), _cardType);
        for (let i = 0; i < _cards.length; i++) {
            node_card.children[i].getComponent(cc.Sprite).spriteFrame = this.atlas_poker._spriteFrames['card_' + _cards[i]];
        }
    },

    setResultType(nodeParent, _cardType) {
        let newNode1 = new cc.Node();
        newNode1.parent = nodeParent;
        let newNode2 = new cc.Node();
        newNode2.parent = nodeParent;
        let newNode3 = new cc.Node();
        newNode3.parent = nodeParent;
        switch (_cardType) {
            case 0:
                newNode1.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_lingdian'];
                newNode2.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_chenghao'];
                newNode3.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_yi'];
                break;
            case 1:
                newNode1.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_yidian'];
                newNode2.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_chenghao'];
                newNode3.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_yi'];
                break;
            case 2:
                newNode1.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_erdian'];
                newNode2.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_chenghao'];
                newNode3.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_yi'];
                break;
            case 3:
                newNode1.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_sandian'];
                newNode2.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_chenghao'];
                newNode3.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_yi'];
                break;
            case 4:
                newNode1.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_sidian'];
                newNode2.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_chenghao'];
                newNode3.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_yi'];
                break;
            case 5:
                newNode1.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_wudian'];
                newNode2.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_chenghao'];
                newNode3.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_yi'];
                break;
            case 6:
                newNode1.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_liudian'];
                newNode2.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_chenghao'];
                newNode3.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_yi'];
                break;
            case 7:
                newNode1.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_qidian'];
                newNode2.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_chenghao'];
                newNode3.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_er'];
                break;
            case 8:
                newNode1.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_badian'];
                newNode2.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_chenghao'];
                newNode3.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_san'];
                break;
            case 9:
                newNode1.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_jiudian'];
                newNode2.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_chenghao'];
                newNode3.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_si'];
                break;
            case 11:
                newNode1.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_hunsangong'];
                newNode2.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_chenghao'];
                newNode3.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_wu'];
                break;
            case 12:
                newNode1.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_xiaosangong'];
                newNode2.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_chenghao'];
                newNode3.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_qi'];
                break;
            case 13:
                newNode1.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_dasangong'];
                newNode2.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_chenghao'];
                newNode3.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_jiu'];
                break;
            case 14:
                newNode1.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_baojiu'];
                newNode2.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_chenghao'];
                newNode3.addComponent(cc.Sprite).spriteFrame = this.img_cardType._spriteFrames['img_jiu'];
                break;
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
    set(_key, _value) {
        this[_key] = _value;
    },

    // update (dt) {},
});

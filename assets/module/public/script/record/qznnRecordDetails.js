/**比牌结果spine特效 */
//根据原本的播放的帧动画来设定
const resultSpineType = {
    0: {
        //1，没牛
        skeletonData: 1,
        spineAnimationName: "mn"
    },
    1: {
        //0,牛1-9 x1
        skeletonData: 0,
        spineAnimationName: "n1"
    },
    2: {
        skeletonData: 0,
        spineAnimationName: "n2"
    },
    3: {
        skeletonData: 0,
        spineAnimationName: "n3"
    },
    4: {
        skeletonData: 0,
        spineAnimationName: "n4"
    },
    5: {
        skeletonData: 0,
        spineAnimationName: "n5"
    },
    6: {
        skeletonData: 0,
        spineAnimationName: "n6"
    },
    7: {
        skeletonData: 0,
        spineAnimationName: "n7"
    },
    8: {
        skeletonData: 0,
        spineAnimationName: "n8"
    }, 
    9: {
        skeletonData: 0,
        spineAnimationName: "n9"
    },
    10: {
        //2,牛10 x1
        skeletonData: 2,
        spineAnimationName: "nn_1"
    },
    12: {
        //3顺子牛
        skeletonData: 3,
        spineAnimationName: "szn"
    },
    13: {
        //4同花牛
        skeletonData: 4,
        spineAnimationName: "thn"
    },
    14: {
        //5 葫芦牛
        skeletonData: 5,
        spineAnimationName: "hln"
    },
    15: {
        //6炸蛋牛
        skeletonData: 6,
        spineAnimationName: "zdn"
    },
    17:  {
        //7五花牛
        skeletonData: 7,
        spineAnimationName: "whn"
    },
    18:  {
        //7五小牛
        skeletonData: 8,
        spineAnimationName: "wxn"
    },
}

// const fntColor = {
//     banker: new cc.Color(255, 0, 0),
//     player: new cc.Color(152, 72, 0),
//     win: new cc.Color(0, 220, 80),
//     lose: new cc.Color(255, 0, 0),
// };

const newFntColor = {
    //下10倍
    xiaBeted: new cc.Color(255, 150, 0),
    //抢10倍
    qiangBeted: new cc.Color(255, 0, 0),
    //房间赢钱
    winMoney: cc.Color.GREEN,
    //房间输钱
    loseMoney: new cc.Color(255, 0, 0),

    //玩家赢钱
    playerWinMoney: cc.Color.GREEN,

    //玩家输钱
    playerLoseMoney: cc.Color.RED,
}
const roomType = {
    1:"初级房",2:"中级房",3:"高级房",4:"贵宾房",5:"富豪房",99:"体验房"
};
const niuTimes = {
    0: 0, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1,
    6: 1, 7: 2, 8: 2, 9: 2, 10: 3, 12: 4,
    13: 4, 14: 5, 15: 5, 17: 4, 18: 6,
};
glGame.baseclass.extend({
    extends: cc.Component,

    properties: {
        item_record: cc.Node,
        node_resultList: cc.Node,
        lab_gameNo: cc.Label,
        lab_roomType: cc.Label,
        lab_baseChip: cc.Label,
        lab_fee: cc.Label,
        lab_profit: cc.Label,
        atlas_poker: cc.SpriteAtlas,    //卡牌图集
        // img_niuType: [cc.SpriteFrame],  //牌型
        // img_niuTimes: [cc.SpriteFrame], //倍数
        // img_niuBg: [cc.SpriteFrame],    //倍数背景
        sp_playSpine: sp.Skeleton,
        spine_data: [sp.SkeletonData],
    },


    onLoad() {
        this.initPanel();
    },

    initPanel() {
        console.log('本剧牌局记录详情:', this.recordDetailsData);
        if (!this.recordDetailsData) return cc.error('record detail is null');
        let _roomType = roomType[this.recordDetailsData.bettype] || '无';
        let _gameNo = this.recordDetailsData.hand_number || '无';
        let _profit = this.cutDownNum(this.recordDetailsData.number) || '0';
        let _baseChip = this.cutDownNum(this.recordDetailsData.baseChip) || '无';
        let _gainFee = this.cutDownNum(this.recordDetailsData.gainFee) || '0';
        this.lab_roomType.string = _roomType;
        this.lab_gameNo.string = _gameNo;
        this.lab_profit.string = _profit > 0 ? `+${_profit}` : _profit;
        this.lab_profit.node.color = _profit > 0 ? newFntColor.winMoney : newFntColor.loseMoney;
        this.myLogicId = glGame.user.get("logicID");

        this.lab_baseChip.string = _baseChip;
        this.lab_fee.string = _gainFee;
        let recordList = JSON.parse(this.recordDetailsData.record || '[]');
        console.log('战绩详情', recordList);
        let playerCount = recordList.length;
        let order = [-1,-1,-1,-1];
        // 把当前玩家提到第一位
        let tempCount = 1;

        for (let index = 0; index < playerCount; index++) {
            if (recordList[index].logicId == this.myLogicId) {
                order[0] = index;
            } else {
                order[tempCount] = index;
                tempCount ++;
            }
        }

        for (let index = 0; index < recordList.length; index++) {
            // 插入顺序
            let orderId = order[index];
            this.addItem(recordList[orderId]);
        }
    },

    addItem(_detail) {
        let _nickname = `${_detail.nickname}` || '无';
        let _cards = _detail.cards || [];
        let _cardType = _detail.cardType || 0;
        let _isBanker = _detail.isBanker || false;
        let _multiple = _detail.multiple || 0;
        let _winCoin = this.cutDownNum(_detail.winCoin) || '无';
        let recordNode = cc.instantiate(this.item_record);
        recordNode.parent = this.node_resultList;
        recordNode.active = true;

        let lab_nickName = recordNode.getChildByName('lab_nickName').getComponent(cc.Label);
        let node_card = recordNode.getChildByName('node_card');
        let node_beted = recordNode.getChildByName('lab_times');
        let node_settle = recordNode.getChildByName('lab_settleMoney');
        let img_zhuang = recordNode.getChildByName('img_zhuang');
 
        if (_isBanker) {
            node_beted.getComponent(cc.Label).string = `抢${_multiple}倍`;
            node_beted.color = newFntColor.qiangBeted;
            img_zhuang.active = true;
        } else {
            node_beted.getComponent(cc.Label).string = `下${_multiple}倍`;
            node_beted.color = newFntColor.xiaBeted;
        }
        if (this.myLogicId == _detail.logicId) {
            // lab_nickName.node.color = new cc.Color(255,255,255);
            lab_nickName.node.color = new cc.Color(255,108,0);
            lab_nickName.fontSize = 30;
        }

        lab_nickName.string = _nickname;
        node_settle.getComponent(cc.Label).string = _winCoin > 0 ? `+${_winCoin}` : _winCoin;
        node_settle.color = _winCoin > 0 ? newFntColor.playerWinMoney : newFntColor.playerLoseMoney;

        for (let i = 0; i < _cards.length; i++) {
            let cardName = `bull1_${this.getSixValue(_cards[i])}`;
            node_card.getChildByName(String(i)).getComponent(cc.Sprite).spriteFrame = this.atlas_poker._spriteFrames[cardName];
        }
        //播放特效
        let resultTypeSpine = resultSpineType[_cardType];
        if (typeof (resultTypeSpine) == "undefined") return;
        let sp_playSpine = recordNode.getChildByName("node_playSpine").getComponent(sp.Skeleton);
        let spineDataArrayIndex = resultTypeSpine.skeletonData;
        let spineAnimationName = resultTypeSpine.spineAnimationName;

        sp_playSpine.skeletonData = this.spine_data[spineDataArrayIndex];
        sp_playSpine.setAnimation(0, spineAnimationName, false);
        sp_playSpine.addAnimation(0, spineAnimationName, false, -4);
    },

    //获取牌的16进制值
    getSixValue(logicNum) {
        logicNum = parseInt(logicNum);
        let str = logicNum < 14 ? "0x0" : "0x";
        return str + logicNum.toString(16);
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

});

//扑克类型
const CT_SINGLE = 1;									//单牌类型
const CT_DOUBLE = 2;									//对子类型
const CT_SHUN_ZI = 3;									//顺子类型
const CT_JIN_HUA = 4;									//金花类型
const CT_SHUN_JIN = 5;									//顺金类型
const CT_BAO_ZI = 6;									//豹子类型
const LOGIC_MASK_COLOR = 0xF0;								//花色掩码
const LOGIC_MASK_VALUE = 0x0F;								//数值掩码
glGame.baseclass.extend({

    properties: {
        pokerAlast: cc.SpriteAtlas,
        cardType: [cc.SpriteFrame],

        gameSeries: cc.Label,
        gameType: cc.Label,
        gameBaseBet: cc.Label,
        gameProfit: cc.Node,
        node_conten:cc.Node,
        node_item:cc.Node,
        node_xian:[cc.Node],
    },

    onLoad () {
        this.initData();
        this.refreshGameInfoContent();
        this.refreshPlayerItem();
    },

    initData () {
        console.log("recordrecordrecordrecord", this.recordDetailsData);
        this.roomTypeTitle =  ['初级房', '中级房', '高级房', '贵宾房', '富豪房', '体验房'];
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
        this.count = 0;
        let nodeXianParent = null;
        for(let index in this.players){
            this.count+=1;
        }
        if(this.count<=3){
            this.node_xian[0].active = true
            this.node_xian[0].parent = this.node_conten;
            nodeXianParent = this.node_xian[0].getChildByName('layout')
            nodeXianParent.height = 210;
        }else if(this.count >3 &&this.count<=6){
            this.node_xian[1].active = true
            this.node_xian[1].parent = this.node_conten;
            nodeXianParent = this.node_xian[1].getChildByName('layout')
            nodeXianParent.height = 420;
        }else {
            this.node_xian[2].active = true
            this.node_xian[2].parent = this.node_conten;
            nodeXianParent = this.node_xian[2].getChildByName('layout')
            nodeXianParent.height = 630;
        }
        nodeXianParent.wigth = 1100;
        nodeXianParent.getComponent(cc.Layout).type = 3;
        nodeXianParent.getComponent(cc.Layout).resizeMode = 1 ;
        nodeXianParent.getComponent(cc.Layout).startAxis = 0;
        // nodeXianParent.getComponent(cc.Layout).verticalDirection = 0;
        // nodeXianParent.getComponent(cc.Layout).horizontalDirection = 0;
        for(let key in this.players){
            let itme = cc.instantiate(this.node_item);
            itme.active =true;
            itme.parent = nodeXianParent;    
            if (this.players[key].logicId == glGame.user.get("logicID")) idNode.color = new cc.Color(216, 114, 64);        
            itme.getChildByName('id').getComponent(cc.Label).string = this.players[key].nickname;
            let winNum = this.getFloat(this.players[key].winCoin);
            itme.getChildByName('profit').getComponent(cc.Label).string = winNum>0 ? `+${winNum}` : winNum;
            itme.getChildByName('profit').color = winNum>0 ? new cc.Color(0, 161, 11) : new cc.Color(255, 0, 0);
            itme.getChildByName('img_yingjia').active = winNum>0 ?true:false;
            this.refreshCards(itme.getChildByName('cards'), this.players[key].handCards)
            let cardIndex = this.getCardType(this.players[key].handCards,3);
            itme.getChildByName('cardType').getComponent(cc.Sprite).spriteFrame = this.cardType[cardIndex-1];
            console.log('牌型',cardIndex)
            if (this.players[key].logicid == glGame.user.get("logicID")) {
                itme.getChildByName('id').color = cc.color(255,108,0)
            }
            // if(key%3 == 0){
            //     itme.getChildByName('gezi0').active = true;
            // }else if(key%3 == 1){
            //     itme.getChildByName('gezi1').active = true;
            // }else {
            //     itme.getChildByName('gezi2').active = true;
            // }
        }
    },
    drawgezi(){
        for(let key in this.players){
            let xian = cc.instantiate(this.node_xian);
            xian.active = true;
            xian.parent =this.node_conten;
        }
    },

    refreshCards (nodes, cardData) {
        for (let i=0; i<cardData.length; i++) {
            nodes.children[i].getComponent(cc.Sprite).spriteFrame = this.pokerAlast.getSpriteFrame(this.getSixValue(cardData[i]));
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

    getCardType (cbCardData, cbCardCount) {
        if (cbCardCount === 3) {
            //变量定义
            let cbSameColor = true;
            let bLineCard = true;
            let cbFirstColor = this.getCardColor(cbCardData[0]);
            let cbFirstValue = this.getCardLogicValue(cbCardData[0]);
    
            //牌形分析
            for (let i = 1; i < cbCardCount; i++) {
                //数据分析
                if (this.getCardColor(cbCardData[i]) !== cbFirstColor) cbSameColor = false;
                if (cbFirstValue !== (this.getCardLogicValue(cbCardData[i]) + i)) bLineCard = false;
    
                //结束判断
                if ((cbSameColor === false) && (bLineCard === false)) break;
            }
            //顺金类型
            if ((cbSameColor) && (bLineCard)) {
                return CT_SHUN_JIN;
            }
    
            //顺子类型
            if ((!cbSameColor) && (bLineCard)) {
                return CT_SHUN_ZI;
            }
    
            //金花类型
            if ((cbSameColor) && (!bLineCard)) {
                return CT_JIN_HUA;
            }
    
            //牌形分析
            let bDouble = false;
            let bPanther = true;
    
            //对牌分析
            for (let i = 0; i < cbCardCount - 1; i++) {
                for (let j = i + 1; j < cbCardCount; j++) {
                    if (this.getCardLogicValue(cbCardData[i]) === this.getCardLogicValue(cbCardData[j])) {
                        bDouble = true;
                        break;
                    }
                }
                if (bDouble) break;
            }
    
            //三条(豹子)分析
            for (let i = 1; i < cbCardCount; i++) {
                if (bPanther && cbFirstValue !== this.getCardLogicValue(cbCardData[i])) bPanther = false;
            }
    
            //对子和豹子判断
            if (bDouble === true) {
                return (bPanther) ? CT_BAO_ZI : CT_DOUBLE;
            }
        }
    
        return CT_SINGLE;
    },
    //获取花色
    getCardColor(cbCardData) {
        return cbCardData & LOGIC_MASK_COLOR;
    },
    //获取数值
    getCardValue (cbCardData) {
        return cbCardData & LOGIC_MASK_VALUE;
    },
    //逻辑数值
    getCardLogicValue(cbCardData) {
        //扑克属性
        let bCardColor = this.getCardColor(cbCardData);
        let bCardValue = this.getCardValue(cbCardData);
        //转换数值
        return (bCardValue === 1) ? (bCardValue + 13) : bCardValue;
    },
    // start () {

    // },
    // update (dt) {},
});

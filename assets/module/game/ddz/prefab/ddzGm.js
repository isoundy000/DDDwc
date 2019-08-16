let Judgement = require("doudizhuFP");
const customStatus = {
    init: 0, //初始值
    need: 1, //需要自定义
    notNeed: 2, //不需要自定义
    finish: 3, //自定义牌局完成
    timeout: 4 //自定义牌局超时
}
const customoprType = { //操作类型
    setStatus: 1, //设置是否自定义状态
    setCard: 2, //设置牌局
    setStop: 3 //快速结束
}

glGame.baseclass.extend({

    properties: {
        cardItem: cc.Node,
        cardListContent: cc.Node,
        cardAtlas: cc.SpriteAtlas,
        lockSp: cc.SpriteFrame,
        nextCards: cc.Node,
        lastCards: cc.Node,
        myCards: cc.Node,
        threeCards: cc.Node,
        nextCardCount: cc.Label,
        myCardCount: cc.Label,
        lastCardCount: cc.Label,
    },

    onLoad() {
        this.node.active = false;
        this.curLogic = require("ddzlogic").getInstance();
        this.initData();
        this.refreshCardList();
        glGame.emitter.on("ddzRoom.ddzRoomHandler.playerGmOp", this.playerGmOp, this);
        this.send_needCustomize();
    },

    playerGmOp(msg) {
        console.log("操作回包", msg);
        if (msg.customStatus && msg.customStatus == customStatus.need) {
            this.node.active = true;
        }
        else if (msg.customStatus && (msg.customStatus == customStatus.timeout || msg.customStatus == customStatus.finish)) {
            this.remove();
        }
    },

    send_needCustomize() {
        let msg = {
            "oprType": customoprType.setStatus,
            "customStatus": customStatus.need
        };
        console.log("发送配牌请求", msg);
        glGame.gameNet.send_msg("ddzRoom.ddzRoomHandler.playerGmOp", msg);
    },

    send_Customize(datas) {
        let msg = {
            "oprType": customoprType.setCard,
            "customCard": datas,
            "customDipai": this.getCardValueFromDatas(3),
            "customDizhuSeatId": this.getSeatId(this.landowner),
        };
        console.log("发送配牌数据", msg, this.landowner);
        glGame.gameNet.send_msg("ddzRoom.ddzRoomHandler.playerGmOp", msg);
    },

    send_NoNeedCustomize() {
        let msg = {
            "oprType": customoprType.setStatus,
            "customStatus": customStatus.notNeed
        };
        console.log("发送配牌数据", msg, this.landowner);
        glGame.gameNet.send_msg("ddzRoom.ddzRoomHandler.playerGmOp", msg);
    },

    initData() {
        this.cardList = [];
        this.selectCardList = [];
        this.nextPlayerCards = [];
        this.lastPlayerCards = [];
        this.myPlayerCards = [];
        this.landlordCards = [];
        this.landowner = 2;
        this.cardNodes = [this.myCards, this.nextCards, this.lastCards, this.threeCards];
        this.cardNodeDatas = [this.myPlayerCards, this.nextPlayerCards, this.lastPlayerCards, this.landlordCards];
        console.log("aaaaaa", this.cardNodeDatas[0], this.cardNodeDatas[1], this.cardNodeDatas[2])

    },

    refreshCardList() {
        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < 13; i++) {
                let cardData = {};
                cardData.value = i + 1 + j * 16;
                cardData.isSelect = false;
                cardData.lock = false;
                cardData.index = i + j * 13;
                this.cardList.push(cardData)
            }
        }
        this.cardList.push({ value: 78, isSelect: false, index: 52, lock: false });
        this.cardList.push({ value: 79, isSelect: false, index: 53, lock: false });
        for (let i = 0; i < this.cardList.length; i++) {
            let card = cc.instantiate(this.cardItem);
            card.parent = this.cardListContent;
            card.color = this.cardList[i].isSelect ? cc.Color.GRAY : cc.Color.WHITE;
            let cardValue = this.cardList[i].value;
            let str = cardValue < 14 ? "bull1_0x0" : "bull1_0x";
            let spStr = str + cardValue.toString(16);
            card.getComponent(cc.Sprite).spriteFrame = this.cardAtlas.getSpriteFrame(spStr);
            card.active = true;
        }
    },

    refreshCardCount(viewid) {
        let countlabs = [this.myCardCount, this.nextCardCount, this.lastCardCount];
        countlabs[viewid].string = this.cardNodeDatas[viewid].length;
    },

    refreshCardList() {
        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < 13; i++) {
                let cardData = {};
                cardData.value = i + 1 + j * 16;
                cardData.isSelect = false;
                cardData.lock = false;
                cardData.index = i + j * 13;
                this.cardList.push(cardData)
            }
        }
        this.cardList.push({ value: 78, isSelect: false, index: 52, lock: false });
        this.cardList.push({ value: 79, isSelect: false, index: 53, lock: false });
        for (let i = 0; i < this.cardList.length; i++) {
            let card = cc.instantiate(this.cardItem);
            card.parent = this.cardListContent;
            card.color = this.cardList[i].isSelect ? cc.Color.GRAY : cc.Color.WHITE;
            let spStr = this.getSpriteFrameStr(this.cardList[i].value)
            card.getComponent(cc.Sprite).spriteFrame = this.cardAtlas.getSpriteFrame(spStr);
            card.active = true;
        }
    },

    getSpriteFrameStr(value) {
        let str = value < 14 ? "bull1_0x0" : "bull1_0x";
        let spStr = str + value.toString(16);
        return spStr;
    },

    allClear() {
        this.myCards.removeAllChildren();
        this.nextCards.removeAllChildren();
        this.lastCards.removeAllChildren();
        this.myCardCount.string = "0";
        this.nextCardCount.string = "0";
        this.lastCardCount.string = "0";
        this.initData();
        this.cardListContent.removeAllChildren();
        this.refreshCardList();
    },

    clearSingleData(id) {
        let labNodes = [this.myCardCount, this.nextCardCount, this.lastCardCount];
        let datas = this.cardNodeDatas[id];
        for (let i = 0; i < datas.length; i++) {
            let str = this.getSpriteFrameStr(datas[i].value);
            let cardItem = this.cardListContent.children[datas[i].index];
            cardItem.getComponent(cc.Sprite).spriteFrame = this.cardAtlas.getSpriteFrame(str);
            cardItem.color = cc.Color.WHITE;
            this.cardList[datas[i].index].isSelect = false;
            this.cardList[datas[i].index].lock = false;
        }
        this.cardNodeDatas[id] = [];
        this.cardNodes[id].removeAllChildren();
        if (id == 3) return;
        labNodes[id].string = "0";
    },

    onClick(name, node) {
        switch (name) {
            case "nextToggle":
                this.selectLandLord(1);
                break;
            case "lastToggle":
                this.selectLandLord(2);
                break;
            case "myToggle":
                this.selectLandLord(0);
                break;
            case "next":
                this.commitSelectTo(1);
                break;
            case "last":
                this.commitSelectTo(2);
                break;
            case "player":
                this.commitSelectTo(0);
                break;
            case "landlord":
                this.commitSelectTo(3);
                break;
            case "myClear":
                this.clearSingleData(0)
                break;
            case "nextClear":
                this.clearSingleData(1)
                break;
            case "lastClear":
                this.clearSingleData(2)
                break;
            case "landClear":
                this.clearSingleData(3)
                break;
            case "clear":
                this.allClear();
                break;
            case "close":
                this.send_NoNeedCustomize();
                this.remove();
                break;
            case "commit":
                this.commit();
                break;
        }
    },

    commit() {
        // if (this.checkCommit()) return
        let datas = [], data = {};
        for (let i = 0; i < 3; i++) {
            data = {};
            data["pokerArr"] = this.getCardValueFromDatas(i);
            data["seatId"] = this.getSeatId(i);
            datas.push(data);
        }
        datas["customDizhuSeatId"] = this.getSeatId(this.landowner);
        datas["customDipai"] = this.getCardValueFromDatas(3);
        cc.log("提交的数据", datas)
        this.send_Customize(datas);
    },

    clickCard(event, type) {
        let buttonNode = event.target;
        let buttonName = event.target.name;
        let pos = buttonNode.convertToNodeSpace(event.getLocation());
        let cardIndex = this.getCardIndexByPos(pos);

        if (cardIndex >= 54) return;
        if (this.cardList[cardIndex].lock) return;
        if (this.cardListContent.children[cardIndex].color.equals(cc.Color.GRAY)) {
            this.cardListContent.children[cardIndex].color = cc.Color.WHITE;
            this.deleteSelectCard(cardIndex);
            return
        }

        this.cardList[cardIndex].isSelect = true;
        this.selectCardList.push(this.cardList[cardIndex]);
        this.cardListContent.children[cardIndex].color = cc.Color.GRAY;
        console.log("select card list", this.selectCardList)
    },

    selectLandLord(viewid) {
        this.landowner = viewid;
    },

    commitSelectTo(viewid) {
        let seatid = viewid;
        if (this.cardNodeDatas[viewid].length >= 17 || (viewid == 3 && this.cardNodeDatas[viewid].length >= 3)) {
            let index = this.selectCardList[0].index;
            this.deleteSelectCard(index, this.selectCardList.length);
            return;
        }
        this.refreshPlayerCard(seatid);
        this.refreshAllSelectCard();
        if (viewid != 3) {
            this.refreshCardCount(viewid);
        }
    },

    checkCommit() {
        for (let i = 0; i < this.cardList.length; i++) {
            if (!this.cardList[i].lock) return true
        }
        return false;
    },

    refreshPlayerCard(id) {
        console.log("id cards", id)
        for (let i = 0; i < this.selectCardList.length; i++) {
            if (this.cardNodeDatas[id].length >= 17) {
                let index = this.selectCardList[i].index;
                let count = this.selectCardList.length - this.cardNodeDatas[id].length;
                this.deleteSelectCard(index, count);
                break;
            }
            if (id == 3 && this.cardNodeDatas[id].length >= 3) {
                let index = this.selectCardList[i].index;
                let count = this.selectCardList.length - this.cardNodeDatas[id].length;
                this.deleteSelectCard(index, count);
                break;
            }
            this.cardList[this.selectCardList[i].index].lock = true;
            this.cardNodeDatas[id].push(this.selectCardList[i]);
        }
        this.refreshAndSort(id);
        this.selectCardList = [];
    },

    getCardValueFromDatas(id) {
        let datas = [];
        let cardDatas = this.cardNodeDatas[id];
        for (let i = 0; i < cardDatas.length; i++) {
            datas.push(cardDatas[i].value)
        }
        return datas;
    },

    refreshAndSort(id) {
        let datas = [];
        datas = this.getCardValueFromDatas(id);
        console.log("排序前的数据", datas)
        Judgement.SortCardList(datas, 1);
        console.log("排序后的数据", datas)
        this.cardNodes[id].removeAllChildren();
        for (let i = 0; i < datas.length; i++) {
            let cardNode = cc.instantiate(this.cardItem);
            cardNode.y = 0;
            cardNode.parent = this.cardNodes[id];
            let cardValue = datas[i];
            let str = cardValue < 14 ? "bull1_0x0" : "bull1_0x";
            let spStr = str + cardValue.toString(16);
            cardNode.getComponent(cc.Sprite).spriteFrame = this.cardAtlas.getSpriteFrame(spStr);
            cardNode.active = true;
        }
    },

    refreshAllSelectCard() {
        for (let i = 0; i < this.cardList.length; i++) {
            let cardNode = this.cardListContent.children[i];
            if (this.cardList[i].lock) {
                cardNode.getComponent(cc.Sprite).spriteFrame = this.lockSp;
            }
            if (!this.cardList[i].isSelect) {
                cardNode.color = cc.Color.WHITE;
            }
        }
    },

    deleteSelectCard(cardIndex, count = 1) {
        for (let i = 0; i < this.selectCardList.length; i++) {
            if (cardIndex == this.selectCardList[i].index) {
                console.log("删牌数值", cardIndex, count)
                for (let j = i; j < i + count; j++) {
                    let index = this.selectCardList[j].index;
                    console.log("不需要的牌", index)
                    this.cardList[index].isSelect = false;
                    this.cardList[index].lock = false;
                    this.cardListContent.children[index].color = cc.Color.WHITE;
                }
                this.selectCardList.splice(i, count);
                break;
            }
        }
        console.log("delete end card array", this.selectCardList)
    },

    getCardIndexByPos(position) {
        let indexX = Math.ceil(position.x / 47);
        let indexY = 5 - Math.ceil(position.y / 64);
        console.log(`col:${indexX}, raw:${indexY}`, indexY * 13 + indexX - 1);
        return indexY * 13 + indexX - 1;
    },

    getSeatId(viewId) {
        let mySeatId = this.curLogic.getMySeatID();
        return (Number(mySeatId) + Number(viewId)) > 2 ? Number(mySeatId) + Number(viewId) - 3 : Number(mySeatId) + Number(viewId);
    },

    OnDestroy() {
        console.log("销毁")
        glGame.emitter.off("ddzRoom.ddzRoomHandler.playerGmOp", this);
    },

});

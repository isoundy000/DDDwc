/*
*整个动画流程
*0.5秒（预留最后一个筹码飞到区域的时间）
*1秒，显示开始比牌
*4秒 5家，每家翻牌0.8秒；
*0.5秒 预留出最后一个翻牌动画时间
*0.5秒 显示区域输赢动画
*2秒 金币结算
*0.5秒 富人榜和庄家，自己的分数结算。
*3秒    结算。
*/
let CONFIGS = require("brnn_const")
const INTERVALH = 70;
const OTHERUID = 1;         //其他人的ID
glGame.baseclass.extend({
    properties: {
        atlas_chips: cc.SpriteAtlas,
        node_areaPos: cc.Node,
        node_areawinOrLose: cc.Node,
        node_areawinBg: cc.Node,
        chips: cc.Node,
        audio_flyChips: {
            type: cc.AudioClip,
            default: null
        },
    },
    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this.curLogic = require("brnnlogic").getInstance();
        this._dict_hideChip = {};           //对象池字典
        this.curtime = 0;
        this._dealerUid = null;
        this._myUid = null;
        this.regisrterEvent();
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);    //切换后台
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onEnterRoom, this.reUI, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onMidEnter, this.midEnter, this);
        glGame.emitter.on("globalGameFinish", this.reUI, this);   //去刷新配置    
    },

    reUI() {
        //清除对象池
        for (let key in this._dict_hideChip) {
            this._dict_hideChip[key].clear();
        }
        cc.log("清除对象池", this._dict_hideChip)
        this._tianarr = [];
        this._diarr = [];
        this._xuanarr = [];
        this._huangarr = [];
        this._dict_hideChip = {};           //对象池字典

        this.arr = this.curLogic.get("roomInfo").Chips;
        this.chipIcon = this.curLogic.get("roomInfo").ChipsIcon;
        let temparr = this.copyArr(this.arr);
        this.chipsValue = this.paixu(temparr);
        this.createrPool(this.arr);              //创建对象池
    },

    paixu(arr) {
        let max;
        for (let i = 0; i < arr.length; i++) {
            for (let j = i; j < arr.length; j++) {
                if (arr[i] < arr[j]) {
                    max = arr[j];
                    arr[j] = arr[i];
                    arr[i] = max;
                }
            }
        }
        return arr;
    },

    copyArr(arr) {
        let temparr = [];
        for (let i = 0; i < arr.length; i++) {
            temparr.push(arr[i]);
        }
        return temparr;
    },

    start() {

    },

    //断线重连回来渲染筹码
    addChips(chipAreaInfo) {
        let areaChips = chipAreaInfo.areaChips;
        let userChips = chipAreaInfo.userChips;
        for (let area in userChips) {               //4个区域
            let value = 0;
            for (let chipValue in userChips[area]) {//筹码的值
                if (Object.keys(userChips[area][chipValue]).length != 0) {
                    for (let uid in userChips[area][chipValue]) {
                        let num = userChips[area][chipValue][uid];
                        let id = uid;
                        value += chipValue * num;
                        for (let i = 0; i < num; ++i) {
                            this.addChipInArea(area, chipValue, id);
                            this.curLogic.setChpseChipArr({ chooseUid: id, areaIndex: area, chipValue: chipValue })
                        }
                    }
                }
            }
            value = areaChips[area] - value;
            this.addOtherPlayChips(value, area);
        }
    },
    /**
     * 分解其他玩家中途加入的筹码渲染
     * @param {*} _value 其他玩家在改区域总下注值
     * @param {*} area 区域index
     */
    addOtherPlayChips(_value, area) {
        let value = _value.toFixed(2);
        for (let i = 0; i < this.chipsValue.length; i++) {
            let chipValue = this.chipsValue[i];
            let chipNum = parseInt(value / chipValue);
            if (chipNum > 0) {
                for (let i = 0; i < chipNum; i++) {
                    this.addChipInArea(area, chipValue, 1);
                }
                value = parseFloat(value % chipValue).toFixed(1);
            }
        }
    },
    //断线重连的筹码直接生成
    addChipInArea(_areaIndex, _curChipValue, _tag) {   //tag1，要飞往谁
        let areaIndex = parseInt(_areaIndex);
        let tag = parseInt(_tag);
        let curNode = this.allBet(areaIndex, _curChipValue, tag);
        let endPos = this._getChipEndPos(areaIndex);
        curNode.position = endPos;

        let num = Math.random(1);
        let isPositive = num > 0.5 ? 1 : -1;
        let num1 = Math.random(1) * 360;
        curNode.angle = isPositive * num1;
    },
    //创建筹码节点
    createrPool(arr) {
        for (let i = 0; i < arr.length; ++i) {
            let index = arr[i];
            if (!this._dict_hideChip[index]) {
                this._dict_hideChip[index] = new cc.NodePool("curChipValue_" + index);
            }
            let count = index > arr[1] ? 300 : 1000;
            for (let j = 0; j < count; ++j) {
                let node = this._getChipStart(index);
                this._dict_hideChip[index].put(node);
            }
        }
    },
    //开局创建筹码
    _getChipStart(curChipValue) {
        if (!this._dict_hideChip[curChipValue]) {
            this._dict_hideChip[curChipValue] = new cc.NodePool("curChipValue_" + curChipValue);
        }
        let nNode = this._newBetNode(curChipValue);
        return nNode;
    },
    //新建一个节点
    _newBetNode(curChipValue) {
        let node = new cc.Node();
        node.addComponent(cc.Sprite).spriteFrame = this._getchipsBg(curChipValue);
        return node;
    },
    // //隐藏一个列表
    _hideList(curList) {
        if (curList) {
            let cNode,curChipValue;
            for (let i = 0; i < curList.length; i++) {
                cNode = curList[i];
                if (!cc.isValid(cNode)) continue;
                cNode.stopAllActions();
                curChipValue = cNode.name.split("_")[0]
                // this._dict_hideChip[cNode.tag].put(cNode);
                this._dict_hideChip[curChipValue].put(cNode);
            }
        }
    },
    //根据值获取正确的节点
    _getChipByValue(curChipValue) {
        let nNode = this._dict_hideChip[curChipValue].get();
        if (!nNode) {
            nNode = this._newBetNode(curChipValue);
        }
        nNode.parent = this.chips;
        return nNode;
    },
    //========================
    //模拟对象池 1,2,3,4
    allBet(areaIndex, curChipValue, tag1) {
        let node = this._getChipByValue(curChipValue);
        node.name = `${curChipValue}_${tag1}`
        // node.tag = curChipValue;    //代表筹码的值
        // node.tag1 = tag1;           //筹码要飞到哪个人的ID
        let arr = this.getArr(areaIndex);
        arr.push(node);
        node.zIndex = arr.length;
        return node;
    },
    //根据索引得到天地玄黄关于筹码的数组
    getArr(index) {
        let arr;
        switch (index) {
            case 1: arr = this._tianarr; break;
            case 2: arr = this._diarr; break;
            case 3: arr = this._xuanarr; break;
            case 4: arr = this._huangarr; break;
        }
        return arr;
    },
    //得到筹码精灵
    _getchipsBg(_curChipValue) {
        let spriteFrame;
        for (let i = 0; i < this.arr.length; i++) {
            if (_curChipValue == this.arr[i]) {
                let str = `fly${this.chipIcon[i]}`
                spriteFrame = this.atlas_chips.getSpriteFrame(str);
            }
        }
        return spriteFrame;
    },
    //隐藏所有筹码池的筹码
    hideAllBet() {
        this._hideList(this._tianarr);
        this._hideList(this._diarr);
        this._hideList(this._xuanarr);
        this._hideList(this._huangarr);
        this._tianarr.splice(0, this._tianarr.length);//清空数组 
        this._diarr.splice(0, this._diarr.length);//清空数组 
        this._xuanarr.splice(0, this._xuanarr.length);//清空数组 
        this._huangarr.splice(0, this._huangarr.length);//清空数组
    },
    //关于筹码的动画========================
    //添加筹码进区域(下注)
    addChipImg(areaIndex, uid, _curChipValue, tag1) {   //tag1，要飞往谁
        let curNode = this.allBet(areaIndex, _curChipValue, tag1);
        // curNode.getChildByName("layout").opacity = 0;
        let startPos = this._getChipStartPos(uid);
        let endPos = this._getChipEndPos(areaIndex);
        this._chipsFly(curNode, startPos, endPos)
    },
    //筹码飞行动画
    _chipsFly(node, startPos, endPos) {
        node.position = startPos;
        let moveTo = cc.moveTo(CONFIGS.configs.chipFlyTime, endPos);
        let num = Math.random(1);
        let isPositive = num > 0.5 ? 1 : -1;
        let num1 = Math.random(1) * 360;
        let rotateBy = cc.rotateBy(CONFIGS.configs.chipFlyTime, isPositive * num1);
        node.stopAllActions();
        node.runAction(cc.spawn(moveTo, rotateBy));
    },
    //得到筹码的初始位置
    _getChipStartPos(_uid) {
        let uid = Number(_uid);
        let startPos;
        this._dealerUid = this.curLogic.get("dealerUid");
        if (uid == this._dealerUid) {                   //庄家
            startPos = this.curLogic.get("dealerPos");
            return startPos;
        }
        if (uid == this._myUid) {                    //自己
            startPos = this.curLogic.get("myPos");
            return startPos;
        }
        let list = this.curLogic.getT_richList();
        let length = 0;
        if (list) {
            length = list.length > 6 ? 6 : list.length;
        }
        for (let i = 0; i < length; i++) {   //在富人榜的玩家
            if (list[i].uid == uid) {
                startPos = this.node.children[0].children[i].position;
                return startPos;
            }
        }
        startPos = this.curLogic.get("otherPos");   //其他玩家
        return startPos;
    },
    //得到筹码的最终位置
    _getChipEndPos(areaIndex) {
        let ramdomX = 74;
        let pos = this.getareaPos(areaIndex)
        let dir = Math.random() > 0.5 ? 1 : -1;
        let offY = 63 * Math.random() * dir;
        if ((areaIndex == 1 || areaIndex == 4) && dir == 1) {
            ramdomX = 60;
        }
        dir = Math.random() > 0.5 ? 1 : -1;
        let offX = ramdomX * Math.random() * dir;
        pos.x += offX;
        pos.y += offY;
        if (pos.y < -30) pos.y += INTERVALH;
        return pos;
    },
    //得到4个区域的点
    getareaPos(areaIndex) {
        let pos;
        if (areaIndex == 1) { pos = this.node_areaPos.children[0].position }
        else if (areaIndex == 2) { pos = this.node_areaPos.children[1].position }
        else if (areaIndex == 3) { pos = this.node_areaPos.children[2].position }
        else if (areaIndex == 4) { pos = this.node_areaPos.children[3].position }
        return pos
    },
    //筹码池飞往玩家
    _chipsFlyToPeople(node, endPos) {
        let curChipValue = node.name.split("_")[0];
        let moveTo = cc.moveTo(CONFIGS.configs.chipFlyTime, endPos).easing(cc.easeOut(3.0));
        let callFunc = cc.callFunc(() => {
            // this._dict_hideChip[node.tag].put(node);
            this._dict_hideChip[curChipValue].put(node);
        });
        let seq = cc.sequence(moveTo, callFunc);
        node.runAction(seq);
    },
    //根据得到的当前时间，来决定是否播当前的动画
    checkAniPlay(time) {
        let curtime = this.curLogic.getMidEnterWaitTime();
        if (curtime > time) {
            return false;
        } else {
            return true;
        }
    },
    //玩家输钱赔付
    playLostBet(money, index, _uid) {
        if (money == 0) return;
        let _money = Math.abs(money);
        for (let i = 0; i < this.chipsValue.length; i++) {
            let chipValue = this.chipsValue[i];
            let chipNum = Math.floor(_money / chipValue);
            if (chipNum > 0) {
                for (let i = 0; i < chipNum; i++) {
                    this.addChipImg(index, _uid, chipValue, _uid);
                }
                _money = _money % chipValue;
            }
        }
    },
    //玩家输钱，没播动画直接赔到区域
    playChipaddToArea(money, index, _uid) {
        if (money == 0) return;
        let _money = Math.abs(money);
        for (let i = 0; i < this.chipsValue.length; i++) {
            let chipValue = this.chipsValue[i];
            let chipNum = Math.floor(_money / chipValue);
            if (chipNum > 0) {
                for (let i = 0; i < chipNum; i++) {
                    this.addChipInArea(index, chipValue, _uid);
                }
                _money = _money % chipValue;
            }
        }
    },
    //=========根据我输钱，赔付筹码===================================
    _MyloseMoneyFly(myAreaSettleInfo, areaIndex) {
        if (Object.keys(myAreaSettleInfo).length == 0) return;  //如果对象的KEY为0，则表明空对象
        if (myAreaSettleInfo[areaIndex] < 0) {              //我输钱，
            let myAreaSettleGold = parseFloat(myAreaSettleInfo[areaIndex]);
            let dealerResultType = CONFIGS.bullResultRate[this._dealerResultType];
            let money = myAreaSettleGold / dealerResultType * (dealerResultType - 1); //还需要赔给庄家多少钱
            this.playLostBet(money, areaIndex, this._myUid)   //我的金币飞向区域
        }
    },
    _MyMidEloseMoney(myAreaSettleInfo, areaIndex) {
        if (Object.keys(myAreaSettleInfo).length == 0) return;  //如果对象的KEY为0，则表明空对象
        if (myAreaSettleInfo[areaIndex] < 0) {              //我输钱，
            let myAreaSettleGold = parseFloat(myAreaSettleInfo[areaIndex]);
            let dealerResultType = CONFIGS.bullResultRate[this._dealerResultType];
            let money = myAreaSettleGold / dealerResultType * (dealerResultType - 1); //还需要赔给庄家多少钱
            this.playChipaddToArea(money, areaIndex, this._myUid)   //我的金币飞向区域
        }
    },
    //=========庄家赔付筹码,飞往区域=============================
    _dealerloseBet(myWinMoney, listRichInfo, otherWinMoney, areaIndex) {
        let uid = this.curLogic.get("dealerUid");
        //赔付给我
        let money;
        money = myWinMoney;
        for (let i = 0; i < this.chipsValue.length; i++) {
            let chipValue = this.chipsValue[i];
            let chipNum = Math.floor(money / chipValue);
            if (chipNum > 0) {
                for (let j = 0; j < chipNum; j++) {
                    this.addChipImg(areaIndex, uid, chipValue, this._myUid);
                }
                money = money % chipValue;
            }
        }
        //赔付给富人
        for (let i = 0; i < listRichInfo.length; i++) {
            let richMoney = listRichInfo[i].areaSettleInfo[areaIndex]
            for (let k = 0; k < this.chipsValue.length; k++) {
                let chipValue = this.chipsValue[k];
                let chipNum = Math.floor(richMoney / chipValue);
                if (chipNum > 0) {
                    for (let j = 0; j < chipNum; j++) {
                        this.addChipImg(areaIndex, uid, chipValue, listRichInfo[i].uid);
                    }
                    richMoney = richMoney % chipValue;
                }
            }
        }
        //赔付给其他人
        money = otherWinMoney;
        for (let i = 0; i < this.chipsValue.length; i++) {
            let chipValue = this.chipsValue[i];
            let chipNum = Math.floor(money / chipValue);
            if (chipNum > 0) {
                for (let j = 0; j < chipNum; j++) {
                    this.addChipImg(areaIndex, uid, chipValue, 1);//1表示其他人的ID
                }
                money = money % chipValue;
            }
        }
    },
    _dealerMidEloseBet(myWinMoney, listRichInfo, otherWinMoney, areaIndex) {
        let uid = this.curLogic.get("dealerUid");
        //赔付给我
        let money;
        money = myWinMoney;
        for (let i = 0; i < this.chipsValue.length; i++) {
            let chipValue = this.chipsValue[i];
            let chipNum = Math.floor(money / chipValue);
            if (chipNum > 0) {
                for (let j = 0; j < chipNum; j++) {
                    this.addChipInArea(areaIndex, chipValue, this._myUid);
                }
                money = money % chipValue;
            }
        }
        //赔付给富人
        for (let i = 0; i < listRichInfo.length; i++) {
            let richMoney = listRichInfo[i].areaSettleInfo[areaIndex]
            for (let k = 0; k < this.chipsValue.length; k++) {
                let chipValue = this.chipsValue[k];
                let chipNum = Math.floor(richMoney / chipValue);
                if (chipNum > 0) {
                    for (let j = 0; j < chipNum; j++) {
                        this.addChipInArea(areaIndex, chipValue, listRichInfo[i].uid);
                    }
                    richMoney = richMoney % chipValue;
                }
            }
        }
        //赔付给其他人
        money = otherWinMoney;
        for (let i = 0; i < this.chipsValue.length; i++) {
            let chipValue = this.chipsValue[i];
            let chipNum = Math.floor(money / chipValue);
            if (chipNum > 0) {
                for (let j = 0; j < chipNum; j++) {
                    this.addChipInArea(areaIndex, chipValue, 1);//1表示其他人的ID
                }
                money = money % chipValue;
            }
        }
    },
    //=========其他富人赔付筹码,并飞往区域===========
    _richLoseMoneyFly(listRichInfo, areaIndex) {
        for (let i = 0; i < listRichInfo.length; i++) {
            let uid = listRichInfo[i].uid;
            if (uid == this.curLogic.get("myUid")) continue;
            if (Object.keys(listRichInfo[i].areaSettleInfo).length == 0) continue;  //如果对象的KEY为0，则表明空对象
            if (listRichInfo[i].areaSettleInfo[areaIndex] < 0) {    //富人榜输钱
                //富人赔付筹码飞向区域
                let money = parseFloat(listRichInfo[i].areaSettleInfo[areaIndex]);
                let dealerResultType = CONFIGS.bullResultRate[this._dealerResultType];
                money = money / dealerResultType * (dealerResultType - 1);
                this.playLostBet(money, areaIndex, uid);
            }
        }
    },
    _richMidEloseMoney(listRichInfo, areaIndex) {
        for (let i = 0; i < listRichInfo.length; i++) {
            let uid = listRichInfo[i].uid;
            if (uid == this.curLogic.get("myUid")) continue;
            if (Object.keys(listRichInfo[i].areaSettleInfo).length == 0) continue;  //如果对象的KEY为0，则表明空对象
            if (listRichInfo[i].areaSettleInfo[areaIndex] < 0) {    //富人榜输钱
                //富人赔付筹码飞向区域
                let money = parseFloat(listRichInfo[i].areaSettleInfo[areaIndex]);
                let dealerResultType = CONFIGS.bullResultRate[this._dealerResultType];
                money = money / dealerResultType * (dealerResultType - 1);
                this.playChipaddToArea(money, areaIndex, uid);
            }
        }
    },
    //富人榜在每个区域的总输赢
    _richAllAreaLose(listRichInfo, areaIndex) {
        let allLose = 0;
        for (let i = 0; i < listRichInfo.length; i++) {
            let uid = listRichInfo[i].uid;
            if (uid == this.curLogic.get("myUid")) continue;
            if (Object.keys(listRichInfo[i].areaSettleInfo).length == 0) continue;  //如果对象的KEY为0，则表明自己没下注
            if (listRichInfo[i].areaSettleInfo[areaIndex]) {
                allLose += listRichInfo[i].areaSettleInfo[areaIndex];
            }
        }
        return allLose;
    },
    //============其他玩家赔付筹码，并飞往区域========
    _otherLoseMoneyFly(money, areaIndex) {
        if (money < 0) {                    //其他人赔付筹码飞向区域
            this.playLostBet(money, areaIndex, OTHERUID); //
        }
    },
    _otherMidELoseMoney(money, areaIndex) {
        if (money < 0) {                    //其他人赔付筹码飞向区域
            this.playChipaddToArea(money, areaIndex, OTHERUID); //
        }
    },
    //================区域的筹码飞向庄家
    _FlyTodealer(areaIndex) {
        let arr = this.getArr(areaIndex);   //得到当前区域筹码池的筹码数组，
        for (let i = 0; i < arr.length; i++) {
            let curNode = arr[i];
            let Pos = this.curLogic.get("dealerPos");
            this._chipsFlyToPeople(curNode, Pos);
        }
    },
    //==================区域的筹码飞往玩家
    _flyToPlayer(areaIndex) {
        let arr = this.getArr(areaIndex);
        for (let i = 0; i < arr.length; i++) {
            let pos = this._getChipStartPos(arr[i].name.split("_")[1]);
            this._chipsFlyToPeople(arr[i], pos);
        }
    },

    //=============播放筹码飞行音效
    /**
   * 网络数据监听
   */
    regisrterEvent() {
        glGame.emitter.on("showAreaWinOrLose", this.showAreaWinOrLose, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.onProcess, this.onProcess, this);
        glGame.emitter.on("addChipImg", this.addChipImg, this);
        glGame.emitter.on(CONFIGS.logicGlobalEvent.settleEffect, this.onSettle, this);
    },
    unregisrterEvent() {
        glGame.emitter.off("showAreaWinOrLose", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onProcess, this);
        glGame.emitter.off("addChipImg", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.settleEffect, this);
    },
    showAreaWinOrLose(time) {
        cc.log("结算闪动111111")
        let msg = this.curLogic.get("t_onSettle");
        //庄家在每个区域的总输赢
        this.hideAreaWinOrLose();
        let dictDealerAreaSettle = msg.dictDealerAreaSettle;
        let tongsha = true;
        for (let i = 1; i < 5; i++) {
            if (parseFloat(dictDealerAreaSettle[i]) < 0) {
                tongsha = false;
                this.node_areawinOrLose.children[i - 1].getChildByName("sp_win").active = true;
                this.node_areawinOrLose.children[i - 1].getChildByName("sp_win").getComponent(sp.Skeleton).setAnimation(0, "animation", false);
                this.node_areawinBg.children[i - 1].getChildByName("sp_winBg").active = true;
                this.node_areawinBg.children[i - 1].getChildByName("sp_winBg").getComponent(sp.Skeleton).setAnimation(0, "animation", true);
                if (time != 0) {
                    this.node_areawinOrLose.children[i - 1].getChildByName("sp_win").getComponent(sp.Skeleton).addAnimation(0, "animation", false, time);
                    this.node_areawinBg.children[i - 1].getChildByName("sp_winBg").getComponent(sp.Skeleton).addAnimation(0, "animation", true, time);
                }
            } else {
                this.node_areawinOrLose.children[i - 1].getChildByName("sp_lose").active = true;
                this.node_areawinOrLose.children[i - 1].getChildByName("sp_lose").getComponent(sp.Skeleton).setAnimation(0, "animation", false);
            }
        }
        let curWaitTime = this.curLogic.getCurWaitTime();
        if (tongsha && curWaitTime >= 3) {
            glGame.emitter.emit("dealerTS");
        }
    },
    hideAreaWinOrLose() {
        for (let i = 0; i < this.node_areawinOrLose.childrenCount; i++) {
            this.node_areawinOrLose.children[i].getChildByName("sp_win").active = false;
            this.node_areawinBg.children[i].getChildByName("sp_winBg").active = false;
            this.node_areawinOrLose.children[i].getChildByName("sp_lose").active = false;
        }
    },
    getDelayTime() {
        let msg = this.curLogic.get("t_onSettle");
        let DTY = 0.;
        for (let i = 1; i < 5; i++) {
            let dictDealerAreaSettle = msg.dictDealerAreaSettle;
            if (parseFloat(dictDealerAreaSettle[i]) < 0) {
                DTY = 1375;     //庄家赔付到区域完
                return DTY;
            }
        }
        DTY = 2125;
        return DTY;
    },
    //在结算的时候开始动画
    onSettle() {
        if (!this.curLogic) return;
        this.curtime = this.curLogic.getMidEnterWaitTime();
        let msg = this.curLogic.get("t_onSettle");
        //let curTime = this.curLogic.getMidEnterWaitTime();
        for (let i = 1; i < 5; i++) {
            let areaIndex = i;      //区域索引
            this._dealerResultType = msg.resultDict[0].resultType;
            this._areaResultType = msg.resultDict[areaIndex].resultType;
            //庄家在每个区域的总输赢
            let dictDealerAreaSettle = msg.dictDealerAreaSettle;
            //我的输赢
            let myAreaSettleInfo = msg.myAreaSettleInfo;
            //富人的输赢
            let listRichInfo = msg.listRichInfo;
            //所有富人在该区域的总输赢
            let richAreaAllLose = this._richAllAreaLose(listRichInfo, areaIndex);
            //其他人在该区域的总输赢
            let mySettleInfo = myAreaSettleInfo[areaIndex];
            this._otherLoseBet = parseFloat(-1 * (dictDealerAreaSettle[areaIndex] + mySettleInfo + richAreaAllLose));
            //玩家输赢
            let delayTime;
            //庄家赔钱的动画
            if (parseFloat(dictDealerAreaSettle[areaIndex]) < 0) {
                //庄家赔付
                if (this.curtime - 2000 >= 0) {
                    delayTime = cc.delayTime((this.curtime - 2000) / 1000);
                    let callFunc = cc.callFunc(() => {
                        glGame.audio.playSoundEffect(this.audio_flyChips);
                        this._dealerloseBet(myAreaSettleInfo[areaIndex], msg.listRichInfo, this._otherLoseBet, areaIndex)
                    })//我的输钱，富人榜输钱信息，其他人输钱
                    this.node.runAction(cc.sequence(delayTime, callFunc));
                } else {
                    //把筹码添加进区域
                    this._dealerMidEloseBet(myAreaSettleInfo[areaIndex], msg.listRichInfo, this._otherLoseBet, areaIndex)
                }
                //飞向玩家
                if (this.curtime - 1500 >= 0) {
                    delayTime = cc.delayTime((this.curtime - 1500) / 1000);
                    let callFunc = cc.callFunc(() => { this._flyToPlayer(areaIndex) })
                    this.node.runAction(cc.sequence(delayTime, callFunc));
                } else {
                    //清除区域筹码
                    let arr = this.getArr(areaIndex);
                    this._hideList(arr);
                }
            } else {        //庄家赢钱
                //飞向庄家                          距离等待流程的时间-动画播放点
                if (this.curtime - 3000 >= 0) {
                    delayTime = cc.delayTime((this.curtime - 3000) / 1000);
                    let cb = cc.callFunc(() => {
                        glGame.audio.playSoundEffect(this.audio_flyChips);
                        this._MyloseMoneyFly(myAreaSettleInfo, areaIndex);
                        this._richLoseMoneyFly(listRichInfo, areaIndex);
                        this._otherLoseMoneyFly(this._otherLoseBet, areaIndex);
                    })
                    this.node.runAction(cc.sequence(delayTime, cb));
                } else {
                    //把筹码添加进区域
                    this._MyMidEloseMoney(myAreaSettleInfo, areaIndex);
                    this._richMidEloseMoney(listRichInfo, areaIndex);
                    this._otherMidELoseMoney(this._otherLoseBet, areaIndex);
                }
                if (this.curtime - 2500 >= 0) {
                    delayTime = cc.delayTime((this.curtime - 2500) / 1000);
                    let callFunc = cc.callFunc(() => { this._FlyTodealer(areaIndex) });
                    this.node.runAction(cc.sequence(delayTime, callFunc));
                } else {
                    //清除区域筹码
                    let arr = this.getArr(areaIndex);
                    this._hideList(arr);
                }
            }
        }
    },
    //中途加入
    midEnter() {
        let msg = this.curLogic.get("t_onMidEnter");
        this.curtime = this.curLogic.getMidEnterWaitTime();
        this._dealerUid = this.curLogic.get("dealerUid");
        this._myUid = this.curLogic.get("myUid");
        let chipAreaInfo = this.curLogic.get("chipAreaInfo");
        this.hideAreaWinOrLose();
        if (msg.processType == CONFIGS.process.settleEffect) {
            let DTY = this.getDelayTime();
            if (this.curtime >= DTY) {
                if (chipAreaInfo) {
                    this.addChips(chipAreaInfo);    //渲染中途进入的筹码
                }
                this.onSettle();
            }
        } else if (msg.processType == CONFIGS.process.chooseChip) {
            if (chipAreaInfo) {
                this.addChips(chipAreaInfo);    //渲染中途进入的筹码
            }
        }
    },
    onProcess() {
        let msg = this.curLogic.get("t_onProcess");
        if (msg.processType == CONFIGS.process.waitStart) {
            this.hideAreaWinOrLose();
            this.hideAllBet();
        } else if (msg.processType == CONFIGS.process.chooseChip) {
            this.hideAreaWinOrLose();
            this.hideAllBet();
        }
    },
    OnDestroy() {
        this.node.stopAllActions();
        for (let key in this._dict_hideChip) {
            this._dict_hideChip[key].clear();
        }
        this.unregisrterEvent();
        glGame.emitter.off("EnterBackground", this);    //切换后台
        glGame.emitter.off("EnterForeground", this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onEnterRoom, this);
        glGame.emitter.off(CONFIGS.logicGlobalEvent.onMidEnter, this);
        glGame.emitter.off("globalGameFinish", this);   //去刷新配置      
    },
    EnterBackground() {
        this.node.stopAllActions();
        this.hideAllBet();
        this.unregisrterEvent();
    },
    //添加逻辑层存的筹码
    addLocalChip() {
        let arr = this.curLogic.get("onChoseChipArr");
        for (let i = 0; i < arr.length; i++) {
            this.addChipInArea(arr[i].areaIndex, arr[i].chipValue, arr[i].chooseUid);
        }
    },
    EnterForeground() {
        this.regisrterEvent();
        this.curtime = this.curLogic.getMidEnterWaitTime();
        this._dealerUid = this.curLogic.get("dealerUid");
        this._myUid = this.curLogic.get("myUid");
        let msg = this.curLogic.get("t_onProcess");
        if (!msg) {
            msg = this.curLogic.get("t_onMidEnter");
        }
        this.hideAreaWinOrLose();
        if (msg.processType == CONFIGS.process.settleEffect) {
            let DTY = this.getDelayTime();
            if (this.curtime >= DTY) {
                this.addLocalChip();
            }
            this.onSettle();
        } else if (msg.processType == CONFIGS.process.chooseChip) {
            this.addLocalChip();
        }
    }
});
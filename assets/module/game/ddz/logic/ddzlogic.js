let CONFIGS = require("ddzconst");
let Judgement = require("doudizhuFP");
let
    DdzLogic = function (){
        this.resetData();
    },
    ddzLogic = DdzLogic.prototype,
    g_instance = null;

ddzLogic.resetData = function () {
    this.roomInfo = null;
    this.maxSeatCount = 3;
    this.players = {};
    this.enterRoomSeatId = null;
    this.landlordID = null;
    //记牌器开局默认开启，叫分结束后设为true
    this.isRecordDisplay = false;
    this.referPokers = {};
    this.opSeatId = null;
    this.process = 0;
    this.myCardList = [];
    this.cardNumViewId1 = 0;    //其他人的牌的数量
    this.cardNumViewId2 = 0;
    this.curOutCard = [];
    this.finalHandCard = {};
    this.winnerSeatId = null;
    this.lordCards = [];
    this.gameState = 1;
    this.pillageScore = 0;
    this.outCardList = [];  //暂存要打出的牌
    this.canPass = 0;
    this.searchOutCardData = {};
    this.searchOutCardIndex = 0;
    this.searchOutCardLength = 0;
    this.startTime = null;
    this.isAuto = {
        0:false,
        1:false,
        2:false,
    }

    this.serverOffTime =null;
    /*
    @gameTimes  当前倍数
    @gameBaseBet 游戏底分
    @maxGameTimes 最大倍数
    */
    this.gameTimes = 1;
    this.gameBaseBet = 0;
    this.maxGameTimes= 0;
    this.curScore = 0;

    this.resetPokersRecord();
    //reconnect data
    this.lastOutCard = null;
    this.lastOpSeatid = null;
    this.allScore = {
        0:-1,
        1:-1,
        2:-1,
    },
    this.settleData = null;
    this.backgroundState = false;
    this.outCardArr = {
        "0":[],
        "1":[],
        "2":[],
    }

    this.otherPlayer = null;
    this.nowPokerArr = null;

    this.selectCard = ['0x03','0x13','0x23'];

    this.settleCountdown = null;

    this.gmSwitch = false;

    this.gameStart = false;
};

ddzLogic.getFloat = function(value){
    return (Number(value).div(100)).toString();
};


ddzLogic.getViewSeatID = function(logicSeatId) {
    return logicSeatId>=this.getMySeatID() ? logicSeatId-this.getMySeatID() : this.maxSeatCount-(this.getMySeatID()-logicSeatId);
};

//初始化各值扑克牌的数量（一副牌）
ddzLogic.resetPokersRecord = function(){
    this.pokersRecord = {
        '1':4, '2':4, '3':4, '4':4, '5':4, '6':4, '7':4, '8':4, '9':4, 'a':4, 'b':4, 'c':4, 'd':4, 'e':1, 'f':1,
    }
};
//出牌发牌之后走这里进行计算
ddzLogic.reducePokerCount = function (cardList) {
    if(!cardList) return;
    for(let i=0; i<cardList.length; i++){
        let str = cardList[i].toString(16)
        let cardValue = str.charAt(str.length - 1)
        this.pokersRecord[cardValue]--;
    }
};
//重连之后，记牌数据走这里
ddzLogic.surplusPokers = function (pokerdata) {
    for(let key in this.pokersRecord){
        this.pokersRecord[key] = pokerdata[key];
    }
};
ddzLogic.SearchOutCard = function(){
    //初始化提示索引
    this.searchOutCardLength = 0;
    this.searchOutCardIndex = 0;

    //匹配数据判断
    if(Object.keys(this.referPokers).length == 0) return;
    console.log("提示的匹配数据", this.referPokers.pokerArr);

    //获取搜索结果
    console.log("重连之后的提示搜索", this.myCardList, this.referPokers.pokerArr)
    this.searchOutCardData =  Judgement.SearchOutCard(this.myCardList,this.referPokers.pokerArr);
    console.log("提示的结果数据", this.searchOutCardData)
    this.searchOutCardLength = this.searchOutCardData.count;

    //犯错处理
    if(!this.searchOutCardData.result) return;
    if(!this.searchOutCardData.result.cbResultCard) return;

    //需排序的牌型
    let referCardType = Judgement.GetCardType(this.referPokers.pokerArr);
    if(referCardType != CONFIGS.cardType.CT_SINGLE_LINE
        &&referCardType != CONFIGS.cardType.CT_DOUBLE_LINE
        &&referCardType != CONFIGS.cardType.CT_THREE_LINE){
        //this.searchOutCardIndex = this.searchOutCardData.count-1;
        //this.searchOutCardLength = this.searchOutCardData.count;

        if(this.searchOutCardData.count == 0) return;

        //获取排序结果
        this.searchOutCardData.result.cbResultCard = this.sortSearchResult();
        this.searchOutCardData.count = this.searchOutCardData.result.cbResultCard.length;
        console.log("排序后的提示搜索结果", this.searchOutCardData)
        this.searchOutCardIndex = this.searchOutCardData.count-1;
        this.searchOutCardLength = this.searchOutCardData.count;
    }
};

ddzLogic.sortSearchResult = function(){
    //获取和构造数据
    let results = this.searchOutCardData.result.cbResultCard;
    let arr = [];
    let bombIndex = [];
    /*查看前后数据变化的数据
    let temparr = [];
    for(let i=0; i<results.length; i++){
        let temp = results[i].slice(0);
        temparr.push(temp);
    }*/

    //过滤炸弹
    for(let i = 0; i<this.searchOutCardLength; i++){
        if(results[i].length==0) continue;
        if(Judgement.GetCardType(results[i])==CONFIGS.cardType.CT_MISSILE_CARD
        ||Judgement.GetCardType(results[i])==CONFIGS.cardType.CT_BOMB_CARD){
            bombIndex.push(i);
            continue;
        }
        let temp = results[i].slice(0)
        arr.push(temp);
    }

    //通过冒泡降序排列
    for(let j = 0; j<arr.length; j++){
        for(let i = 0; i<arr.length-1-j; i++){
            if(Judgement.GetCardLogicValue(arr[i][0])<Judgement.GetCardLogicValue(arr[i+1][0])){
                let temp = arr[i].slice(0);
                arr[i] = arr[i+1].slice(0);
                arr[i+1] = temp;
            }
        }
    }

    //补充炸弹
    for(let i = 0; i<bombIndex.length; i++){
        arr.unshift(results[bombIndex[i]]);
    }
    return arr;
};

/**
 * 网络数据监听
 */
ddzLogic.regisrterEvent = function () {
    glGame.emitter.on(glGame.room.getEnterRoom(glGame.scenetag.DDZ), this.connector_entryHandler_enterRoom, this);
    glGame.emitter.on("onInitRoom", this.onInitRoom, this);
    glGame.emitter.on(CONFIGS.CSEvent.onProcess, this.onProcess, this);
    glGame.emitter.on(CONFIGS.CSEvent.onDealCard, this.onDealCard, this);
    glGame.emitter.on(CONFIGS.CSEvent.onLandowner, this.onLandowner, this);
    glGame.emitter.on(CONFIGS.CSEvent.onLandownerResult, this.onLandownerResult, this);
    glGame.emitter.on(CONFIGS.CSEvent.onPlayCard, this.onPlayCard, this);
    glGame.emitter.on(CONFIGS.CSEvent.onPlayCardResult, this.onPlayCardResult, this);
    glGame.emitter.on(CONFIGS.CSEvent.onTimeGo, this.onTimeGo, this);
    glGame.emitter.on(CONFIGS.CSEvent.onGameOver, this.onGameOver, this);
    glGame.emitter.on(CONFIGS.CSEvent.onAutoPlay, this.onAutoPlay, this);
    glGame.emitter.on(CONFIGS.CSEvent.onplayerOp, this.onplayerOp, this);
    glGame.emitter.on(CONFIGS.CSEvent.onHandCards, this.onHandCards, this);
    glGame.emitter.on(CONFIGS.CSEvent.onSyncData, this.onSyncData, this);
    glGame.emitter.on(CONFIGS.CSEvent.onStartGame, this.onStartGame, this);

    glGame.emitter.on(CONFIGS.CSEvent.onEnterRoom, this.onEnterRoom, this);
    glGame.emitter.on(CONFIGS.CSEvent.startGameTimeOut, this.startGameTimeOut, this);
    glGame.emitter.on('horseRaceLamp', this.horseRaceLamp, this);
};
ddzLogic.unRegisterEvent = function () {
    glGame.emitter.off(glGame.room.getEnterRoom(glGame.scenetag.DDZ), this);

    glGame.emitter.off("onInitRoom", this);
    glGame.emitter.off(CONFIGS.CSEvent.onProcess, this);
    glGame.emitter.off(CONFIGS.CSEvent.onDealCard, this);
    glGame.emitter.off(CONFIGS.CSEvent.onLandowner, this);
    glGame.emitter.off(CONFIGS.CSEvent.onLandownerResult, this);
    glGame.emitter.off(CONFIGS.CSEvent.onPlayCard,this);
    glGame.emitter.off(CONFIGS.CSEvent.onPlayCardResult, this);
    glGame.emitter.off(CONFIGS.CSEvent.onTimeGo,this);
    glGame.emitter.off(CONFIGS.CSEvent.onGameOver, this);
    glGame.emitter.off(CONFIGS.CSEvent.onAutoPlay, this);
    glGame.emitter.off(CONFIGS.CSEvent.onplayerOp, this);
    glGame.emitter.off(CONFIGS.CSEvent.onHandCards,this);
    glGame.emitter.off(CONFIGS.CSEvent.onSyncData, this);
    glGame.emitter.off(CONFIGS.CSEvent.onStartGame, this);

    glGame.emitter.off(CONFIGS.CSEvent.startGameTimeOut, this);
    glGame.emitter.off(CONFIGS.CSEvent.onEnterRoom,this);
    glGame.emitter.off("horseRaceLamp", this);
};

ddzLogic.connector_entryHandler_enterRoom = function(msg){
    console.log("进入房间", msg)
};

ddzLogic.onInitRoom = function (msg) {
    console.log("初始化房间", msg)
    this.roomInfo = msg;
    for(let key in msg.seats){
        this.players[Number(key)] = this.players[Number(key)] ? this.players[Number(key)] : {}
        this.players[Number(key)].seatid = Number(key);
        this.players[Number(key)].uid = msg.seats[key].uid;
        this.players[Number(key)].logicid = msg.seats[key].logicid;
        this.players[Number(key)].nickname = msg.seats[key].nickname;
        this.players[Number(key)].gold = msg.seats[key].coin;
        this.players[Number(key)].headurl = msg.seats[key].headurl;
        this.players[Number(key)].sex = msg.seats[key].sex;
        if(msg.seats[key].uid == glGame.user.userID){
            this.myGold = msg.seats[key].coin;
        }
    }
    this.gameBaseBet = this.roomInfo.roomRule.BaseChips;
    this.maxGameTimes = this.roomInfo.roomRule.RoomMaxMultiple;
    glGame.emitter.emit("initRoomUI");
    glGame.emitter.emit("updateHeadInfo");
};

ddzLogic.horseRaceLamp = function(msg){
    console.log("horseRaceLamp", msg)
    let infoList = msg;
    let roomType = {99:"斗地主-体验房", 1:"斗地主-初级房", 2:"斗地主-中级房", 3:"斗地主-高级房", 4:"斗地主-贵宾房", 5:"斗地主-富豪房"};
    let roomTypeIndex = Number(infoList.betType);
    let horseLampLabel = '恭喜玩家 ' + `<color=#ff0000>${infoList.nickname}</c>` + ' 在'+`<color=#ffdd20>${roomType[roomTypeIndex]}</c>` + '大赢特赢,获得金额' + `<color=#00ff36>${this.getFloat(infoList.winCoin)}</c>`+`。`;
    glGame.notice.addContent(horseLampLabel);
};

ddzLogic.onSyncData = function(msg){
    this.myCardList = msg.myInfo.pokerArr;
    Judgement.SortCardList(this.myCardList, 1);
    this.opSeatId = msg.nowPlayerSeatId;
    this.process = msg.nowProcess;
    this.waitTime = msg.curWaitTime;
    this.serverTime = msg.serverTime;
    this.serverOffTime = msg.serverTime-Date.now();
    let baseBet = this.roomInfo.roomRule.BaseChips;
    switch(this.process){
        case CONFIGS.gameProcess.dealcard:
            this.gameStart = true;
            break;
        case CONFIGS.gameProcess.pillgae:
            this.gameStart = true;
            this.landlordID = msg.dizhuSeatid;
            this.curScore = msg.nowScore==0 ? this.curScore : msg.nowScore;
            this.gameBaseBet = baseBet;
            this.gameTimes = this.curScore==0 ? 1 : this.curScore;
            for(let i in msg.otherPlayer){
                this.allScore[i]=msg.otherPlayer[i].score;
            }
            for(let i in msg.otherPlayer){
                this.isAuto[i] = msg.otherPlayer[i].isAuto;
                if(i!=this.getMySeatID()){
                    this[`cardNumViewId${this.getViewSeatID(i)}`] = msg.otherPlayer[i].pokerLen;
                }
            }
            console.log("叫分阶段的重连数据", this.curScore, this.gameBaseBet, this.allScore)
            break;
        case CONFIGS.gameProcess.loop:
            this.gameStart = true;
            this.isRecordDisplay = this.roomInfo.roomRule.MemoryCard==1;
            this.pokersRecord = msg.pokerMem;
            this.curScore = msg.nowScore;
            this.gameTimes = msg.nowScore*msg.multipleValue;
            console.log("gametimes loop", this.gameTimes)
            this.landlordID = msg.nowLandlord;
            this.gameBaseBet = baseBet;
            this.canPass = 1;
            this.lordCards = msg.handCards;
            //该数据服务端未排序
            this.lastOutCard = msg.nowPokerArr?msg.nowPokerArr:[];
            Judgement.SortCardList(this.lastOutCard, 1);
            this.lastOpSeatid = msg.lastPlayerSeatId;
            this.outCardArr[this.lastOpSeatid] = this.lastOutCard;
            if(this.lastOutCard.length != 0 && this.lastOpSeatid != this.opSeatId){
                this.referPokers = {seatId:this.lastOpSeatid, pokerArr:this.lastOutCard};
            }
            let otherPlayer = msg.otherPlayer;
            for(let i in otherPlayer){
                this.isAuto[i] = otherPlayer[i].isAuto;
                if(i!=this.getMySeatID()){
                    this[`cardNumViewId${this.getViewSeatID(i)}`] = otherPlayer[i].pokerLen;
                }
            }
            console.log("重连后的数据", this.cardNumViewId1, this.cardNumViewId2, this.isAuto)
            if(this.opSeatId == this.getMySeatID()){
                this.SearchOutCard();
            }
            break;
        case CONFIGS.gameProcess.gamefinish:
            this.gameStart = false;
            this.otherPlayer = msg.otherPlayer;
            let lordSeatid = 0;
            for(let i in this.otherPlayer){
                if(this.otherPlayer[i].score>this.otherPlayer[lordSeatid].score){
                    lordSeatid = i;
                }
                if(i!=this.getMySeatID()){
                    this[`cardNumViewId${this.getViewSeatID(i)}`] = this.otherPlayer[i].pokerLen;
                }
            }
            this.landlordID = lordSeatid;
            this.nowPokerArr = msg.nowPokerArr;
            // this.gameTimes = this.otherPlayer[this.landlordID].score*
            this.gameBaseBet = this.gameBaseBet;
            break;
    }
    glGame.emitter.emit(CONFIGS.CCEvent.onSyncData);
};

ddzLogic.setPreInPlayer = function(){
    let seats = this.roomInfo.seats;
    for(let seatId in seats){
        this.players[seatId] = this.players[seatId] ? this.players[seatId] : {}
        this.players[seatId].uid = seats[seatId];
        this.players[seatId].isLookCard = false;
        //增加性别字段
        this.players[seatId].sex = seats[seatId].sex;
        this.players[seatId].nickname = seats[seatId].nickname;
        this.players[seatId].logicid = seats[seatId].logicid;
    }
    // glGame.room.reqUsers(seats);
};

ddzLogic.onStartGame = function(){
    this.gameStart = true;
    glGame.emitter.emit(CONFIGS.CCEvent.onStartGame);
};

ddzLogic.startGameTimeOut = function (msg) {
    this.startTime = msg.startTime;
    glGame.emitter.emit(CONFIGS.CCEvent.startGameTimeOut);
};

ddzLogic.onProcess = function(msg){
    cc.log("onProcess流程",msg);
    this.process = msg.processType;
    if(this.process == CONFIGS.gameProcess.loop){
        this.isRecordDisplay = this.roomInfo.roomRule.MemoryCard==1;
        this.reducePokerCount(this.myCardList);
    }
    glGame.emitter.emit(CONFIGS.CCEvent.onProcess);
};

//@pokerArr
ddzLogic.onDealCard = function(msg){
    console.log("发牌",msg.pokerArr)
    this.allScore= {
        0:-1,
        1:-1,
        2:-1,
    },
    this.myCardList = [];
    this.cardNumViewId1 = 0;
    this.cardNumViewId2 = 0;
    this.myCardList = msg.pokerArr;
    Judgement.SortCardList(this.myCardList,1);
    console.log("发牌",this.myCardList)
    glGame.emitter.emit(CONFIGS.CCEvent.onDealCard);
};

//@seatId
ddzLogic.onLandowner = function(msg){
    console.log("推送某玩家叫地主",msg)
    this.opSeatId = msg.seatId;
    this.waitTime = msg.waitTime;
    this.serverOffTime = msg.serverTime - Date.now();
    glGame.emitter.emit(CONFIGS.CCEvent.onLandowner);
};

//@seatId @score @nowLandlord(地主seatid) 玩家抢地主结果返回给所有玩家
ddzLogic.onLandownerResult = function(msg){
    console.log("推送玩家叫地主分值",msg)
    if (msg.seatId == this.getMySeatID()) glGame.panel.closeRoomJuHua();
    let baseBet = this.roomInfo.roomRule.BaseChips;
    this.curScore = msg.score==0 ? this.curScore : msg.score;
    this.gameBaseBet = baseBet;
    this.gameTimes = this.curScore==0?1:this.curScore;
    this.opSeatId = msg.seatId;
    this.pillageScore = msg.score;
    //地主
    this.landlordID = msg.nowLandlord;
    this.allScore[msg.seatId] = msg.score;
    console.log("每位玩家的叫分情况", this.allScore)
    console.log("最后底分情况", this.gameBaseBet)
    glGame.emitter.emit(CONFIGS.CCEvent.onLandownerResult);
};

//@seatId @waitTime @serverTime
ddzLogic.onPlayCard = function(msg){
    console.log("推送某玩家出牌",msg)
    this.waitTime = msg.waitTime;
    this.serverOffTime = msg.serverTime - Date.now();
    this.opSeatId = msg.seatId;
    this.canPass = msg.canPass;
    if(Object.keys(this.referPokers).length!=0 && msg.seatId == this.referPokers.seatId){
        this.referPokers = {};
    }
    if(this.opSeatId == this.getMySeatID()){
        this.SearchOutCard();
    }
    cc.log("this.referPokers",this.referPokers);

    glGame.emitter.emit(CONFIGS.CCEvent.onPlayCard);
};

//@seatId @pokerArr 玩家出牌结果返回给所有玩家
ddzLogic.onPlayCardResult = function(msg){
    console.log("推送某玩家出牌牌值",msg)
    if (msg.seatId == this.getMySeatID()) glGame.panel.closeRoomJuHua();
    this.opSeatId = msg.seatId;
    this.curOutCard = msg.pokerArr;
    this.tempOutCard = msg.pokerArr;
    Judgement.SortCardList(this.curOutCard,1);
    this.curOutCard = Judgement.SortOutCardList(this.curOutCard);
    console.log("推送某玩家出牌牌值",this.curOutCard)
    if (msg.pokerArr.length != 0) {
        this.referPokers = {seatId: msg.seatId, pokerArr: msg.pokerArr};
    }
    cc.log("this.referPokers",this.referPokers);
    if(this.opSeatId != this.getMySeatID()){
        this.reducePokerCount(msg.pokerArr);
    }

    this.gameTimes = msg.multipleValue*this.curScore;

    let viewId = this.getViewSeatID(msg.seatId);
    if (viewId == 1) {
        this.cardNumViewId1 -= msg.pokerArr.length;
    } else if (viewId == 2) {
        this.cardNumViewId2 -= msg.pokerArr.length;
    }

    if(this.backgroundState && this.opSeatId==this.getMySeatID()){
        this.reduceHandCards();
    }
    this.outCardArr[this.opSeatId] = msg.pokerArr;
    console.log("每位玩家最近一局的出牌数据", this.outCardArr);
    glGame.emitter.emit(CONFIGS.CCEvent.onPlayCardResult);
};

ddzLogic.reduceHandCards = function(){
    this.outCardList.splice(0,this.outCardList.length); //待检验
    for(let i=this.myCardList.length-1;i>=0; i--){
        for(let j=0; j<this.tempOutCard.length; j++){
            if(this.myCardList[i]==this.tempOutCard[j]){
                console.log("一张一张删除", i, this.myCardList[i])
                this.myCardList.splice(i,1);
            }
        }
    }
};

ddzLogic.onTimeGo = function(msg){
    console.log("推送定时器时间",msg)
};

//@playerPokers:{}, @winnerSeatId: winnerSeatId @isSpring: 0:不是  1:是
ddzLogic.onGameOver = function(msg){
    this.gameStart = false;
    glGame.user.reqMyInfo();
    this.finalHandCard = msg.playerPokers;
    this.winnerSeatId = msg.winnerSeatId;
    this.isSpring = msg.isSpring;
    this.gameTimes = this.curScore*msg.multipleValue;//当前倍数
    this.settleData = msg.settleData;
    this.myGold+=msg.settleData[this.getMySeatID()]
    console.log("游戏结束",msg)
    glGame.emitter.emit(CONFIGS.CCEvent.onGameOver);
};

//@seatId @isAuto 玩家托管结果托送给所有玩家
ddzLogic.onAutoPlay = function(msg){
    console.log("取消或开启托管",msg)
    if (msg.seatid==this.getMySeatID()) glGame.panel.closeRoomJuHua();
    this.isAuto[msg.seatId] = msg.isAuto;
    glGame.emitter.emit(CONFIGS.CCEvent.onAutoPlay);
};

//@type:1:叫地主2出牌3托管 @success 0失败 1成功 @错误类型code
ddzLogic.onplayerOp = function(msg){
    console.log("操作的返回情况",msg)
    this.t_onplayerOp = msg;
    glGame.emitter.emit(CONFIGS.CCEvent.onplayerOp);
}

//@seatId handCards:arr
ddzLogic.onHandCards = function(msg){
    console.log("确认地主",msg)
    this.landlordID = msg.seatId;
    this.lordCards = msg.handCards;
    let viewId = this.getViewSeatID(this.landlordID);
    if(viewId == 0 ){
        for(let i=0; i<this.lordCards.length; i++){
            this.myCardList.push(this.lordCards[i]);
        }
        Judgement.SortCardList(this.myCardList,1);
        this.cardNumViewId1 = 17;
        this.cardNumViewId2 = 17;
    }else if(viewId == 1){
        this.cardNumViewId1 = 20;
        this.cardNumViewId2 = 17;
    }else if (viewId == 2){
        this.cardNumViewId1 = 17;
        this.cardNumViewId2 = 20;
    }
    glGame.emitter.emit(CONFIGS.CCEvent.onHandCards);
};
ddzLogic.onEnterRoom  = function(msg){
    console.log('玩家进入', msg)
    this.players[msg.seatid] = this.players[msg.seatid] ? this.players[msg.seatid] : {}
    this.players[msg.seatid].uid = msg.user;
    this.players[msg.seatid].nickname = msg.nickname;
    this.players[msg.seatid].logicid = msg.logicid;
    this.players[msg.seatid].seatid = msg.seatid;
    this.players[msg.seatid].gold = msg.coin;
    this.players[msg.seatid].headurl = msg.headurl;
    //添加性别字段
    this.players[msg.seatid].sex = msg.sex;
    // this.enterRoomSeatId = msg.seatid;
    glGame.emitter.emit(CONFIGS.CCEvent.onEnterRoom, msg.seatid);
};
// ddzLogic.updateUsers = function(){
//     this.users = glGame.room.get('users')
//     for(let uid in this.users){
//         for(let seatid in this.players){
//             if(uid == this.players[seatid].uid){
//                 this.players[seatid].nickname = this.users[uid].logicid;
//                 this.players[seatid].seatid = seatid;
//                 this.players[seatid].gold = this.users[uid].coin;
//                 this.players[seatid].headurl = this.users[uid].headurl;
//             }
//         }
//     }
// };
//===================================
ddzLogic.getMySeatID = function () {
    let seats = this.roomInfo.seats;
    let seatID = null;
    for (let key in seats) {
        if (seats[key].uid === glGame.user.get("userID")) {
            seatID = key;
            break;
        }
    }
    return seatID;
};

ddzLogic.get = function (key) {
    return this[key];
};
ddzLogic.set = function (key, value) {
    this[key] = value;
};
ddzLogic.getCurWaitTime = function(type){
    let curTime = Math.ceil((this.waitTime - (Date.now() + this.serverOffTime))/1000);
    if(type==0){
        return Math.max(curTime, 0);
    }else{
        curTime = curTime - 22;
        return Math.max(curTime, 0);
    }
       // let curTime = 15;
    // return curTime;
};
//=============send=================================
ddzLogic.send_prepare = function(){

};
//发送抢地主消息
ddzLogic.send_pillage = function(_score){
    console.log("pomelo链接状态", glGame.gameNet.getState())
    if (!glGame.gameNet.getState()) return;
    glGame.panel.showRoomJuHua();
    let msg = {
        score : _score,
        oprType:CONFIGS.oprEvent.oprSnatchLandlord,
    }
    glGame.gameNet.send_msg(glGame.room.getPlayerOp(glGame.scenetag.DDZ), msg)
};
//发送出牌消息
ddzLogic.send_playCard = function(){
    console.log("pomelo链接状态", glGame.gameNet.getState())
    if (!glGame.gameNet.getState()) return;
    glGame.panel.showRoomJuHua();
    Judgement.GetCardType(this.outCardList);
    if(this.canPass==CONFIGS.canPass.CANNOT&&this.outCardList.length ==0){
        return;
    }
    let msg = {
        pokerArr : this.outCardList,
        oprType:CONFIGS.oprEvent.oprPlayerCard,
    }
    cc.log("给服务端发牌，",this.outCardList)
    glGame.gameNet.send_msg(glGame.room.getPlayerOp(glGame.scenetag.DDZ), msg)
},
//发送托管消息
ddzLogic.send_trusteeship = function(_isAuto){
    console.log("pomelo链接状态", glGame.gameNet.getState())
    if (!glGame.gameNet.getState()) return;
    glGame.panel.showRoomJuHua();
    let msg = {
        isAuto : _isAuto,
        oprType:CONFIGS.oprEvent.oprAutoPlay,
    }
    glGame.gameNet.send_msg(glGame.room.getPlayerOp(glGame.scenetag.DDZ), msg)
},

ddzLogic.showGoldTip = function(){
    let EntranceRestrictions = this.roomInfo.roomRule.EntranceRestrictions;
    console.log("换桌的准入判断", EntranceRestrictions)
    if (this.myGold < EntranceRestrictions) {
        if (cc.director.getScene().getChildByName("confirmbox")) return;
        let string = `<color=#99C7FF>       您的金币不足，该房间需要</c> <color=#ff0000> ${this.getFloat(EntranceRestrictions)}  </c><color=#99C7FF>金币才可下注，是否马上前往商城兑换金币？</c>`
        if(glGame.user.isTourist()){
            glGame.panel.showMsgBox("","您的筹码不足，请前往大厅充值。");
            return true;
        }
        glGame.panel.showDialog("金钱不足", string, this.showShop.bind(this));
        return true;
    }
    return false;
};

ddzLogic.showShop = function(){
    glGame.panel.showShop();
};

ddzLogic.destroy = function(){
    this.resetData();
    this.unRegisterEvent();
    g_instance = null;
    delete this;
};
//---------------------------
module.exports.getInstance = function(){
    if(!g_instance){
        g_instance = new DdzLogic();
        g_instance.regisrterEvent();
    }
    return g_instance;
};
module.exports.destroy = function(){
    if(g_instance){
       console.log("销毁斗地主数据层");
       g_instance.destroy();
    }
};

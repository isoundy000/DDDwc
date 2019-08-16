module.exports = {
    clientEvent: {
        onInitRoom: "onInitRoom",//当游戏开始的时候
        onMatchdetail: "onMatchdetail_xydzp",//比赛开始相关的信息
        onProcess: "onProcess_xydzp",//进度通知
        onChooseChip: "onChooseChip_xydzp",//有闲家下注
        onGameFinished: "onGameFinished",
        onMidEnter: "onMidEnter_xydzp",//中途加入
        onSettle: "onSettle_xydzp",//同步数据
        onNotice: "horseRaceLamp",
        updateUserData: "updateUserData",
        onRichListChange: "onRichListChange_xydzp",
    },

    //客户端操作事件
    oprEvent: {
        oprChooseChip: 1,//选择下注的筹码值
        oprGetPlayersList: 2,//请求玩家列表
        oprClearChip: 3,//清除所有下注
    },
    //进度
    process: {
        waitStart: 1,        // 等待开始游戏
        chooseChip: 2,       // 选择下注筹码
        settleEffect: 3,     // 结算表现
    },
    // 全局消息
    globalEvent: {
        onGameFinished: "lttlogic_onGameFinished",
        refPeoCount: "refPeopleCount",
        updateLbl: "lttUpdateLabel",
        clearBet: "lttClearBet",
        showWinArea: "lttShowWinArea",
        chipFlyBack: "lttChipFlyBack",
        changeChipView: "lttChangeChipView",
        betError: "lttBetError",
        showPlayerList: "updateUsers",
        onUpdateUserData: "logic_updateUserData",
        onProcess: "logic_onProcess",//进度通知
        onChooseChip: "logic_onChooseChip",//有闲家下注
        onMidEnter: "logic_onMidEnter",//中途加入
        onSettle: "logic_onSettle",//同步数据
        onPlayerOp: "logic_onplayerOp",
        onEnterRoom: "logic_onInitRoom",
        onRichListChange: "logic_onRichListChange",
    },
    //房间类型
    roomType: {
        99: "体验房", 1: "初级房", 2: "中级房", 3: "高级房", 4: "贵宾房", 5: "富豪房"
    },
}
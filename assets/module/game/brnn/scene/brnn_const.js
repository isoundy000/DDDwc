module.exports = {
    //客户端通知事件
    clientEvent: {
        onGameFinished: "onGameFinished",
        onMatchdetail: "onMatchdetail_brnn",//比赛开始相关的信息
        onConfirmGrab: "onConfirmGrab_brnn",//确认庄家
        onProcess: "onProcess_brnn",//进度通知
        onChooseChip: "onChooseChip_brnn",//有闲家下注
        onDealerFail: "onDealerFail_brnn",//上庄失败
        onMidEnter: "onMidEnter_brnn",//中途加入
        onSettle: "onSettle_brnn",//同步数据
        onGrabListChange: "onGrabListChange_brnn",//上庄列表发生了改变
        onRichListChange: "onRichListChange_brnn",//六人座发生了改变
        onOutGrabList: "onOutGrabList_brnn",//金币不足，剔除上庄列表
        onInitRoom: "onInitRoom",//初始化房间
    },

    //逻辑层全局事件
    logicGlobalEvent: {
        onEnterRoom: "logic_initRoom",
        onMatchdetail: "logic_onMatchdetail",//比赛开始相关的信息
        onConfirmGrab: "logic_onConfirmGrab",//确认庄家
        onProcess: "logic_onProcess",//进度通知
        onChooseChip: "logic_onChooseChip",//有闲家下注
        onDealerFail: "logic_onDealerFail",//上庄失败
        onMidEnter: "logic_onMidEnter",//中途加入
        onSettle: "logic_onSettle",//同步数据
        onGrabListChange: "logic_onGrabListChange",//上庄列表发生了改变
        onRichListChange: "logic_onRichListChange",//六人座发生了改变
        onOutGrabList: "logic_onOutGrabList",//金币不足，剔除上庄列表
        OnPlayerOp: "logic_onPlayerOp",      //玩家操作回调
        settleEffect: "logic_settleEffect",  //玩家流程到结算流程（onsettle在下注流程最后一秒就执行到了）
        updateInfo: "logic_updateInfo",
    },
    //客户端操作事件
    oprEvent: {
        oprChooseGrab: 1,//抢庄
        oprChooseChip: 2,//选择下注的筹码值
        oprCancelDealer: 3,//主动下庄
        oprGetPlayersList: 4,//请求玩家列表@playersList[{uid,gold}]
        oprExitGrabList: 5,//退出上庄列表
    },
    //庄家下庄的原因
    dealerCancelType: {
        playerCancel: 1,//玩家自己下庄
        fullRounds: 2,//满8局
        noGold: 3,//金钱不足
    },
    //进度
    process: {
        waitStart: 1,        //等待开始游戏
        chooseChip: 2,       //闲家选择下注筹码
        settleEffect: 3,     //结算表现流程
    },
    //房间类型
    roomType: {
        99: "体验房", 1: "初级房", 2: "中级房", 3: "高级房", 4: "贵宾房", 5: "富豪房"
    },
    //牛的倍数
    bullResultRate: {
        0: 1,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        10: 10,
        12: 10,   //顺子牛
        13: 10,   //同花牛
        14: 10,   //葫芦牛
        15: 10,   //炸弹牛
        17: 10,   //五花牛
        18: 10    //五小牛
    },
    ProgressStage: {
        waitStart: {

        },
        chooseChip: {

        }
    },



    maxDouble: 10,

    chipValueNodeWidth: 14,
    playCardTime : 3,           //发牌的时间

    configs:{
        chipFlyTime:0.3,
    }
}
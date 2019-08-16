module.exports = {
    //服务端到客户端的通知事件
    CSEvent:{
        //进度通知
        onProcess:"onProcess_ddz",
        //发牌
        onDealCard:"onDealCard_ddz",
        //推送某玩家叫地主
        onLandowner:"onLandowner_ddz",
        // 推送玩家叫地主分值
        onLandownerResult:"onLandownerResult_ddz",
        //推送确认地主
        onHandCards:"onHandCards_ddz",
        //推送某玩家出牌
        onPlayCard:"onPlayCard_ddz",
        // 推送某玩家出牌
        onPlayCardResult:"onPlayCardResult_ddz",
        // 推送定时器时间
        onTimeGo:"onTimeGo_ddz",
        // 游戏结束
        onGameOver:"onGameOver_ddz",
        // 取消或开启托管
        onAutoPlay:"onAutoPlay_ddz",
        //操作的返回情况
        onplayerOp:'ddzRoom.ddzRoomHandler.playerOp',
        onEnterRoom:'onEnterRoom',
        onSyncData:'onSyncData_ddz',
        startGameTimeOut:"startGameTimeOut",
        onStartGame:"onStartGame",
    },
    //服务端自己的通知时间
    CCEvent:{
        //进度通知
        onProcess:"ddz_onProcess",
        //发牌
        onDealCard:"ddz_onDealCard",
        //推送某玩家叫地主
        onLandowner:"ddz_onLandowner",
        // 推送玩家叫地主分值
        onLandownerResult:"ddz_onLandownerResult",
        //推送确认地主
        onHandCards:"ddz_onHandCards",
        //推送某玩家出牌
        onPlayCard:"ddz_onPlayCard",
        // 推送某玩家出牌
        onPlayCardResult:"ddz_onPlayCardResult",
        // 推送定时器时间
        onTimeGo:"ddz_onTimeGo",
        // 游戏结束
        onGameOver:"ddz_onGameOver",
        // 取消或开启托管
        onAutoPlay:"ddz_onAutoPlay",
        //操作的返回情况
        onplayerOp:'ddz_playerOp',
        onEnterRoom:'ddz_onEnterRoom',
        onSyncData:'ddz_onSyncData',
        startGameTimeOut:"ddz_startGameTimeOut",
    },

    //客户端操作事件
    oprEvent:{
        // 抢地主
        // 参数{score:int} 0:不叫，1-3分
        oprSnatchLandlord:1,
        // 玩家出牌
        // 参数{pokerArr:array} 传一个卡牌数组
        oprPlayerCard:2,
        // 玩家托管
        // 参数{isAuto:int} 1:托管 0:取消托管
        oprAutoPlay:3,
    },
    testCardList:['0x03','0x13','0x23','0x04','0x24','0x34','0x05','0x36','0x17','0x07','0x08','0x29','0x09','0x0a','0x0b','0x0c','0x0d','0x0b','0x0c','0x0d'],
    testLordCards:['0x08','0x29','0x09'],
    //@0抢地主,1正常出牌,2要不起,3第一手出牌,4托管中
    gameState:{
        pillgae:0,
        normal:1,
        notover:2,
        firstPlayCard:3,
        trusteeship:4
    },
    gameProcess:{
        dealcard:1,
        pillgae:2,
        loop:3,
        gamefinish:4,
    },

    cardType:{
        CT_ERROR: 0,                                    //错误类型
        CT_SINGLE: 1,                                    //单牌类型
        CT_DOUBLE: 2,                                    //对牌类型
        CT_THREE: 3,                                     //三条类型
        CT_SINGLE_LINE: 4,                               //单连类型
        CT_DOUBLE_LINE: 5,                               //对连类型
        CT_THREE_LINE: 6,                                //三连类型
        CT_THREE_TAKE_ONE: 7,                            //三带一单
        CT_THREE_TAKE_TWO: 8,                            //三带一对
        CT_FOUR_TAKE_ONE: 9,                             //四带两单
        CT_FOUR_TAKE_TWO: 10,                            //四带两对
        CT_BOMB_CARD: 11,                                //炸弹类型
        CT_MISSILE_CARD: 12,                             //火箭
    },
    canPass:{
        CANNOT:0,
        CAN:1,
    },
    cardResultSpineAnimationsName: {
        /**单连类型 */
        4: "danshunzi",
        /**对连类型 */
        5: "shuangshunzi",
        /**三连类型 */
        6: "sanshunzi",
        /**三带一单 */
        7: "sandaiyi",
        /**三带一对 */
        8: "saidaier",
        /**四带两单 */
        9: "sidaier",
        /**四带两对 */
        10: "sidaier",
        /**炸弹 */
        11: "zd",
        /**王炸 */
        12: "wz",
        /**飞机 */
        13: "feiji",
        14: "feiji"
    },
    //对应Sp_card_result引用的资源数组下标
    carResultSpineFile: {
        /**单连类型 */
        4: "3",
        /**对连类型 */
        5: "3",
        /**三连类型 */
        6: "3",
        /**三带一单 */
        7: "1",
        /**三带一对 */
        8: "1",
        /**四带两单 */
        9: "1",
        /**四带两对 */
        10: "1",
        /**炸弹 */
        11: "0",
        /**王炸 */
        12: "2",
        /**飞机 */
        13: "4",
        14: "4"
    },
    carResultSpineAudio: {
        /**单连类型 */
        4: "au_ddz_straight",
        /**对连类型 */
        5: "au_ddz_doublestraight",
        /**炸弹 */
        11: "au_ddz_bomb",
        /**王炸 */
        12: "au_ddz_rocket",
        /**飞机 */
        13: "au_ddz_plane",
        14: "au_ddz_plane"
    },
    settleSpineAnimationsName: {
        // 地主失败
        0: "dzsb",
        // 地主赢
        1: "dzsl",
        // 农民失败
        2: "nmsb",
        // 农民赢
        3: "nmsl"
    },
    audioPathPrefix: "modules/games/ddz/res/audio/"

    // audioPathPrefix: "modules/games/dianwan-client-ddz/res/audio/"
}

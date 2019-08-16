/**
 * 返水信息面板
 * 有效投注*比例 = 返水金额
 * 今日有效投注 = 总的子游戏有效投注之和
 * 今日预计返水 = 总的子游戏返水金额之和
 */
glGame.baseclass.extend({
    properties: {
        today_bet: cc.Label,        //未返水有效投注
        today_back: cc.Label,       //今日预计返水
        curback: cc.Label,          //返水数额
        time: cc.Label,              //返水结算时间

        cfgContent: cc.Node,
        cfgItem: cc.Node,
        btn_applyback: cc.Button,

        tipNode: cc.Node,
        richText: cc.RichText,

        left_Node: cc.Node,
        right_Node: cc.Node,


    },

    onLoad() {
        this.adaptationIPHONEX();
        this.registerEvent()
        this.type = 0;          //0棋牌，1捕鱼
        this.gameRecord = null;
    },

    backWaterActionEnd() {
        glGame.user.ReqRebateRecord();
    },

    start() {

    },

    //适配IPHONEX
    adaptationIPHONEX() {
        if (isiPhoneX) {
            let Widget = this.left_Node.getComponent(cc.Widget);
            let value = Widget.left;
            Widget.left = value + 35;
            Widget.updateAlignment();

            Widget = this.right_Node.getComponent(cc.Widget);
            value = Widget.left;
            Widget.left = value + 35;
            Widget.updateAlignment();
        }
    },
    //棋牌返水
    initChessContent() {
        let player_config = this.gameRecord["player_config"];
        let index = 0;
        this.cfgContent.removeAllChildren();
        for (let key in player_config) {
            let item = cc.instantiate(this.cfgItem);
            item.parent = this.cfgContent;
            item.active = true;
            item.getChildByName("game").getComponent(cc.Label).string = `${glGame.room.getGameDictById(Number(key))}`;            //游戏ID
            item.getChildByName("bet").getComponent(cc.Label).string = `${this.cutFloat(player_config[key].betting)}`;            //有效投注
            item.getChildByName("porpor").getComponent(cc.Label).string = `${Number(player_config[key].proportion).div(100)}%`;
            item.getChildByName("coin").getComponent(cc.Label).string = `${this.cutFloat(player_config[key].number)}`;     //返水金额
            item.getChildByName("bg").active = index % 2 == 0
            index++;
        }
    },
    //渲染捕鱼返水
    initFishContent() {
        let game_betting = this.gameRecord["player_fish_config"];
        let index = 0;
        this.cfgContent.removeAllChildren();
        for (let key in game_betting) {
            let item = cc.instantiate(this.cfgItem);
            item.parent = this.cfgContent;
            item.active = true;
            item.getChildByName("game").getComponent(cc.Label).string = `${glGame.room.getGameDictById(Number(key))}`;                              //游戏ID
            item.getChildByName("bet").getComponent(cc.Label).string = `${this.cutFloat(game_betting[key].betting)}`;            //有效投注
            item.getChildByName("porpor").getComponent(cc.Label).string = `${Number(game_betting[key].proportion).div(100)}%`;
            item.getChildByName("coin").getComponent(cc.Label).string = `${this.cutFloat(game_betting[key].number)}`;     //返水金额
            item.getChildByName("bg").active = index % 2 == 0
            index++;
        }
    },
    //渲染街机返水
    initArcadeContent() {
        let game_betting = this.gameRecord["arcadeConfig"];
        let index = 0;
        this.cfgContent.removeAllChildren();
        for (let key in game_betting) {
            let item = cc.instantiate(this.cfgItem);
            item.parent = this.cfgContent;
            item.active = true;
            item.getChildByName("game").getComponent(cc.Label).string = `${glGame.room.getGameDictById(Number(key))}`;                              //游戏ID
            item.getChildByName("bet").getComponent(cc.Label).string = `${this.cutFloat(game_betting[key].betting)}`;            //有效投注
            item.getChildByName("porpor").getComponent(cc.Label).string = `${Number(game_betting[key].proportion).div(100)}%`;
            item.getChildByName("coin").getComponent(cc.Label).string = `${this.cutFloat(game_betting[key].number)}`;     //返水金额
            item.getChildByName("bg").active = index % 2 == 0
            index++;
        }
    },

    //渲染上下部的其他UI
    initOtherUI() {
        this.today_bet.string = `${this.cutFloat(this.gameRecord.new_bet)}`;
        this.today_back.string = `${this.cutFloat(this.gameRecord.new_rebate)}`;
        this.curback.string = `${this.cutFloat(this.gameRecord.rebate_coin)}`;
        this.time.string = `每天${this.gameRecord.settlement_time}`;
        this.btn_applyback.interactable = this.gameRecord.rebate_coin > 0;
        this.btn_applyback.node.active = this.gameRecord.rebate_type == 1;
        this.curback.node.parent.active = this.gameRecord.rebate_type == 1;
    },

    registerEvent() {
        glGame.emitter.on("updateReqRebateRecord", this.updateReqRebateRecord, this);
        glGame.emitter.on("updateReqRebateApply", this.updateReqRebateApply, this);
        glGame.emitter.on("backWaterActionEnd", this.backWaterActionEnd, this);
    },

    unRegisterEvent() {
        glGame.emitter.off("updateReqRebateRecord", this);
        glGame.emitter.off("updateReqRebateApply", this);
        glGame.emitter.off("backWaterActionEnd", this);
    },

    OnDestroy() {
        this.unRegisterEvent();
    },

    updateReqRebateRecord() {
        let userPumpRecord = glGame.user.get("userPumpRecord");
        this.gameRecord = userPumpRecord[0];
        if (!this.gameRecord) {
            return glGame.user.ReqRebateRecord();
        }
        switch (this.type) {
            case 0: this.initChessContent(); break;
            case 1: this.initFishContent(); break;
            case 2: this.initArcadeContent(); break;
        }
        this.initOtherUI();
    },

    //领取返水成功
    updateReqRebateApply(msg) {
        cc.log("领取返水成功")
        this.tipNode.active = true;
        let coin = msg.coin || 0;        //暂时
        this.richText.string = `        <color=#ffd488>尊敬的贵宾您好，您申请的</color><color=#00ff00>${this.cutFloat(coin)}</color><color=#ffd488>返水已经发送至您的账户中，请及时查收！</color>`
        glGame.user.ReqRebateRecord();
    },

    onClick(name, node) {
        if (glGame.user.isTourist()) {
            if (name != 'close' && name != 'btn_chess' && name != 'btn_fish' && name != 'btn_detail') {
                glGame.panel.showRegisteredGift(true);
                return;
            }
        }
        switch (name) {
            case "btn_applyback": this.applyback_cb(); break;
            case "btn_record": this.record_cb(); break;
            case "btn_detail": this.detail_cb(); break;
            case "close":
                glGame.panel.revertOpenNodeEffect(this.node, 2).then(() => { this.remove() });
                glGame.emitter.emit("plazaOpen")
                break;
            case "btn_chess": this.click_chess(); break;
            case "btn_fish": this.click_fish(); break;
            case "btn_arcade": this.click_arcade(); break;
            case "btn_sure": this.tipNode.active = false; break;
            default:
                break;
        }
    },

    click_chess() {
        this.type = 0;
        this.initChessContent();
    },

    click_fish() {
        this.type = 1;
        this.initFishContent();
    },

    click_arcade() {
        this.type = 2;
        this.initArcadeContent();
    },
    //浮点型运算取俩位
    cutFloat(value) {
        return Number(value).div(100).toFixed(2).toString();
    },

    detail_cb() {
        glGame.panel.showPanelByName('porpor');
    },

    record_cb() {
        glGame.panel.showPanelByName('waterrecord');
    },

    applyback_cb() {
        glGame.user.ReqRebateApply();
    },
});

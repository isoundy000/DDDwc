const GAMETYPE = {
    "hundred": 0,
    "coin": 1,
    "laba": 2,
    'fish': 3
}
glGame.baseclass.extend({
    properties: {
        recorditem: cc.Node,
        recordview: cc.Node,
        norecord: cc.Node,
        tip: cc.Node,
        title: cc.Node,
        view: cc.Node,

        top: [cc.Node],
        item: [cc.Node],
        lab_page: cc.Label,

        pjRecordDetails: cc.Prefab,
        qznnRecordDetails: cc.Prefab,
        sgRecordDetails: cc.Prefab,
        zjhRecordDetails: cc.Prefab,
        lhdRecordDetails: cc.Prefab,
        dzpkRecordDetails: cc.Prefab,
        bjlRecordDetails: cc.Prefab,
        xydzpRecordDetails: cc.Prefab,
        brnnRecordDetails: cc.Prefab,
        hhRecordDetails: cc.Prefab,
        sgjRecordDetails: cc.Prefab,
        ebgRecordDetails: cc.Prefab,
        jszjhRecordDetails: cc.Prefab,
        esydRecordDetails: cc.Prefab,
        fishRecordDetails: cc.Prefab,
        ddzRecordDetails: cc.Prefab,
        qhbjlRecordDetails: cc.Prefab,
        sssRecordDetails:cc.Prefab,
        hcpyRecordDetails: cc.Prefab,
        slwhRecordDetails: cc.Prefab,
    },
    onLoad() {
        this.pageIndex = 1;
        this.pageSize = 8;
        this.pageCount = 0;
        glGame.panel.showRoomJuHua();
        this.registerEvent();
        this.resetData();
    },
    updateUI(gameID) {
        this.gameID = gameID;

        if (!gameID) console.error("gameid null");
        glGame.user.reqUserHandRecords(this.gameID, this.pageSize, this.pageIndex);
    },

    getgameType(gameID) {
        let gameType;
        switch (gameID) {
            case glGame.scenetag.BRNN:
            case glGame.scenetag.HONGHEI:
            case glGame.scenetag.LONGHUDOU:
            case glGame.scenetag.SHUIGUOJI:
            case glGame.scenetag.BAIJIALE:
            case glGame.scenetag.LUCKTURNTABLE:
            case glGame.scenetag.QHBJL:
            case glGame.scenetag.HCPY:
            case glGame.scenetag.SLWH:
                gameType = GAMETYPE["hundred"];
                break;
            case glGame.scenetag.ZHAJINHUA:
            case glGame.scenetag.QZNN:
            case glGame.scenetag.SANGONG:

            case glGame.scenetag.PAIJIU:
            case glGame.scenetag.DZPK:
            case glGame.scenetag.DDZ:
            case glGame.scenetag.EBG:
            case glGame.scenetag.JSZJH:
            case glGame.scenetag.ESYD:
            case glGame.scenetag.SSS:
                gameType = GAMETYPE["coin"];
                break;
            case glGame.scenetag.LABA:
                gameType = GAMETYPE["laba"];
                break;
            case glGame.scenetag.FISH:
                gameType = GAMETYPE["fish"];
                break;
        };
        return gameType;
    },

    initUI() {
        this.gameType = this.getgameType(this.gameID);
        console.log('游戏类型', this.gameType)
        if (this.gameType == GAMETYPE["hundred"]) {
            this.top[0].active = true;
            this.paijuitem = this.item[0];
        } else if (this.gameType == GAMETYPE["coin"]) {
            this.top[1].active = true;
            this.paijuitem = this.item[1];
        } else if (this.gameType == GAMETYPE["laba"]) {
            this.top[2].active = true;
            this.paijuitem = this.item[2];
        } else if (this.gameType == GAMETYPE["fish"]) {
            this.top[1].active = true;
            this.paijuitem = this.item[1];
        }
    },

    resetPanelData(msg) {
        this.initUI();
        let gameName = glGame.room.getGameNameById(this.gameID);
        this.recordview.destroyAllChildren();
        console.log('牌局相关', msg)
        this.pageIndex = msg.current_page;
        this.pageCount = msg.total_page;
        this.lab_page.string = `第${msg.current_page}/${msg.total_page}页`;
        let gameRecord = msg.list;
        glGame.panel.closeRoomJuHua();
        if (gameRecord.length == 0) return;
        let count = gameRecord.length;

        let show = true;
        this.norecord.active = count < 1;
        for (let i = 0; i < count; i++) {
            show = false;
            let panel = cc.instantiate(this.paijuitem);

            if (this.gameID == glGame.scenetag.LABA) {
                panel.getComponent(cc.Button).interactable = false;
            }
            if (this.gameID == glGame.scenetag.FISH) {
                panel.getComponent(cc.Button).interactable = false;
                panel.getChildByName('detalis_btn').active = false;
            }
            // panel.tag = i;
            panel.name = `detail_${i}`;
            let recordData = gameRecord[i];
            panel.getChildByName("bg").active = i % 2 != 0;

            let id = panel.getChildByName("id");
            id.getComponent(cc.Label).string = this.pageSize * (this.pageIndex - 1) + i + 1;

            let hand_number = panel.getChildByName("hand_number");
            hand_number.getComponent(cc.Label).string = recordData["hand_number"];

            // 拉霸没有房间类型
            if (this.gameType != GAMETYPE["laba"]) {
                let bettype = panel.getChildByName("bettype");
                bettype.getComponent(cc.Label).string = this.gameLevel[recordData["bettype"]];
            }

            //百人场
            if (this.gameType == GAMETYPE["hundred"] || this.gameType == GAMETYPE["laba"]) {
                let winGoldNode = panel.getChildByName("winCount");
                let winGold = Number(recordData["winning_coin"]);
                winGoldNode.color = winGold > 0 ? new cc.Color(0, 255, 0) : new cc.Color(255, 0, 0);
                winGold = winGold > 0 ? `+${this.cutDownNum(winGold)}` : this.cutDownNum(winGold);
                winGoldNode.getComponent(cc.Label).string = winGold;
            }

            //拉霸专属
            if (this.gameType == GAMETYPE["laba"]) {
                let bet = panel.getChildByName("bet");
                let betCoin = Number(recordData["bet_coin"])
                bet.getComponent(cc.Label).string = this.cutDownNum(betCoin)
            }

            let number = panel.getChildByName("number");
            let profit = Number(recordData["number"]);
            number.color = profit > 0 ? new cc.Color(0, 255, 0) : new cc.Color(255, 0, 0);
            profit = profit > 0 ? `+${this.cutDownNum(profit)}` : this.cutDownNum(profit);
            number.getComponent(cc.Label).string = profit;

            let end_time = panel.getChildByName("end_time");
            end_time.getComponent(cc.Label).string = recordData["end_time"];

            panel.active = true;
            panel.parent = this.recordview;
        }
        this.norecord.active = show;
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
    resetData() {
        this.gameLevel = { 1: "初级房", 2: "中级房", 3: "高级房", 4: "贵宾房", 5: "富豪房", 99: '体验房' };

    },
    registerEvent() {
        glGame.emitter.on("updateGameRecord", this.resetPanelData, this);
    },
    unRegisterEvent() {
        glGame.emitter.off("updateGameRecord", this);
    },
    OnDestroy() {
        this.unRegisterEvent();
        let userGameRecord = glGame.user.get("userGameRecord");
        userGameRecord[this.gameID] = null;
        glGame.user.set("userGameRecord", userGameRecord);
        //glGame.user.reqUserHandRecords(this.gameID);
    },
    onClick(name, node) {
        switch (name) {
            case "close": this.remove(); break;
            case "item_hundred":
            case "item_laba":
            case "item_coin":
                this.details_cb(node);
                break;
            case 'btn_last':
                this.btn_lastCb();
                break;
            case 'btn_next':
                this.btn_nextCb();
                break;
            default:
                if (name.indexOf("detail") > -1) {
                    let lndex = name.substring(7);
                    this.details_cb(lndex);
                } break;
        }
    },
    btn_lastCb() {
        if (this.pageIndex <= 1) {
            glGame.panel.showTip('当前已经是第一页！');
            return;
        }
        this.pageIndex--;
        glGame.user.reqUserHandRecords(this.gameID, this.pageSize, this.pageIndex);
        glGame.panel.showRoomJuHua();
    },

    btn_nextCb() {
        if (this.pageIndex >= this.pageCount) {
            glGame.panel.showTip('当前已经是最后一页！');
            return;
        }
        this.pageIndex++;
        glGame.user.reqUserHandRecords(this.gameID, this.pageSize, this.pageIndex);
        glGame.panel.showRoomJuHua();
    },
    details_cb(index) {
        let gameName = glGame.room.getGameNameById(this.gameID);
        if (this.gameID == glGame.scenetag.FISH) return;
        this.node.getChildByName("panel").active = false;
        this.node.getChildByName("mask").active = false;
        let detailsNode = cc.instantiate(this[`${gameName}RecordDetails`]);
        let script = detailsNode.getComponent(`${gameName}RecordDetails`);
        let userGameRecord = glGame.user.get("userGameRecord");
        let gameRecord = userGameRecord[this.gameID];
        if (!gameRecord) return glGame.user.reqUserHandRecords(this.gameID);
        gameRecord = gameRecord["list"];
        let recordDetailsData = gameRecord[Number(index)];
        script.set("recordDetailsData", recordDetailsData);
        script.set("modelType", 1)
        let recordDetails = this.node.getChildByName("recordDetails");
        recordDetails.active = true;
        detailsNode.parent = recordDetails;

    },
    set(key, value) {
        this[key] = value;
    },
    get(key) {
        return this[key];
    }
});

const TIMETYPE = {
    0: "全部时间",
    1: "今日",
    2: "昨日",
    3: "三日以内",
    4: "一周以内",
    5: "一个月以内",
}
const ROOMTYPE = { 99: "体验房", 1: "初级房", 2: "中级房", 3: "高级房", 4: "贵宾房", 5: "富豪房" }
glGame.baseclass.extend({
    properties: {
        content: cc.Node,
        hunditem: cc.Node,
        hundtitle: cc.Node,

        gameitem: cc.Node,
        timeScr: cc.Node,
        gameScr: cc.Node,
        time_lab: cc.Label,
        game_lab: cc.Label,
        gameContent: cc.Node,

        lab_pageIndex: cc.Label,
        noitem: cc.Node,

        mask: cc.Node,

        itemBgSp: [cc.SpriteFrame],

        bjl_recordDetails: cc.Prefab,
        brnn_recordDetails: cc.Prefab,
        dzpk_recordDetails: cc.Prefab,
        hh_recordDetails: cc.Prefab,
        lhd_recordDetails: cc.Prefab,
        xydzp_recordDetails: cc.Prefab,
        pj_recordDetails: cc.Prefab,
        qznn_recordDetails: cc.Prefab,
        sg_recordDetails: cc.Prefab,
        sgj_recordDetails: cc.Prefab,
        zjh_recordDetails: cc.Prefab,
        fish_recordDetails: cc.Prefab,
        jszjh_recordDetails: cc.Prefab,
        esyd_recordDetails: cc.Prefab,
        ebg_recordDetails: cc.Prefab,
        ddz_recordDetails: cc.Prefab,
        qhbjl_recordDetails: cc.Prefab,
        sss_recordDetails: cc.Prefab,
        hcpy_recordDetails: cc.Prefab,
        slwh_recordDetails: cc.Prefab,
    },
    onLoad() {
        this.endTime = null;
        this.startTime = null;
        this.gameid = null;
        this.PageIndex = 1;
        this.initgameItemUI();
        this.reqBetFlow(this.gameid);
    },

    start() {
        this.node.getComponent(cc.Widget).updateAlignment();            //挂载到父节点要立刻刷新widget
        this.adaptation();
    },
    //适配   985*620 left = 110  spacingX = 191
    adaptation() {
        let width = this.node.width;
        let titleLayout = this.hundtitle.getComponent(cc.Layout);
        titleLayout.paddingLeft = 110 / 985 * width;
        titleLayout.spacingX = (width - (110 / 985 * width * 2)) / 4;         //2个空隙   900：里面节点的总宽度
        titleLayout.updateLayout();

        let itemyayout = this.hunditem.getChildByName("hunditem").getComponent(cc.Layout);
        itemyayout.paddingLeft = 110 / 985 * width;
        itemyayout.spacingX = (width - (110 / 985 * width * 2)) / 4;         //2个空隙   900：里面节点的总宽度
        itemyayout.updateLayout();
    },

    onClick(name, node) {
        switch (name) {
            case "btn_selectTime": this.selectTime_cb(); break;
            case "btn_selectType": this.selectGame_cb(); break;
            case "mask": this.mask_cb(); break;
            case "btn_lastPage": this.lastPage_cb(); break;
            case "btn_nextPage": this.nextPage_cb(); break;
            default:
                if (name.indexOf("itemTime") > -1) return this.click_itemTime(name);
                if (name.indexOf("itemGame") > -1) return this.click_itemGame(name);
                if (name.indexOf("gameRecord") > -1) return this.click_gameRecord(name);
                break;
        }
    },

    lastPage_cb() {
        if (this.PageIndex == 1 || this.pageCount == 0) return glGame.panel.showTip("已经是第一页了！")
        this.PageIndex--;
        this.reqBetFlow();   //请求协议
    },

    nextPage_cb() {
        if (this.PageIndex == this.pageCount || this.pageCount == 0) return glGame.panel.showTip("已经是最后一页了！")
        this.PageIndex++;
        this.reqBetFlow();   //请求协议
    },

    click_itemTime(name) {
        let string = name.substring(8);
        this.PageIndex = 1;
        this.time_lab.string = TIMETYPE[Number(string)];
        this.timeScr.active = this.mask.active = false;
        this.searchByTime(TIMETYPE[Number(string)]);
    },

    click_itemGame(name) {
        let string = name.substring(8);
        this.PageIndex = 1;
        this.game_lab.string = string == "All" ? "全部游戏" : glGame.room.getGameDictById([Number(string)]);
        this.gameScr.active = this.mask.active = false;
        this.gameid = string == "All" ? null : Number(string);
        this.reqBetFlow(this.gameid);
    },

    //初始化游戏列表
    initgameItemUI() {
        let gamelist = glGame.gamelistcfg.getGameGroup();
        let count = gamelist.length;
        // let gameItem = cc.instantiate(this.gameitem);
        // gameItem.name = `itemGameAll`
        // gameItem.getChildByName("label").getComponent(cc.Label).string = '全部游戏'
        // gameItem.parent = this.gameContent;
        // gameItem.active = true;
        for (let i = 0; i < count; i++) {
            let gameItem = cc.instantiate(this.gameitem);
            gameItem.name = `itemGame${gamelist[i]}`
            gameItem.getChildByName("label").getComponent(cc.Label).string = `${glGame.room.getGameDictById([gamelist[i]])}`;
            gameItem.parent = this.gameContent;
            gameItem.active = true;
        }
        let string = this.gameContent.children[0].name.substring(8);
        this.game_lab.string = `${glGame.room.getGameDictById([Number(string)])}`;
        this.gameid = Number(string);
    },

    //渲染牌局记录
    initRecordUI(list) {
        this.content.removeAllChildren();
        if (list.length == 0) {
            this.noitem.active = true;
            this.lab_pageIndex.string = '第0/0页';
            return;
        }
        this.noitem.active = false;
        this.lab_pageIndex.string = `第${this.PageIndex}/${this.pageCount}页`;
        for (let i = 0; i < list.length; i++) {
            let node = cc.instantiate(this.hunditem);
            node.getChildByName("bg").active = i % 2 != 0;
            node.parent = this.content;
            node.active = true;

            let item = node.getChildByName("hunditem");
            item.getChildByName("no").children[0].getComponent(cc.Label).string = list[i].hand_number;
            item.getChildByName("room").children[0].getComponent(cc.Label).string = `${glGame.room.getGameDictById(list[i].game_id)}(${ROOMTYPE[list[i].bettype]})`;
            item.getChildByName("coin").children[0].getComponent(cc.Label).string = this.cutFloat(list[i].bet_coin)
            item.getChildByName("win").children[0].getComponent(cc.Label).string = this.cutFloat(list[i].number)
            item.getChildByName("win").children[0].color = list[i].number > 0 ? cc.Color.GREEN : cc.Color.RED;
            item.getChildByName("endtime").children[0].getComponent(cc.Label).string = list[i].end_time;
            item.name = `gameRecord_${list[i].id}_${list[i].game_id}`;
            if (list[i].game_id == glGame.scenetag.LABA || list[i].game_id == glGame.scenetag.FISH) {
                node.getComponent(cc.Button).interactable = false;
            }

        }
        console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx打包LOG")
    },

    selectTime_cb() {
        this.timeScr.active = !this.timeScr.active;
        if (this.timeScr.active) this.mask.active = true;
    },
    selectGame_cb() {
        this.gameScr.active = !this.gameScr.active;
        if (this.gameScr.active) this.mask.active = true;
    },
    mask_cb() {
        this.timeScr.active = this.gameScr.active = this.mask.active = false;
    },

    reqBetFlow(game_id, start, end, page, pagesize) {
        let msg = {};
        if (game_id || this.gameid) msg.game_id = game_id ? game_id : this.gameid;
        if (start || this.startTime) msg.start = start ? start : this.startTime;
        if (end || this.endTime) msg.end = end ? end : this.endTime;
        msg.page = this.PageIndex;
        msg.pagesize = 10;
        glGame.gameNet.send_msg('http.reqBetFlow', msg, (route, data) => {
            cc.log("牌局战绩", data);
            let result = data.result;
            this.pageCount = result.total_page;
            this.recordList = result.list;
            this.initRecordUI(result.list);
        })
    },

    click_gameRecord(name) {
        let arr = name.split("_");
        let id = arr[1];
        let gameid = arr[2];
        let gameName = glGame.room.getGameNameById(gameid);
        if (gameid === 40) return
        let detailsNode = cc.instantiate(this[`${gameName}_recordDetails`]);
        let script = detailsNode.getComponent(`${gameName}RecordDetails`);
        let data;
        for (let i = 0; i < this.recordList.length; i++) {
            if (this.recordList[i].id == id) {
                data = this.recordList[i];
            }
        }
        script.set("recordDetailsData", data);
        script.set("modelType", 2)
        detailsNode.parent = this.node.parent.parent;
    },

    searchByTime(timeStr) {
        let valueDirt = {
            '全部时间': { value: 0, type: "all" },
            '今日': { value: 0, type: "today" },
            '昨日': { value: 1 * 24 * 60 * 60 * 1000, type: "yestoday" },
            '三日以内': { value: 3 * 24 * 60 * 60 * 1000, type: "day" },
            '一周以内': { value: 7 * 24 * 60 * 60 * 1000, type: "day" },
            '一个月以内': { value: 30 * 24 * 60 * 60 * 1000, type: "day" },
        }
        let startTime = new Date();
        let endTime = new Date();
        console.log("time time", startTime, valueDirt[timeStr], timeStr)
        if (valueDirt[timeStr].type == "day") {
            startTime = new Date(startTime.getTime() - valueDirt[timeStr].value);
            let y = startTime.getFullYear();
            let m = "0" + (startTime.getMonth() + 1);
            let d = "0" + (startTime.getDate());
            let y1 = endTime.getFullYear();
            let m1 = "0" + (endTime.getMonth() + 1);
            let d1 = "0" + (endTime.getDate());
            this.startTime = y + "-" + m.substring(m.length - 2, m.length) + "-" + d.substring(d.length - 2, d.length);
            this.endTime = y1 + "-" + m1.substring(m1.length - 2, m1.length) + "-" + d1.substring(d1.length - 2, d1.length);
            console.log("time time time ", this.startTime, this.endTime)
            this.reqBetFlow(this.gameid, this.startTime, this.endTime);
        } else if (valueDirt[timeStr].type == "yestoday") {
            startTime = new Date(startTime.getTime() - valueDirt[timeStr].value);
            endTime = new Date(startTime.getTime() - valueDirt[timeStr].value);
            let y = startTime.getFullYear();
            let m = "0" + (startTime.getMonth() + 1);
            let d = "0" + (startTime.getDate());
            let y1 = endTime.getFullYear();
            let m1 = "0" + (endTime.getMonth() + 1);
            let d1 = "0" + (endTime.getDate());
            this.startTime = y + "-" + m.substring(m.length - 2, m.length) + "-" + d.substring(d.length - 2, d.length);
            this.endTime = y1 + "-" + m1.substring(m1.length - 2, m1.length) + "-" + d1.substring(d1.length - 2, d1.length);
            console.log("time time time ", this.startTime, this.endTime)
            this.reqBetFlow(this.gameid, this.startTime, this.endTime);
        } else if (valueDirt[timeStr].type == "today") {
            let y = startTime.getFullYear();
            let m = "0" + (startTime.getMonth() + 1);
            let d = "0" + (startTime.getDate());
            let y1 = endTime.getFullYear();
            let m1 = "0" + (endTime.getMonth() + 1);
            let d1 = "0" + (endTime.getDate());
            this.startTime = y + "-" + m.substring(m.length - 2, m.length) + "-" + d.substring(d.length - 2, d.length);
            this.endTime = y1 + "-" + m1.substring(m1.length - 2, m1.length) + "-" + d1.substring(d1.length - 2, d1.length);
            console.log("time time time ", this.startTime, this.endTime)
            this.reqBetFlow(this.gameid, this.startTime, this.endTime);
        } else {
            this.PageIndex = 1;
            this.endTime = null;
            this.startTime = null;
            this.reqBetFlow();
        }
    },

    // 注册界面监听事件
    registerEvent() {

    },
    // 销毁界面监听事件
    unRegisterEvent() {

    },

    OnDestroy() {
        this.unRegisterEvent();
    },

    //浮点型运算取俩位
    cutFloat(value, num = 2) {
        if (isNaN(value)) return;
        if (~~value === value) {
            return value.div(100).toString();
        } else {
            value = Number(value).div(100);
            return (Math.floor(value * 100) / 100).toFixed(num);
        }
    },
});

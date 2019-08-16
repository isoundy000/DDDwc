const TIMETYPE = {
    0: "全部时间",
    1: "今日",
    2: "昨日",
    3: "三日以内",
    4: "一周以内",
    5: "一个月以内",
}

glGame.baseclass.extend({
    properties: {
        accountContent: cc.Node,
        accountItem: cc.Node,

        typeContent: cc.Node,
        typeItem: cc.Node,
        timeScr: cc.Node,
        typeScr: cc.Node,

        mask: cc.Node,
        time_lab: cc.Label,
        type_lab: cc.Label,
        noitem: cc.Node,
        down: cc.Node,
        scrollView: cc.Node,

        uptitleLayout: cc.Node,
        titleLayout: cc.Node,

        itemSp: [cc.SpriteFrame],

        lab_pageIndex: cc.Label,
    },
    onLoad() {
        this.endTime = null;
        this.startTime = null;
        this.type = null;
        this.is_first = true;
        this.PageIndex = 1;
        this.summary = {};
    },

    start() {
        this.node.getComponent(cc.Widget).updateAlignment();            //挂载到父节点要立刻刷新widget
        this.adaptation();
        this.reqCapitalFlow(this.type, this.startTime, this.endTime, this.is_first);
    },

    /**
     * 1280的宽 layout spacingX = 100 , left  = 1280 - 300*3-2*150 = 80/2
     * 990 的宽 layout spacingX = 31 , left  = 40/1280*990 = 31
     */
    adaptation() {
        let titleLayout = this.titleLayout.getComponent(cc.Layout);
        let width = this.node.width;
        titleLayout.paddingLeft = 40 / 1280 * width;
        titleLayout.spacingX = (width - 900 - (40 / 1280 * width * 2)) / 2;         //2个空隙   900：里面节点的总宽度
        titleLayout.updateLayout();

        let itemLayout = this.accountItem.getChildByName("item").getComponent(cc.Layout);
        itemLayout.paddingLeft = 40 / 1280 * width;
        itemLayout.spacingX = (width - 900 - (40 / 1280 * width * 2)) / 2;
        itemLayout.updateLayout();

        let uptitleLayout = this.uptitleLayout.getComponent(cc.Layout);
        uptitleLayout.spacingX = 350 / (1280 - 160 - 180) * (width - 160 - 180);
        uptitleLayout.updateLayout();
    },

    onClick(name, node) {
        switch (name) {
            case "btn_selectTime": this.selectTime_cb(); break;
            case "btn_selectType": this.selectType_cb(); break;
            case "mask": this.mask_cb(); break;
            case "btn_lastPage": this.lastPage_cb(); break;
            case "btn_nextPage": this.nextPage_cb(); break;
            default:
                if (name.indexOf("itemTime") > -1) return this.click_itemTime(name);
                if (name.indexOf("typeItem") > -1) return this.click_typeItem(name);
                break;
        }
    },

    lastPage_cb() {
        if (this.PageIndex == 1 || this.PageIndex == 0) return glGame.panel.showTip("已经是第一页了！")
        this.PageIndex--;
        this.reqCapitalFlow();
    },

    nextPage_cb() {
        if (this.PageIndex >= this.pageCount || this.PageIndex == 0) return glGame.panel.showTip("已经是最后一页了！")
        this.PageIndex++;
        this.reqCapitalFlow();
    },

    click_itemTime(name) {
        this.PageIndex = 1;
        let string = name.substring(8);
        this.time_lab.string = TIMETYPE[Number(string)];
        this.timeScr.active = this.mask.active = false;
        this.searchByTime(TIMETYPE[Number(string)]);
    },

    click_typeItem(name) {
        this.PageIndex = 1;
        let string = name.substring(8);
        this.type_lab.string = Number(string) == 0 ? "全部类型" : this.Alltype[Number(string)];
        this.typeScr.active = this.mask.active = false;
        this.type = Number(string) == 0 ? null : Number(string);      //全部游戏不传这个字段就OK
        this.reqCapitalFlow(this.type);
    },

    initTypeUI(data) {
        let typeItem = cc.instantiate(this.typeItem);
        typeItem.name = `typeItem${0}`
        typeItem.getChildByName("label").getComponent(cc.Label).string = "全部类型"
        typeItem.parent = this.typeContent;
        typeItem.active = true;
        for (let key in data) {
            typeItem = cc.instantiate(this.typeItem);
            typeItem.name = `typeItem${key}`
            typeItem.getChildByName("label").getComponent(cc.Label).string = data[key];
            typeItem.parent = this.typeContent;
            typeItem.active = true;
        }

        //需求：需要直接展示所有的类型
        let length = Object.keys(data).length, height = typeItem.height;
        this.typeContent.parent.parent.height = height * (length + 1);
        this.typeContent.parent.height = height * (length + 1);
    },

    initRecordUI(list) {
        this.accountContent.removeAllChildren();
        if (list.length == 0) {
            this.noitem.active = true;
            this.lab_pageIndex.string = '第0/0页';
            return;
        }
        this.lab_pageIndex.string = `第${this.PageIndex}/${this.pageCount}页`;
        this.noitem.active = false;
        for (let i = 0; i < list.length; i++) {
            let node = cc.instantiate(this.accountItem);
            node.parent = this.accountContent;
            node.getChildByName("bg").active = i % 2 != 0;

            let item = node.getChildByName("item");
            let time = item.getChildByName("time").children[0];
            time.getComponent(cc.Label).string = list[i].produce_time;
            let type = item.getChildByName("type").children[0];
            type.getComponent(cc.Label).string = list[i].type;
            let coin = item.getChildByName("coin").children[0];
            coin.getComponent(cc.Label).string = this.cutFloat(list[i].coin);
            this.setColor(list[i].type, coin);

            node.active = true;
        }
        console.log("acccccccccccccccccccccccccccccccccccc打包LOG")
    },
    setColor(type, node) {
        switch (type) {
            case "充值":
                node.color = new cc.Color(0, 255, 0);
                break;
            case "取现":
                node.color = new cc.Color(255, 84, 0);
                break;
            default:
                node.color = new cc.Color(255, 223, 94);
                break;
        }
    },
    selectTime_cb() {
        this.timeScr.active = !this.timeScr.active;
        if (this.timeScr.active) this.mask.active = true;
    },
    selectType_cb() {
        this.typeScr.active = !this.typeScr.active;
        if (this.typeScr.active) this.mask.active = true;
    },
    mask_cb() {
        this.timeScr.active = this.typeScr.active = this.mask.active = false;
    },

    reqCapitalFlow(type, start, end, is_first) {
        let msg = {};
        if (type || this.type) msg.type = type ? type : this.type;
        if (start || this.startTime) msg.start = start ? start : this.startTime;
        if (end || this.endTime) msg.end = end ? end : this.endTime;
        if (is_first || this.is_first) msg.is_first = is_first ? is_first : this.is_first;
        msg.page = this.PageIndex;
        msg.pageSize = 10;
        glGame.gameNet.send_msg('http.reqCapitalFlow', msg, (route, data) => {
            cc.log("账号明细", data);
            let result = data.result;

            if (result.current_page == 1) {
                this.summary = result.summary;
            }
            this.pageCount = result.total_page;
            if (is_first) {
                this.is_first = null;
                this.Alltype = result.summary.type;
                if (this.Alltype) this.initTypeUI(this.Alltype);
            }
            let downtitle = this.down.children[1];
            downtitle.getChildByName("recharge").children[0].getComponent(cc.Label).string = this.summary.recharge_all ? this.cutFloat(this.summary.recharge_all) : 0;
            downtitle.getChildByName("withdraw").children[0].getComponent(cc.Label).string = this.summary.withdraw_all ? "-" + this.cutFloat(this.summary.withdraw_all) : 0;
            downtitle.getChildByName("discount").children[0].getComponent(cc.Label).string = this.summary.discount_all ? this.cutFloat(this.summary.discount_all) : 0;
            this.initRecordUI(result.list);
        })
    },

    // 注册界面监听事件
    registerEvent() {

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
            this.reqCapitalFlow(this.type, this.startTime, this.endTime);
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
            this.reqCapitalFlow(this.type, this.startTime, this.endTime);
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
            this.reqCapitalFlow(this.type, this.startTime, this.endTime);
        } else {
            this.PageIndex = 1;
            this.endTime = null;
            this.startTime = null;
            this.reqCapitalFlow();
        }
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

glGame.baseclass.extend({

    properties: {
        headImg: cc.Node,
        nickName: cc.Label,
        searchEdx: cc.EditBox,
        scrollviewNode: cc.Node,
        recordContent: cc.Node,
        itemNode: cc.Node,
        playerCount: cc.Label,
        totalBet: cc.Label,
        emptyNode: cc.Node,
    },

    onLoad() {
        this.total = 0;
        this.count = 0;
        this.pageNum = 1;
        let msg = {
            date: this.date,
            page: 1,
            page_size: 15,
        };

        glGame.gameNet.send_msg("http.ReqPlayerExtensionCountlessRecordDetail", msg, (route, data) => {
            console.log("commisionDetail", data)
            this.totalPage = data.total;
            this.list = data.list;
            this.total = data.summary.total_commission;
            this.count = data.summary.contribute_num;
            this.refreshUi();
        })
        this.scrollviewNode.on("scroll-to-bottom", this.scrollToBottom, this);
    },

    scrollToBottom(event) {
        this.pageNum++;
        if (this.pageNum > this.totalPage) return;
        let msg = {
            date: this.date,
            page: this.pageNum,
            page_size: 15,
        };
        glGame.gameNet.send_msg("http.ReqPlayerExtensionCountlessRecordDetail", msg, (route, data) => {
            console.log("commisionDetail", data)
            this.list = data.list;
            this.refreshUi();
        })
    },

    initData(date) {
        this.date = date;
    },

    refreshUi() {
        glGame.panel.showHeadImage(this.headImg, glGame.user.get("headURL"));
        this.nickName.string = glGame.user.get("nickname");
        this.playerCount.string = this.count;
        this.totalBet.string = glGame.user.GoldTemp(Number(this.total));
        for (let i = 0; i < this.list.length; i++) {
            let item = cc.instantiate(this.itemNode);
            item.parent = this.recordContent;
            item.getChildByName("bg").active = i % 2 == 0;
            item.active = true;
            item.getChildByName("1").getComponent(cc.Label).string = this.list[i].logicid;
            item.getChildByName("2").getComponent(cc.Label).string = this.list[i].type;
            item.getChildByName("3").getComponent(cc.Label).string = this.cutFloat(this.list[i].bet);
            item.getChildByName("4").getComponent(cc.Label).string = this.cutFloat(this.list[i].contribute_commission);
        }
        this.emptyNode.active = this.recordContent.childrenCount == 0;
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

    onClick(name, node) {
        switch (name) {
            case "close":
                this.remove();
                break;
            case "search":
                this.click_search();
                break;
        }
    },

    click_search() {
        let msg = {
            date: this.date,
            logicid: this.searchEdx.string,
            page: 1,
            page_size: 15,
        }
        glGame.gameNet.send_msg("http.ReqPlayerExtensionCountlessRecordDetail", msg, (route, data) => {
            this.recordContent.removeAllChildren();
            this.totalPage = data.total;
            this.list = data.list;
            this.total = data.summary.total_commission;
            this.count = data.summary.contribute_num;
            this.refreshUi();
            console.log("data", data)
        })
    },
});

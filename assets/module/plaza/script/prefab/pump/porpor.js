/**
 * 返水比例
 */
glGame.baseclass.extend({
    properties: {
        left_item: cc.Node,
        left_content: cc.Node,

        vip_pageitem: cc.Node,
        vip_pageView: cc.PageView,
        vip_mid_content: cc.Node,
        vip_mid_item: cc.Node,
        vip_node: cc.Node,
        vip_right: cc.Node,
        vip_left: cc.Node,

        normal_pageitem: cc.Node,
        normal_pageView: cc.PageView,
        normal_mid_content: cc.Node,
        normal_mid_item: cc.Node,
        normal_node: cc.Node,
        normal_right: cc.Node,
        normal_left: cc.Node,
    },

    onLoad() {
        this.vip_node.active = false;
        this.normal_node.active = false;
        this.registerEvent();
        glGame.user.ReqRebateVipList();
        this.vipLevel = 0;
        this.pageIndex = 0;
        this.mid_item = null;
        this.mid_content = null;
        this.pageView = null;
        this.pageitem = null;
        this.btn_right = null;
        this.btn_left = null;
    },

    start() {

    },

    registerEvent() {
        glGame.emitter.on("rebateVipList", this.rebateVipList, this);
    },
    unRegisterEvent() {
        glGame.emitter.off("rebateVipList", this);
    },

    OnDestroy() {
        this.unRegisterEvent();
    },

    rebateVipList() {
        this.RebateVipList = glGame.user.get("RebateVipList");
        cc.log("嘿嘿嘿", this.RebateVipList);
        if (glGame.user.get("mode_type") == "vip") {
            this.mid_item = this.vip_mid_item;
            this.mid_content = this.vip_mid_content;
            this.pageView = this.vip_pageView;
            this.page_item = this.vip_pageitem;
            this.config = this.RebateVipList[Number(this.vipLevel)].config;
            this.initLeft(this.RebateVipList);
            this.initpageView(this.config);
            this.initMidUI(this.config);
            this.vip_node.active = true;
            this.btn_right = this.vip_right;
            this.btn_left = this.vip_left;

            let vip_name = glGame.user.get("vip_name");
            for (let i = 0; i < this.RebateVipList.length; i++) {
                if (Number(this.RebateVipList[i].vip_name) == Number(vip_name)) {
                    this.left_content.children[i].getComponent(cc.Toggle).check();
                    return;
                }
            }
        } else {
            this.mid_item = this.normal_mid_item;
            this.mid_content = this.normal_mid_content;
            this.pageView = this.normal_pageView;
            this.page_item = this.normal_pageitem;
            this.config = this.RebateVipList;
            this.initpageView(this.config);
            this.initMidUI(this.config);
            this.normal_node.active = true;
            this.btn_right = this.normal_right;
            this.btn_left = this.normal_left;
        }
        this.chengeBtnState();


    },

    initLeft(data) {
        let index = 0;
        for (let key in data) {
            let item = cc.instantiate(this.left_item);
            item.parent = this.left_content;
            item.active = true;
            item.name = `vipitem${index}`;
            let background = item.children[0];
            background.getChildByName("vip_label").getComponent(cc.Label).string = `VIP${data[key].vip_name}`;
            let check = item.children[1]
            check.getChildByName("vip_label").getComponent(cc.Label).string = `VIP${data[key].vip_name}`
            index++;
        }
    },

    initpageView(config) {
        this.pageView.removeAllPages();
        let keys = Object.keys(config)              //子游戏ID数组
        let gameporpor = config[keys[0]];           //子游戏的数据
        let gameKeys = Object.keys(gameporpor);     //区间的keys

        for (let i = 0; i < gameKeys.length; i++) {
            let page = cc.instantiate(this.page_item);
            this.pageView.addPage(page);
            page.active = true;
            if (i == gameKeys.length - 1) {
                page.getChildByName("label").getComponent(cc.Label).string = `${this.cutFloat(gameKeys[i])}以上`
            } else {
                page.getChildByName("label").getComponent(cc.Label).string = `${this.cutFloat(gameKeys[i])}~${this.cutFloat(gameKeys[i + 1])}`
            }
        }
    },
    initMidUI(config) {
        this.mid_content.removeAllChildren();
        let gamekeys = Object.keys(config)
        let itemCount = 0;
        let item;               //一个item包含3个子游戏
        let pageindex = this.pageView.getCurrentPageIndex();
        for (let i = 0; i < gamekeys.length; i++) {
            if (i % 3 == 0) {
                item = cc.instantiate(this.mid_item);
                item.parent = this.mid_content;
                item.active = true;
                item.getChildByName("bg").active = itemCount % 2 == 0
                itemCount += 1;
            }
            let childrenindex = (i % 3) + 1;    //节点里面有bg
            let gameitem = item.children[childrenindex]
            gameitem.active = true;
            gameitem.getComponent(cc.Label).string = glGame.room.getGameDictById([Number(gamekeys[i])]) + ":";     //游戏名

            let gamedata = config[gamekeys[i]];
            let keys = Object.keys(gamedata);
            gameitem.getChildByName("porpor_lab").getComponent(cc.Label).string = `${gamedata[keys[pageindex]] / 100}%`;
        }
    },

    onClick(name, node) {
        switch (name) {
            case "close": this.remove(); break;
            case "btn_left": this.left_cb(); break;
            case "btn_right": this.right_cb(); break;
            default:
                if (name.indexOf("vipitem") > -1) this.vip_cb(name); break
        }
    },

    vip_cb(name) {
        this.vipLevel = name.substring(7);
        this.config = this.RebateVipList[Number(this.vipLevel)].config;
        cc.log("返水等级数据", this.config)
        this.initpageView(this.config);
        this.pageIndex = 0;
        this.initMidUI(this.config);
        this.chengeBtnState();
    },

    left_cb() {
        if (this.pageIndex == 0) return
        this.pageIndex--;
        this.chengeBtnState();
        this.onshowPage(this.pageIndex);
    },
    right_cb() {
        if (this.pageIndex == this.pageView.getPages().length) return
        this.pageIndex++;
        this.chengeBtnState();
        this.onshowPage(this.pageIndex);
    },
    chengeBtnState() {
        this.btn_left.active = this.pageIndex != 0;
        this.btn_right.active = this.pageIndex != this.pageView.getPages().length - 1;
    },
    // 显示指定页面
    onshowPage(index) {
        this.scheduleOnce(() => {
            this.pageView.scrollToPage(index, 0.3);
            this.initMidUI(this.config);
        }, 0);
    },
    //浮点型运算取俩位
    cutFloat(value) {
        return Number(value).div(100).toString();
    },

});

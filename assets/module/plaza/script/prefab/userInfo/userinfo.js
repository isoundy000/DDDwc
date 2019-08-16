/**
 * 玩家个人信息界面
 */
glGame.baseclass.extend({
    properties: {
        prefab_vip: cc.Prefab,
        prefab_vipprivilege: cc.Prefab,
        prefab_myinfo: cc.Prefab,
        prefab_account: cc.Prefab,
        prefab_record: cc.Prefab,
        mainPanel: cc.Node,

        leftbtns: cc.Node,

        reddot: cc.Node,

        tipNode: cc.Node,
        lab_tipCoin: cc.Label,

        left_node: cc.Node,
    },
    onLoad() {
        this.adaptationIPHONEX();
        this.isFirst = true;
        this.myinfoPanel = null;
        this.vipprivilegePanel = null;
        this.accountPanel = null;
        this.vipPanel = null;
        this.recordPanel = null
        this.birthMonth = 1;
        this.birthDay = 1;
        this.registerEvent();

        glGame.user.reqMyInfo();
    },
    start() {

    },

    userinfoActionEnd() {

    },
    
    showInfo() {
        if (this.isFirst) {
            this.showPanel("myinfo");
            this.isFirst = false;
        }
        this.initReddot();
    },

    //适配IPHONEX
    adaptationIPHONEX() {
        if (isiPhoneX) {
            let Widget = this.mainPanel.getComponent(cc.Widget);
            let value = Widget.left;
            Widget.left = value + 35;
            Widget.updateAlignment();

            Widget = this.left_node.getComponent(cc.Widget);
            value = Widget.left;
            Widget.left = value + 35;
            Widget.updateAlignment();
        }
    },

    onClick(name, node) {
        switch (name) {
            case "myinfo": this.showPanel("myinfo"); break;
            case "vipprivilege": this.showPanel("vipprivilege"); break;
            case "account": this.showPanel("account"); break;
            case "vipinfo": this.showPanel("vip"); break;
            case "record": this.showPanel("record"); break;
            case "btn_tipSure":
            case "btn_tipClose": this.tipNode.active = false; break;
            case "close":
                glGame.panel.revertOpenNodeEffect(this.node, 2).then(() => { this.remove() });
                glGame.emitter.emit("plazaOpen")
                break;
        }
    },

    initReddot() {
        this.reddot.active = glGame.user.get("redDotData").vipReq == 1;
    },

    shpwTipPanel(coin) {
        this.tipNode.active = true;
        this.lab_tipCoin.string = this.cutFloat(coin)
    },

    toVIPPanel() {
        this.showPanel("vip");
        this.leftbtns.getChildByName("vip").getComponent(cc.Toggle).isChecked = true;
    },

    //隐藏所有界面
    hideAllPanel() {
        if (this.myinfoPanel) this.myinfoPanel.active = false;
        if (this.vipprivilegePanel) this.vipprivilegePanel.active = false;
        if (this.accountPanel) this.accountPanel.active = false;
        if (this.vipPanel) this.vipPanel.active = false;
        if (this.recordPanel) this.recordPanel.active = false;
    },

    //显示某个界面。按名字来显示
    showPanel(panelName) {
        this.hideAllPanel()
        if (this[panelName + "Panel"]) {
            this[panelName + "Panel"].active = true;
            return;
        }
        this[panelName + "Panel"] = cc.instantiate(this["prefab_" + panelName]);
        cc.log("this[panelName+", this[panelName + "Panel"].width)
        this[panelName + "Panel"].parent = this.mainPanel;
        cc.log("this[panelName+////////////", this[panelName + "Panel"].width)
    },

    //浮点型运算取俩位
    cutFloat(num) {
        return (this.getFloat(Number(num).div(100))).toString();
    },
    //浮点型运算取俩位
    getFloat(value, num = 2) {
        value = Number(value);
        if (isNaN(value)) return;
        if (~~value === value) {
            return value.toString();
        } else {
            return (Math.floor(value * 100) / 100).toFixed(num);
        }
    },

    // 注册界面监听事件
    registerEvent() {
        glGame.emitter.on("userinfoActionEnd", this.userinfoActionEnd, this);
        glGame.emitter.on("ReqRedDot", this.initReddot, this);
        glGame.emitter.on("showTipPanel", this.shpwTipPanel, this);
        glGame.emitter.on("updateUserData", this.showInfo, this);
    },
    // 销毁界面监听事件
    unRegisterEvent() {
        glGame.emitter.off("userinfoActionEnd", this);
        glGame.emitter.off("ReqRedDot", this);
        glGame.emitter.off("showTipPanel", this);
        glGame.emitter.off("updateUserData", this);
    },

    OnDestroy() {
        this.unRegisterEvent();
    },
});

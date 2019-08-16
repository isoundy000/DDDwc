/**
 * 银行入口面板: 存入,取出共用
 */
glGame.baseclass.extend({
    properties: {
        item: cc.Node,
        content: cc.Node,
        tipLabel: cc.Node,
        titleLayout: cc.Node,
        itemLayout: cc.Node,
    },
    onLoad() {
        this.registerEvent();
        this.initUI();
    },
    start() {
        this.node.getComponent(cc.Widget).updateAlignment();            //挂载到父节点要立刻刷新widget
        this.adaptation();
    },

    initUI() {
        glGame.user.reqBankCoinList(1, 50);
    },
    //适配   980*625 left = 160  spacingX = 330
    adaptation() {
        let width = this.node.width;
        let titleLayout = this.titleLayout.getComponent(cc.Layout);
        titleLayout.paddingLeft = 160 / 980 * width;
        titleLayout.spacingX = (width - (160 / 980 * width * 2)) / 2;
        titleLayout.updateLayout();

        let itemLayout = this.itemLayout.getComponent(cc.Layout);
        itemLayout.paddingLeft = 160 / 980 * width;
        itemLayout.spacingX = (width - (160 / 980 * width * 2)) / 2;
        itemLayout.updateLayout();
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
    updateBankRecord() {
        this.content.removeAllChildren();
        let data = glGame.user.get("bankrecord");
        let list = data.list;
        this.tipLabel.active = list.length == 0;
        for (let i = 0; i < list.length; i++) {
            let node = cc.instantiate(this.item);
            cc.log("i % 2 == 0", i % 2 == 0)
            node.getChildByName("bg").active = i % 2 == 0;
            node.parent = this.content;
            let item = node.getChildByName("value");
            item.children[0].getChildByName("time").getComponent(cc.Label).string = list[i].create_time;
            item.children[1].getChildByName("type").getComponent(cc.Label).string = list[i].type;
            item.children[2].getChildByName("coin").getComponent(cc.Label).string = (list[i].number > 0 ? "+" : "") + this.cutFloat(list[i].number);
            item.children[2].getChildByName("coin").color = list[i].number > 0 ? cc.Color.GREEN : cc.Color.RED;

            node.active = true;
        }
    },
    registerEvent() {
        glGame.emitter.on("updateBankRecord", this.updateBankRecord, this);
    },
    // 销毁界面监听事件
    unRegisterEvent() {
        glGame.emitter.off("updateBankRecord", this);
    },
    OnDestroy() {
        this.unRegisterEvent();
    },
    // 刷新界面数据、UI
    updateUserData() {

    },

    onClick(name, node) {
        switch (name) {

            default: console.error("no find button name -> %s", name);
        }
    },
    set(key, value) {
        this[key] = value;
    },
    get(key) {
        return this[key];
    }
});

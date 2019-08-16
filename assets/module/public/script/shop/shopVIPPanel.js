glGame.baseclass.extend({

    properties: {
        content: cc.Node,
        prefab_serviceQQ: cc.Prefab,
        prefab_serviceWX: cc.Prefab,
        prefab_complainPanel: cc.Prefab,
        labuserID: cc.Label,

        qqToggle:cc.Toggle,
    },

    onLoad() {
        this.mylogicID = glGame.user.get("logicID");
        this.labuserID.string = this.mylogicID;
        this.wxlist = [];
        this.qqlist = [];
    },

    start() {

    },

    refPayData(payKey) {
        let shopData = glGame.user.ShopData;
        for (let key in shopData) {
            if (key == payKey) {
                this.payData = shopData[key].goods;
            }
        }
        for (let i = 0; i < this.payData.length; i++) {
            if (this.payData[i].contact_type == 1) {
                this.wxlist.push(this.payData[i]);
            } else {
                this.qqlist.push(this.payData[i]);
            }
        }
        this.click_qq();
    },

    initUI() {
        this.qqToggle.check();
    },

    onClick(name, node) {
        if (glGame.user.isTourist()) {
            if (name == 'icon') {
                glGame.panel.showRegisteredGift(true);
                return;
            }
        }
        switch (name) {
            case "qq": this.click_qq(); break;
            case "wechat": this.click_wechat(); break;
            case "icon": this.click_complaint(); break;
            case "copy": this.click_copy(); break;
        }
    },

    

    click_copy() {
        glGame.platform.copyToClip(this.mylogicID);
    },

    click_complaint() {
        let complaintNode = cc.instantiate(this.prefab_complainPanel);
        complaintNode.parent = cc.director.getScene();
    },

    click_qq() {
        this.content.removeAllChildren();
        let panel = glGame.panel.showChildPanel(this.prefab_serviceQQ, this.content, 1);
        panel.scale = 0.8;
        let script = panel.getComponent(panel.name);
        script.refPayData();

        console.log("vip panel qqlist", this.qqlist);
        script.setShopService(true, this.qqlist);
    },

    click_wechat() {
        this.content.removeAllChildren();
        let panel = glGame.panel.showChildPanel(this.prefab_serviceWX, this.content, 1);
        panel.scale = 0.8;
        let script = panel.getComponent(panel.name);
        script.refPayData();
        console.log("vip panel wxlist", this.wxlist);
        script.setShopService(true, this.wxlist);
    },

    set(key, value) {
        this[key] = value;
    },

    get(key) {
        return this[key];
    },

    OnDestroy() {
    },
    // update (dt) {},
});

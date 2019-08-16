
glGame.baseclass.extend({

    properties: {
        node_item: cc.Node,
        node_content: cc.Node,
    },

    onLoad() {
        this.registerEvent();
        this.isShop = false;
        this.node.active = false;
    },

    refPayData() {
        this.node.active = true;
        glGame.user.reqCustomServer(1, 1, true);
    },

    setShopService(isShop, serviceData) {
        this.isShop = isShop;
        this.serviceData = serviceData;
    },

    registerEvent() {
        glGame.emitter.on("updateCustomServer", this.customData, this);
    },
    unRegisterEvent() {
        glGame.emitter.off("updateCustomServer", this);
    },
    onClick(name, node) {
        for (let i = 0; i < this.qqInfoList.length; i++) {
            if (name == `jump${i}`) {
                let toQQUrl =  this.qqInfoList[i].url;
                cc.sys.openURL(toQQUrl)
            }
            if (name == `copy${i}`) {
                let qqNumber = this.qqInfoList[i].contact
                glGame.platform.copyToClip(qqNumber, '');
            }
        }
        switch (name) {
            case '': ; break;
            case '': ; break;

        }
    },

    customData() {
        this.severice = glGame.user.get("customSever").result;
        console.log('客服信息111qq', this.severice)
        this.initQQInfo()
    },
    initQQInfo() {
        if (this.severice.page > 1) return;
        this.qqInfoList = this.isShop ? this.serviceData : this.severice.server.qq;
        if (!this.qqInfoList) return;
        for (let i = 0; i < this.qqInfoList.length; i++) {
            let item = cc.instantiate(this.node_item);
            item.parent = this.node_content;
            if (this.qqInfoList[i].avatar) glGame.panel.showRemoteImage(item.getChildByName('mask').getChildByName('head'), this.qqInfoList[i].avatar)
            //item.getChildByName('mask').getChildByName('head').getComponent(cc.Sprite).spriteFrame = //qqlist[i].avatar;
            item.getChildByName('name').getComponent(cc.Label).string = this.qqInfoList[i].name;
            item.getChildByName('jumptoQQ').name = `jump${i}`
            item.getChildByName('copy').name = `copy${i}`
            item.active = true;
        }
    },


    start() {

    },

    set(key, value) {
        this[key] = value;
    },

    get(key) {
        return this[key];
    },
    OnDestroy() {
        this.unRegisterEvent();
    },
    // update (dt) {},
});

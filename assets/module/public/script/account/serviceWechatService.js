
glGame.baseclass.extend({

    properties: {
        node_item: cc.Node,
        node_content: cc.Node,
    },

    onLoad() {
        this.registerEvent()
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
        for (let i = 0; i < this.weChatInfoList.length; i++) {
            if (name == `jumpWechat${i}`) {
                let toWeChatUrl =  this.weChatInfoList[i].url;
                cc.sys.openURL(toWeChatUrl)
            }
            if (name == `head${i}`) {
                this.wechatCode = this.weChatInfoList[i].avatar
                glGame.emitter.emit("showWechatCode", { url: this.wechatCode });
            }
            if (name == `copy${i}`) {
                let wechatNumber = this.weChatInfoList[i].contact
                glGame.platform.copyToClip(wechatNumber, '');
            }
        }
        switch (name) {
            case '': ; break;
            //case 'code':glGame.emitter.emit("showWechatCode", {url:'http://www.baidu.com'});;break;

        }
    },

    customData() {
        this.severice = glGame.user.get("customSever").result;
        console.log('客服信息111wechat', this.severice)
        this.initItem();
    },
    initItem() {
        if (this.severice.page > 1) return;
        this.weChatInfoList = this.isShop ? this.serviceData : this.severice.server.wechat;
        let weChatlist = this.weChatInfoList;
        if (!weChatlist) return;
        this.node_content.destroyAllChildren();
        this.node_content.removeAllChildren();
        for (let i = 0; i < weChatlist.length; i++) {
            let item = cc.instantiate(this.node_item);
            item.parent = this.node_content;
            // item.children[1].getComponent(cc.Sprite).spriteFrame = weChatlist[i].headUrl;
            if (weChatlist[i].avatar) glGame.panel.showRemoteImage(item.getChildByName('code'), weChatlist[i].avatar)
            item.getChildByName('name').getComponent(cc.Label).string = weChatlist[i].name;
            item.getChildByName("jumptoWechat").name = `jumpWechat${i}`
            item.getChildByName("code").name = `head${i}`
            item.getChildByName("copy").name = `copy${i}`
            //this.setQRCode(item.children[1],weChatlist[i].url)
            item.active = true;
        }
    },
    //====================小二维码生成
    // setQRCode(node,codeUrl) {
    //     this.initCode(node);
    // },
    setQRCode(node, codeUrl) {
        var qrcode = new QRCode(-1, QRErrorCorrectLevel.H);
        qrcode.addData(codeUrl);
        qrcode.make();

        var ctx = node.getComponent(cc.Graphics);

        // compute tileW/tileH based on node width and height
        var tileW = node.width / qrcode.getModuleCount();
        var tileH = node.height / qrcode.getModuleCount();

        // draw in the Graphics
        for (var row = 0; row < qrcode.getModuleCount(); row++) {
            for (var col = 0; col < qrcode.getModuleCount(); col++) {
                if (qrcode.isDark(row, col)) {
                    ctx.fillColor = cc.Color.BLACK;
                } else {
                    ctx.fillColor = cc.Color.WHITE;
                }
                var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
                var h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
                ctx.rect(Math.round(col * tileW), Math.round(row * tileH), w, h);
                ctx.fill();
            }
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

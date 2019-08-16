glGame.baseclass.extend({
    properties: {
        bg: cc.Node,
        emailtip: cc.Node,          // 邮件红点
        acctivittip: cc.Node,       // 活动红点
        yuebaotip: cc.Node,         // 余额宝红点
        poputip: cc.Node,           // 推广红点
    },

    onLoad() {
        this.registerEvent();
        this.initUI();
    },
    initUI() {
        let windowsWidth = cc.winSize.width;
        //图标的适配    1280*102    left = 85 spacingX = 61  下面1.5别问，问就是1.5黄金比例
        let layout = this.bg.getComponent(cc.Layout);
        layout.paddingLeft = 85 / 1280 * windowsWidth
        layout.spacingX = (windowsWidth - 380 - (85 / 1280 * windowsWidth * 1.5)) / 13;

        //exists：是否充值过，1为充值过，0为未充值过
        this.userRecharge = glGame.user.get("userRecharge");
        if (this.userRecharge.exists == 0) {
            //首冲
        } else {
            //商城
        }

    },
    refreshUi() {
        this.initUI();
    },
    // 注册界面监听事件
    registerEvent() {
        glGame.emitter.on("gl.sceneUi", this.refreshUi, this);
        glGame.emitter.on("ReqRedDot", this.reqRedDot, this);
    },
    // 销毁界面监听事件
    unRegisterEvent() {
        glGame.emitter.off("gl.sceneUi", this);
        glGame.emitter.off("ReqRedDot", this);
    },
    reqRedDot(data){
        this.emailtip.active = data['mailReq'] == 1 || data['mailCapitalReq'] == 1;
        this.poputip.active = data['extensionReq'] == 1;
        this.yuebaotip.active = data['payingReq'] == 1 ;
        this.acctivittip.active = data['discountReq'].length !=0;    //公告的
    },

    OnDestroy() {
        this.unRegisterEvent();
    },
    // 重写父类按钮点击事件
    onClick(name, node) {
        switch (name) {
            case "email": this.click_email(); break;
            case "service": this.click_service(); break;
            case "exchange": this.click_exchange(); break;
            case "withdraw": this.click_exchange(); break;
            case "bank": this.click_bank(); break;
            case "shop": this.click_shop(); break;
            case "set": this.click_set(); break;
            case "acctivit": this.click_acctivit(); break;
            case "yuebao": this.click_yuebao(); break;
            case "btn_popu": this.click_popu(); break;
            default: console.error("no find button name -> %s", name);
        }
    },
    click_eyubao() {

    },
    click_popu() {
        if(glGame.panel.showSuspicious("receive_promotion_award")){
            return;
        }
        glGame.panel.showPanelByName("popularize");
    },
    click_acctivit() {
        if(glGame.panel.showSuspicious("receive_discount")){
            return;
        }
        glGame.panel.showPanelByName("announcement");
    },
    click_set() {
        glGame.panel.showSetting(false);
    },
    click_email() {
        if (glGame.user.isTourist()) {
            glGame.panel.showRegisteredGift(true);
            return;
        }
        glGame.panel.showPanelByName("email");
    },
    click_service() {
        glGame.panel.showService();
    },
    click_exchange() {
        if (glGame.user.isTourist()) {
            glGame.panel.showRegisteredGift(true);
            return;
        }
        if(glGame.panel.showSuspicious("withdraw")){
            return;
        }
        //glGame.panel.showPanelByName("exchangeType");
        glGame.panel.showPanelByName("withdrawal")
    },
    click_bank() {
        if (glGame.user.isTourist()) {
            glGame.panel.showRegisteredGift(true);
            return;
        }
        glGame.panel.showPanelByName("bank")
    },
    click_shop() {
        if(glGame.panel.showSuspicious("recharge")){
            return;
        }
        glGame.panel.showShop();
    },
    click_yuebao() {
        
        glGame.panel.showPanelByName('yubao');
    },

});

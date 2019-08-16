glGame.baseclass.extend({
    properties: {
        alipay_ID: cc.EditBox,          // 支付宝绑定账号
        alipay_Name: cc.EditBox,        // 支付宝绑定名字
        bank_cardID: cc.EditBox,        // 银行卡绑定账号
        bank_cardName: cc.EditBox,      // 银行卡绑定名字
        bank_catdType:cc.EditBox,
        bankcard: cc.Node,              // 隐藏绑定银行卡界面
        alipay: cc.Node,                // 绑定支付宝界面
    },
    onLoad () {
        this.registerEvent();
    },
    resetData () {
        this.bankInfoList = null;
    },
    registerEvent () {
        glGame.emitter.on("updateUserData", this.bindSuccess, this);
    },
    unRegisterEvent () {
        glGame.emitter.off("updateUserData", this);
    },
    OnDestroy () {
        this.unRegisterEvent();
    },
    bindSuccess () {
        if(this["isshowExchange"]){
            this.showExchangePanel(this["showModel"]);
        }
        glGame.emitter.emit("resetDrawalPanel");
        this.remove();
    },
    initUI () {
        switch (this["showModel"]) {
            case glGame.pay.BANKCARD: this.showBindBankCard(); break;
            case glGame.pay.ALIPAY: this.showBindAliPay(); break;
            default: console.error("The showModel is not exist");
        }
    },
    showBindBankCard () {
        this.bankcard.active = true;
        this.alipay.active = false;
    },
    showBindAliPay () {
        this.bankcard.active = false;
        this.alipay.active = true;
    },
    onClick (name, node) {
        switch (name) {
            case "close":
                glGame.emitter.emit("resetDrawalPanel");
                this.remove();
                break;
            case "confirm": this.click_confirm(); break;
            case "ascription":
            case "downbox": this.click_downbox(); break;
            case "last":
                glGame.emitter.emit("resetDrawalPanel");
                this.remove()
                break;
            default: console.error("no find button name -> %s", name);
        }
    },
    checkBankCardNum(){
        let bankcardID = this.bank_cardID.string;
        if (!bankcardID) return glGame.panel.showErrorTip(glGame.tips.USER.BIND.BANKCARDNULL);
        if (bankcardID.length < 10) return glGame.panel.showErrorTip(glGame.tips.USER.BIND.BANKFORGERY);
        if (!/^[0-9]*$/.test(bankcardID)) return glGame.panel.showErrorTip(glGame.tips.USER.BIND.BANKCARDTYPEERR);
    },
    checkName() {
        if (this["showModel"] == glGame.pay.BANKCARD) {
            let bankcardName = this.bank_cardName.string;
            if (!bankcardName || !/^[\u4e00-\u9fa5]{2,8}$/.test(bankcardName)) return glGame.panel.showErrorTip(glGame.tips.USER.BIND.BANKCARDHOLDERERR);
        }
    },
    click_confirm () {
        switch (this["showModel"]) {
            case glGame.pay.BANKCARD:
                let bankcardID = this.bank_cardID.string;
                if (!bankcardID) return glGame.panel.showErrorTip(glGame.tips.USER.BIND.BANKCARDNULL);
                if (bankcardID.length<10) return glGame.panel.showErrorTip(glGame.tips.USER.BIND.BANKFORGERY);
                if (!/^[0-9]*$/.test(bankcardID)) return glGame.panel.showErrorTip(glGame.tips.USER.BIND.BANKCARDTYPEERR);
                let bankcardName = this.bank_cardName.string;
                if (!bankcardName || !/^[\u4e00-\u9fa5]{2,8}$/.test(bankcardName)) return glGame.panel.showErrorTip(glGame.tips.USER.BIND.BANKCARDHOLDERERR);
                let bankType = this.bank_catdType.string;
                if (!bankType) return glGame.panel.showErrorTip(glGame.tips.USER.BIND.BANKTYPEERR);
                glGame.user.reqBindBank(bankType, bankcardID, bankcardName);
                break;
            case glGame.pay.ALIPAY:
                let alipayID = this.alipay_ID.string;
                if (!alipayID) return glGame.panel.showErrorTip(glGame.tips.USER.BIND.ALPIDNULL);
                if (!/\w$/.test(alipayID)) return glGame.panel.showErrorTip(glGame.tips.USER.BIND.ALPIDTYPEERR);
                let alipayName = this.alipay_Name.string;
                if (!alipayName) return glGame.panel.showErrorTip(glGame.tips.USER.BIND.ALPHOLDERERR);
                glGame.user.reqBindAlipay(alipayID, alipayName);
                break;
            default:
            console.error("未知的支付绑定类型")
            return;
        }
    },
    showExchangePanel (modelType) {
        glGame.panel.showPanelByName("exchange").then(panel => {
            let script = panel.getComponent(panel.name);
            script.set("showModel", modelType);
            script.initUI();
            glGame.user.reqMyInfo();
        });
    },
    click_downbox () {
        this.banklist.active = !this.banklist.active;
    },
    set (key, value) {
        this[key] = value;
    }
});

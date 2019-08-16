let screenshot = require('ScreenShot')
glGame.baseclass.extend({

    properties: {
        contentPanel: cc.Node,
        scrollViewPanel: cc.Node,
        payCountList: cc.Node,
        payNumEditBox: cc.EditBox,

        coinLab: cc.Label,
        infoLab: cc.Label,
        wechatName: cc.EditBox,
        order: cc.EditBox,
        vrCode: cc.Node,
    },

    onLoad() {
        this.payData = null;
    },


    refPayData(payKey) {
        let shopData = glGame.user.ShopData;
        for (let key in shopData) {
            if (key == payKey) {
                this.payData = shopData[key];
            }
        }
        if (!this.payData) {
            this.contentPanel.active = false;
            this.scrollViewPanel.active = false;
            return;
        }
        this.account_code = this.payData.account_code;
        this.account_name = this.payData.account_name;
        this.account_id = this.payData.account_id;
        this.link = this.payData.link;
        this.goods = this.payData.goods;
        this.type = this.payData.type;
        this.id = this.payData.id;
        this.jump_url = this.payData.jump_url;
        this.payNumEditBox.placeholder = this.payData.pay_min.div(100) + ' ~ ' + this.payData.pay_max.div(100);
        this.updateCountBtnList();
        this.initUI();
    },

    initUI() {
        this.payNumEditBox.string = "";
        this.wechatName.string = "";
        this.order.string = "";
        this.contentPanel.active = true;
        this.scrollViewPanel.active = false;
    },

    updateCountBtnList() {
        this.contentPanel.acitve = true;
        this.scrollViewPanel.active = false;
        let countNodes = this.payCountList.children;

        if (!this.goods || this.goods.length == 0) {
            for (let i = 0; i < countNodes.length; i++) {
                countNodes.active = false;
            }
            return
        }
        for (let i = 0; i < countNodes.length; i++) {
            if (!this.goods[i]) {
                countNodes[i].active = false;
                continue;
            }
            countNodes[i].getChildByName('numlab').getComponent(cc.Label).string = Number(this.goods[i].goods_price).div(100);
        }
    },

    initQRCode() {
        glGame.panel.showRemoteImage(this.vrCode, this.account_code);
    },

    onClick(name, node) {
        if (glGame.user.isTourist()) {
            glGame.panel.showRegisteredGift(true);
            return;
        }
        switch (name) {
            case 'commit':
                this.commitCB();
                break;
            case 'back':
                this.backCB();
                break;
            case 'clear':
                this.clearCB();
                break;
            case 'count1':
                this.chooseNumCB(0);
                break;
            case 'count2':
                this.chooseNumCB(1);
                break;
            case 'count3':
                this.chooseNumCB(2);
                break;
            case 'count4':
                this.chooseNumCB(3);
                break;
            case 'count5':
                this.chooseNumCB(4);
                break;
            case 'count6':
                this.chooseNumCB(5);
                break;
            case 'count7':
                this.chooseNumCB(6);
                break;
            case 'count8':
                this.chooseNumCB(7);
                break;
            case 'count9':
                this.chooseNumCB(8);
                break;
            case 'count10':
                this.chooseNumCB(9);
                break;
            case 'save':
                this.saveCodeToLocal();
                break;
            case 'openApp':
                this.openApp();
                break;
            case 'commit2':
                this.commitEnd();
                break;
        }
    },

    backCB() {
        this.scrollViewPanel.active = false;
        this.contentPanel.active = true;
    },

    commitCB() {
        this.num = Number(this.payNumEditBox.string);
        console.log("获取到输入框的数据", this.num);
        if (!this.num) {
            glGame.panel.showErrorTip("请输入充值金额！")
            return;
        }
        if (Number(this.num) < this.payData.pay_min.div(100) || Number(this.num) > this.payData.pay_max.div(100)) {
            glGame.panel.showErrorTip("充值区间错误")
            return;
        }

        if (this.type == 1) {
            this.initQRCode();
            console.log("打开支付宝电子支付的界面")
            this.contentPanel.active = false;
            this.scrollViewPanel.active = true;
            this.infoLab.string = `个人信息：${this.account_name}`;
            this.coinLab.string = `${this.num} 元`
        } else if (this.type == 2) {
            let url = `${this.link}${this.num}`;
            cc.sys.openURL(url);
        }
    },

    clearCB() {
        this.payNumEditBox.string = '';
        console.log("清除数据框的数据")
    },

    chooseNumCB(index) {
        console.log("将数据存入输入框", this.goods[index].goods_price)
        this.payNumEditBox.string = Number(this.goods[index].goods_price).div(100);
    },

    saveCodeToLocal() {
        console.log("保存本地")
        if (cc.sys.isNative) {
            glGame.platform.saveToLocal(this.account_code);
        } else {
            glGame.emitter.emit("saveCodeToLocalShop", this.account_code);
        }
    },

    openApp() {
        console.log("马上前往")
        glGame.panel.showMsgBox("提示", `              金   额：${this.num}元\n              手续费：免手续费`, () => {
            console.log("打开app")
            if (cc.sys.isNative) {
                glGame.platform.jumpToApp(this.jump_url);
            }else{
                cc.sys.openURL(this.jump_url)
            }
        })
    },

    commitEnd() {
        let wechatName = this.wechatName.string;
        let orderNum = this.order.string;
        if (!wechatName || !orderNum) {
            return glGame.panel.showErrorTip("请输入完整信息")
        }
        if (orderNum.length != 5) {
            return glGame.panel.showErrorTip("请输入您转账的商户订单号后五位数")
        }
        let data = {};
        data.type = this.type;
        data.mid = this.id;
        data.money = Number(this.num).mul(100);
        data.accounts = wechatName;
        data.order = orderNum;
        console.log("提交的数据", data)
        glGame.gameNet.send_msg("http.ReqPay", data, (route, msg) => {
            console.log("支付提交的返回数据", msg)
            //glGame.panel.showMsgBox("提示", "提交完成")
            glGame.emitter.emit("showSuccessAnim")
            glGame.user.reqReqCheckOrder();
        })
        console.log("最终提交", wechatName, orderNum)
    },

    start() {

    },

    set(key, value) {
        this[key] = value;
    },

    get(key) {
        return this[key];
    },

    // update (dt) {},
});

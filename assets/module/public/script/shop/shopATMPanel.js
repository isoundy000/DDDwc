glGame.baseclass.extend({

    properties: {
        payCountList: cc.Node,
        payNumEditBox: cc.EditBox,
        resetManEditBox: cc.EditBox,
        resetBankEditBox: cc.EditBox,
        orderEditBox: cc.EditBox,

        maimPanel: cc.Node,

        lab_bank: cc.Label,
        label_name: cc.Label,
        label_acc: cc.Label,
        lab_coin: cc.Label,

        content: cc.Node,
        reset: cc.Node,
    },

    onLoad() {

    },

    refPayData(payKey) {
        let shopData = glGame.user.get("ShopData");
        let payData;
        for (let key in shopData) {
            if (key == payKey) {
                payData = shopData[key];
                break;
            }
        }
        if (!payData) {
            this.mainPanel.active = false;
            this.node_tip.active = true;
            return;
        }

        this.account_id = payData.account_id;     //账号
        this.account_bank = payData.account_bank;   //银行名字
        this.account_name = payData.account_name;   //用户名
        this.sub_type_desc = payData.sub_type_desc  //充值方式
        this.goods = payData.goods;                 //商品
        this.type = payData.type;                   //类型
        this.id = payData.id;
        this.link = payData.link;
        this.payNumEditBox.placeholder = payData.pay_min.div(100) + ' ~ ' + payData.pay_max.div(100);
        this.updateCountBtnList();
        this.setAccandName();
        this.minGoodPrice = payData.pay_min.div(100);
        this.maxGoodPrice = payData.pay_max.div(100);
        this.initUI();
    },

    initUI() {
        this.payNumEditBox.string = "";
        this.resetManEditBox.string = "";
        this.resetBankEditBox.string = "";
        this.orderEditBox.string = "";

        this.content.active = true;
        this.reset.active = false;
    },

    updateCountBtnList() {
        let countNodes = this.payCountList.children;
        if (!this.goods || this.goods.length == 0) {
            for (let i = 0; i < countNodes.length; i++) {
                countNodes[i].active = false;
            }
            return;
        }
        for (let i = 0; i < countNodes.length; i++) {
            if (this.goods[i]) {
                countNodes[i].getChildByName('numlab').getComponent(cc.Label).string = Number(this.goods[i].goods_price).div(100);
                countNodes[i].active = true;
            } else {
                break;
            }
        }
    },

    //设置左边信息
    setAccandName() {
        this.lab_bank.string = this.account_bank;
        this.label_acc.string = this.account_id;
        this.label_name.string = this.account_name;
    },

    setResetMan() {
        this.resetManName = this.resetManEditBox.string;
    },
    setBankName() {
        this.resetBankName = this.resetBankEditBox.string;
    },
    setOrder() {
        this.order = this.orderEditBox.string;
    },
    copy(node, tipStr) {
        let str = node.parent.getChildByName("label").getComponent(cc.Label).string;
        glGame.platform.copyToClip(str, tipStr);
    },
    onClick(name, node) {
        if (glGame.user.isTourist()) {
            glGame.panel.showRegisteredGift(true);
            return;
        }
        switch (name) {
            case 'btn_acccopy': this.copy(node, "账号"); break;
            case 'btn_namecopy': this.copy(node, "名字"); break;
            case 'commit':
                this.maincommitCB();
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
            case 'reset_submit':
                this.reset_submitCB();
                break;
        }
    },
    backCB() {
        this.content.active = true;
        this.reset.active = false;
    },

    reset_submitCB() {
        if (!this.resetManName || this.resetManName == "") {
            glGame.panel.showErrorTip("请输入账号对应的姓名");
            return;
        }
        if (!this.resetBankName || this.resetBankName == "") {
            glGame.panel.showErrorTip("请输入存款银行");
            return;
        }
        if (this.order.length != 4) {
            glGame.panel.showErrorTip("请输入卡号后四位");
            return;
        }

        let data = {};
        data.type = this.type;
        data.mid = this.id;
        data.money = Number(this.Money).mul(100);            //充值金额
        data.accounts = this.resetManName;                  //充值人名字
        data.bank_name = this.resetBankName                 //充值银行
        data.order = this.order;                            //卡号后四位
        console.log("提交的数据", data)
        glGame.gameNet.send_msg("http.ReqPay", data, (route, msg) => {
            console.log("支付提交的返回数据", msg)
            glGame.emitter.emit("showSuccessAnim")
            glGame.user.reqReqCheckOrder();
        })
    },
    maincommitCB() {
        this.Money = Number(this.payNumEditBox.string);
        console.log("获取到输入框的数据", this.Money);
        if (!this.Money || this.Money == "") {
            return glGame.panel.showErrorTip("请输入充值金额");
        }
        if (this.Money > this.maxGoodPrice || this.Money < this.minGoodPrice) {
            return glGame.panel.showErrorTip("充值区间错误");
        }
        if (this.type == 1) {
            this.content.active = false;
            this.reset.active = true;
            this.lab_coin.string = `${this.Money} 元`
        } else if (this.type == 2) {
            let url = `${this.link}${this.Money}`;
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

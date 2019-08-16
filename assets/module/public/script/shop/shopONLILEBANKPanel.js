const RESETTYPE =
{
    1: "柜员机现金充值",
    2: "柜员机转账",
    3: "银行柜台充值",
}
glGame.baseclass.extend({

    properties: {
        payCountList: cc.Node,
        payNumEditBox: cc.EditBox,
        resetManEditBox: cc.EditBox,
        resetPlaceEditBox: cc.EditBox,

        maimPanel: cc.Node,

        lab_bank: cc.Label,
        label_name: cc.Label,
        label_acc: cc.Label,
        lab_type: cc.Label,
        lab_coin:cc.Label,

        content: cc.Node,
        reset: cc.Node,
    },

    onLoad() {
        this.node.active = false;
        this.resetType = 1;
        // this.refPayData(shopData);
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
            this.closeFunc();
            this.mainPanel.active = false;
            this.node_tip.active = true;
            return;
        }

        this.account_code = payData.account_id;   //账号
        this.account_name = payData.account_name;   //用户名
        this.goods = payData.goods;                 //商品
        this.type = payData.type;                   //类型
        this.name = payData.name;                   //标题
        this.id = payData.id;
        this.payNumEditBox.placeholder = payData.pay_min.div(100) + ' ~ ' + payData.pay_max.div(100);
        this.updateCountBtnList();
        this.closeFunc();
        this.setAccandName();
        this.minGoodPrice = payData.pay_min.div(100);
        this.maxGoodPrice = payData.pay_max.div(100);
    },

    updateCountBtnList() {
        let countNodes = this.payCountList.children;
        for (let i = 0; i < countNodes.length; i++) {
            if (this.goods[i]) {
                countNodes[i].getChildByName('numlab').getComponent(cc.Label).string = Number(this.goods[i].goods_price).div(100);
                countNodes[i].active = true;
            } else {
                break;
            }
        }
    },
    closeFunc() {
        if (this.PanelTag == this.closePanelTag) {
            this.node.active = true;
            return;
        }
        glGame.panel.closeChildPanel(this.closePanelTag, this.node.parent);
        this.node.active = true;
    },

    //设置左边信息
    setAccandName() {
        this.lab_bank.string = this.name;
        this.label_acc.string = this.account_code;
        this.label_name.string =  this.account_name;
        this.lab_type.string = RESETTYPE[this.type];
    },

    setResetMan() {
        this.resetManName = this.resetManEditBox.string;
    },
    setResetPlace() {
        this.resetPlace = this.resetPlaceEditBox.string;
    },
    setResetType0() {
        this.resetType = 1          //柜员机现金转账
        cc.log("点击了0")
    },
    setResetType1() {
        this.resetType = 2          //柜员机转账
    },
    setResetType2() {
        this.resetType = 3           //银行柜台转账
    },
    copy(node, tipStr) {
        let str = node.parent.getChildByName("label").string
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
            case 'main_commit':
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
        if (!this.resetPlace || this.resetPlace == "") {
            glGame.panel.showErrorTip("请输入充值地点");
            return;
        }
        let data = {};
        data.type = this.type;
        data.mid = this.id;
        data.money = Number(this.Money).mul(100);            //充值金额
        data.accounts = this.resetManName;  //充值人名字
        data.bank_type = this.resetType;     //充值类型
        data.bank_addr = this.resetPlace;     //充值地点
        console.log("提交的数据", data)
        glGame.gameNet.send_msg("http.ReqPay", data, (route, msg) => {
            console.log("支付提交的返回数据", msg)
            //glGame.panel.showMsgBox("提示", "提交完成")
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
        this.content.active = false;
        this.reset.active = true;
        this.lab_coin.string = `${this.Money} 元`
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

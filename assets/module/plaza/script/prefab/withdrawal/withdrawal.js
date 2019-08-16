glGame.baseclass.extend({

    properties: {
        //widgetNode
        leftNode: cc.Node,
        midNode: cc.Node,
        //bank
        edbNumBank: cc.EditBox,
        labAccount: cc.Label,
        labCurCoin: cc.Label,
        labTipNode: cc.RichText,
        confirmDrawBtn: cc.Button,
        bindBankBtn: cc.Node,
        drawToLab: cc.Label,
        drawIcon: cc.Sprite,
        iconSprite: [cc.SpriteFrame],

        //drawalMgr
        labBankName: cc.Label,
        labBankAccount: cc.Label,
        labName: cc.Label,
        labAliAccount: cc.Label,
        labAccountName: cc.Label,
        bankBindBtn: cc.Node,
        bankUnbindBtn: cc.Node,
        aliBindBtn: cc.Node,
        aliUnbindBtn: cc.Node,
        feeNum: cc.Node,

        aliBindState: cc.Node,
        bankBindState: cc.Node,

        bankPanel: cc.Node,
        aliPanel: cc.Node,
        accountPanel: cc.Node,
        drawalMgrPanel: cc.Node,

        //account
        acc_recordTitle: cc.Node,
        acc_detailTitle: cc.Node,
        acc_recordLine: cc.Node,
        acc_detailLine: cc.Node,
        acc_recordItem: cc.Node,
        acc_detailItem: cc.Node,
        acc_content: cc.Node,
        acc_tip: cc.Node,
        acc_toggleRecord: cc.Toggle,
        acc_toggleDetail: cc.Toggle,
        acc_scrollView: cc.Node,

        grayCommitBtn: [cc.SpriteFrame],

        btnStrFrame: [cc.SpriteFrame],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.registerScrollEvent();

        this.index = 1;
        this.drawtype = 2; //1为支付宝，2为银行卡 默认为取现到银行卡
        this.switchPanel("bank");
        this.fitIphoneX();
        this.registerEvent();
        glGame.user.reqMyInfo();
    },

    fitIphoneX() {
        if (isiPhoneX) {
            let leftWidgetCom = this.leftNode.getComponent(cc.Widget),
                midWidgetCom = this.midNode.getComponent(cc.Widget);
            midWidgetCom.left += 35;
            leftWidgetCom.left += 35;
            midWidgetCom.updateAlignment();
            leftWidgetCom.updateAlignment();
        }
    },

    registerEvent() {
        glGame.emitter.on("resetDrawalPanel", this.resetDrawalPanel, this);
        glGame.emitter.on("updateUserData", this.updateUserData, this);
    },

    unRegisterEvent() {
        glGame.emitter.off("resetDrawalPanel", this);
        glGame.emitter.off("updateUserData", this);
    },

    updateUserData() {
        this.labCurCoin.string = this.cutFloat(glGame.user.get("coin"));
    },

    hideAllPanel() {
        this.bankPanel.active = false;
        this.aliPanel.active = false;
        this.accountPanel.active = false;
        this.drawalMgrPanel.active = false;
        if (this.drawalMgrPanel.getChildByName("bindpay")) {
            this.drawalMgrPanel.getChildByName('basePanel').active = true;
            this.drawalMgrPanel.getChildByName("bindpay").removeFromParent();
        }
    },

    switchPanel(name) {
        console.log("切换到->", name)
        this.hideAllPanel();
        let funcName = name == 'ali' ? 'bank' : name;
        this[funcName + "Panel"].active = true;
        let funStr = "this.refresh" + name + "()";
        eval(funStr);
    },

    reqDrawCoin() {
        glGame.gameNet.send_msg("http.ReqWithdrawCoin", null, (route, data) => {
            this.unit = data.unit;
            this.fee = data.fee;
            this.coin = data.coin;
            this.type = data.type;
            this.start = data.withdraw_deposit_start
            this.end = data.withdraw_deposit_end
            console.log('最多换多少钱。。', data)
            // 0.00~0.00（显示：当前无法兑换）
            // 0~500.00（显示：0~500）
            if (this.coin >= this.unit) {
                this.confirmDrawBtn.node.getComponent(cc.Sprite).spriteFrame = this.grayCommitBtn[0];
                this.confirmDrawBtn.node.children[0].active = true;
                if (this.coin == 0) {
                    this.confirmDrawBtn.node.getComponent(cc.Sprite).spriteFrame = this.grayCommitBtn[1];
                    this.confirmDrawBtn.node.children[0].active = false;
                    this.edbNumBank.placeholder = "当前无法提现";
                } else {
                    let start = this.unit > this.start ? this.unit : this.start;
                    // let end = this.coin <= this.end ? Number(this.coin).sub(this.coin % this.unit) : Number(this.end).sub(this.end % this.unit);
                    let end = this.end;
                    this.edbNumBank.placeholder = `  ${this.cutFloat(start)}~${this.cutFloat(end)}`;
                }
            } else {
                this.confirmDrawBtn.node.getComponent(cc.Sprite).spriteFrame = this.grayCommitBtn[1];
                this.confirmDrawBtn.node.children[0].active = false;
                this.edbNumBank.placeholder = '当前无法提现';
            }

            this.labCurCoin.string = this.cutFloat(glGame.user.get("coin"));
            //免手续费
            let content1 = `<color=#FFFFFF>只支持 </c><color=#00ff00>${this.cutFloat(this.unit)}</c><color=#FFFFFF> 的倍数,</color><color=#FFFFFF>免手续费</c>`;
            //收手续费
            let str;
            str = this.type == 1 ? `${this.cutFloat(this.fee)}` : `${this.cutFloat(this.fee)}%`
            let content2 = `<color=#999999>当前可提现金额:</c><color=#FFD488>${this.cutFloat(this.coin)}元</c><color=#999999>,只支持 </c><color=#FFD488>${this.cutFloat(this.unit)}</c><color=#999999> 的倍数,且收取 </c><color=#FFD488>${str}</color><color=#999999> 手续费</c>`;
            this.labTipNode.string = this.type == 3 ? content1 : content2;

            let accountStr = this.index == 2 ? glGame.user.get("alipayAcc") : glGame.user.get("bankCardNum");
            console.log("账号账号账号", accountStr);
            if (accountStr) {
                this.labAccount.string = accountStr.replace(accountStr.substring(3, 7), "****");
                this.bindBankBtn.active = false;
            } else {
                this.labAccount.string = this.index == 2 ? "您暂未绑定支付宝，请前往绑定" : "您暂未绑定银行卡，请前往绑定";
                this.confirmDrawBtn.node.getComponent(cc.Sprite).spriteFrame = this.grayCommitBtn[1];
                this.confirmDrawBtn.node.children[0].active = false;
                this.bindBankBtn.active = true;
            }
        })
    },

    refreshBankOrAli() {
        let drawToStr = ["提现到支付宝", "提现到银行卡"];
        this.drawToLab.string = drawToStr[this.drawtype - 1];
        this.bindBankBtn.getChildByName("Label").getComponent(cc.Sprite).spriteFrame = this.btnStrFrame[this.drawtype - 1];
        this.drawIcon.spriteFrame = this.iconSprite[this.drawtype - 1];
    },

    edbNumBankInputChanged() {
        console.log("textChanged")
        if (this.type == 2) {
            this.feeNum.children[2].getComponent(cc.Label).string = this.cutFloat(Number(this.edbNumBank.string) * (Number(this.fee).div(100))) + "元";
        } else if (this.type == 1) {
            this.feeNum.children[2].getComponent(cc.Label).string = "" + this.cutFloat(this.fee) + "元";
        } else {
            this.feeNum.children[2].getComponent(cc.Label).string = 0;
        }
    },

    edbNumBankInputEnd() {
        this.confirmDrawCB(true);
    },

    refreshbank() {
        console.log("bank bank bank")
        this.drawtype = 2;
        this.reqDrawCoin();
        this.refreshBankOrAli();
    },

    refreshali() {
        console.log("ali ali ali")
        this.drawtype = 1;
        this.reqDrawCoin();
        this.refreshBankOrAli();
    },

    refreshaccount() {
        console.log("account account account")
        this.changeState(this.acc_toggleRecord.isChecked)
        this.drawAccContentPageIndex = 1
        if (this.acc_toggleRecord.isChecked) {
            this.accrecord_cb(true);
        } else {
            this.accdetail_cb(true);
        }
    },

    refreshdrawalMgr() {
        console.log("drawalMgr drawalMgr drawalMgr")
        console.log("支付宝账号", glGame.user.get("alipayAcc"), glGame.user.get('alipayName'))
        if (glGame.user.get('alipayAcc') && glGame.user.get('alipayName')) {
            let alipayAccstr = glGame.user.get('alipayAcc')
            this.labAliAccount.string = alipayAccstr.replace(alipayAccstr.substring(3, 7), "****");
            this.labAliAccount.node.parent.active = true;
            this.labAccountName.string = glGame.user.get('alipayName');
            this.labAccountName.node.parent.active = true;
        } else {
            this.labAliAccount.node.parent.active = false;
            this.labAccountName.node.parent.active = false;
        }
        this.aliUnbindBtn.active = !!glGame.user.get('alipayAcc');
        this.aliBindBtn.active = !this.aliUnbindBtn.active;
        this.aliBindState.active = this.aliBindBtn.active;
        console.log("银行账号", glGame.user.get("bankCardNum"))
        if (glGame.user.get('bankCardNum')) {
            let BankAccountstr = glGame.user.get('bankCardNum')
            this.labBankAccount.string = BankAccountstr.replace(BankAccountstr.substring(3, 7), "****");
            this.labBankAccount.node.parent.active = true;
            this.labBankName.string = glGame.user.get('bankCardType');
            this.labBankName.node.parent.active = true;
            this.labName.string = glGame.user.get('bankCardName');
            this.labName.node.parent.active = true;
        } else {
            this.labBankAccount.node.parent.active = false;
            this.labBankName.node.parent.active = false;
            this.labName.node.parent.active = false;
        }
        this.bankUnbindBtn.active = !!glGame.user.get('bankCardNum');
        this.bankBindBtn.active = !this.bankUnbindBtn.active;
        this.bankBindState.active = this.bankBindBtn.active;
    },

    clearBankNum() {
        this.edbNumBank.string = "";
    },

    initDrawRecord() {
        glGame.panel.showPanelByName("exchangerecord").then(panel => {
            let script = panel.getComponent(panel.name);
            script.set("showModel", this.drawtype);
            script.initUI();
        });
    },

    confirmDrawCB(isShowNext) {
        console.log("confirmDraw confirmDraw confirmDraw")
        if (this.coin == 0 && glGame.user.get("coin") != 0) {                       //判断是否开启稽核，目前先这么判断
            return glGame.panel.showErrorTip(glGame.tips.EXCHANGE.LOCK);
        }
        let edbStr = this.edbNumBank.string;
        if (edbStr.indexOf(".") > 0 && edbStr.length - edbStr.indexOf(".") > 2) {
            this.edbNumBank.string = this.getFloat(Number(this.edbNumBank.string));
        }
        console.log("confirmDraw confirmDraw confirmDraw1")
        if (!/^\d+(\.\d{0,2})?$/.test(this.edbNumBank.string)) {
            return glGame.panel.showErrorTip("输入必须为数字");
        }
        console.log("confirmDraw confirmDraw confirmDraw2", this.edbNumBank.string)
        let amount = Number(this.edbNumBank.string);
        if (!amount || amount < 0) {
            return glGame.panel.showErrorTip(glGame.tips.EXCHANGE.EXCLITTLE);
        }
        console.log("confirmDraw confirmDraw confirmDraw3")
        let num = amount / this.cutFloat(this.unit);// 判断领取倍数
        if (num.toString().indexOf(".") > -1) {
            return glGame.panel.showErrorTip(`兑换金额必须是${(this.cutFloat(this.unit))}的整数倍`);
        }
        console.log("confirmDraw confirmDraw confirmDraw4")
        let userCoin = this.coin;
        if (userCoin - amount < this.cutFloat(this.unit)) {
            return glGame.panel.showErrorTip(glGame.tips.EXCHANGE.MINGOLD);
        }
        console.log("confirmDraw confirmDraw confirmDraw5")
        let type = this.drawtype;
        console.log('领取金额', amount);
        let end = this.coin <= this.end ? Number(this.coin).sub(this.coin % this.unit) : this.end;
        if (amount > this.cutFloat(end)) return glGame.panel.showTip("金额已超出取现限额");
        if (isShowNext) return;
        let accountStr = this.index == 2 ? glGame.user.get("alipayAcc") : glGame.user.get("bankCardNum");
        console.log("账号账号账号", accountStr);
        if (!accountStr) {
            let tipstr = this.index == 2 ? "您暂未绑定支付宝，请前往绑定" : "您暂未绑定银行卡，请前往绑定";
            return glGame.panel.showErrorTip(tipstr);
        }
        if (this["amount"] > glGame.user.get("coin")) return glGame.panel.showTip('提现金币不足！');

        glGame.panel.showPanelByName("exchangeTip").then(panel => {
            let script = panel.getComponent(panel.name);
            script.set("showModel", this.drawtype); //显示兑换提示
            script.set("amount", amount);
            script.initData();
        })
    },

    showBindPanel() {
        this.hideAllPanel()
        this.drawalMgrPanel.active = true;
        this.drawalMgrPanel.getChildByName("basePanel").active = false;
        glGame.panel.showChildPanelByName("bindpay", this.drawalMgrPanel).then(panel => {
            let script = panel.getComponent(panel.name);
            script.set("showModel", this.drawtype)
            script.initUI();
        });
    },

    resetDrawalPanel() {
        console.log("成功后刷新的页面信息", this.index)
        let panelNameArr = ["bank", "ali", "account", "drawalMgr"];
        this.drawalMgrPanel.getChildByName("basePanel").active = true;
        this.switchPanel(panelNameArr[this.index - 1]);
        this.index == 1 ? this.refreshbank() : this.refreshali();
    },

    onClick(name, node) {
        switch (name) {
            case "bank":
                this.index = 1;
                this.switchPanel(name);
                break;
            case "ali":
                this.index = 2;
                this.switchPanel(name);
                break;
            case "account":
                this.index = 3;
                this.switchPanel(name);
                break;
            case "drawalMgr":
                this.index = 4;
                this.switchPanel(name);
                break;
            case "drawRecord":
                this.initDrawRecord();
                break;
            case "confirmDraw":
                this.confirmDrawCB();
                break;
            case "clear":
                this.clearBankNum();
                break;
            case "close":
                glGame.panel.revertOpenNodeEffect(this.node, 2).then(() => { this.remove() });
                glGame.emitter.emit("plazaOpen")
                break;
            case "registBank":
                this.showBindPanel();
                break;
            case "bankBindBtn":
            case "aliBindBtn":
                this.drawtype = name == "aliBindBtn" ? 1 : 2;
                this.showBindPanel();
                break;
            case "bankUnbindBtn":
            case "aliUnbindBtn":
                glGame.panel.showMsgBox("提示", "      为了您的账号安全，支付宝和银行卡绑定后无法进行解绑，如需解绑，请联系客服!")
                break;
            case "btn_accrecord": this.accrecord_cb(true); break;
            case "btn_accdetail": this.accdetail_cb(true); break;
        }
    },

    //======================================================account
    //取现福利回调
    accrecord_cb(isChange) {
        if (isChange) {
            this.changeState(true);
        }
        let msg = {}
        msg.page_size = 10;
        msg.page = this.drawAccContentPageIndex;
        console.log("请求参数2", msg)
        glGame.gameNet.send_msg("http.reqWithdrawDiscount", msg, (route, data) => {
            cc.log("取现福利", data)
            let result = data.result;
            if (result.list.length == 0 && this.drawAccContentPageIndex != 1) {
                this.drawAccContentPageIndex--;
                return;
            }
            this.initAccRecordUI(result.list, isChange);
        })
    },
    //取现资金明细
    accdetail_cb(isChange) {
        if (isChange) {
            this.changeState(false);
        }
        let msg = {}
        msg.page_size = 10;
        msg.page = this.drawAccContentPageIndex;

        console.log("请求参数1", msg)
        glGame.gameNet.send_msg("http.reqWithdrawRecharge", msg, (route, data) => {
            cc.log("取现资金明细", data)
            let result = data.result;
            if (result.list.length == 0 && this.drawAccContentPageIndex != 1) {
                this.drawAccContentPageIndex--;
                return;
            }
            this.initAccDetailUI(result.list, isChange);
        })
    },
    changeState(bool) {
        console.log("请求参数")
        this.accountType = bool ? 1 : 2;        //1为福利记录，2为资金明细
        this.drawAccContentPageIndex = 1;
        this.acc_recordLine.active = bool;
        this.acc_detailLine.active = !bool;
        this.acc_recordTitle.active = bool;
        this.acc_detailTitle.active = !bool;
        this.acc_tip.active = bool;
    },
    //初始化取现福利UI
    initAccRecordUI(list, isChange) {
        if (isChange) {
            this.acc_content.removeAllChildren();
            let firstItem = cc.instantiate(this.acc_recordItem);
            firstItem.parent = this.acc_content;
            firstItem.active = true;
            for (let i = 0; i < firstItem.childrenCount; i++) {
                firstItem.children[i].active = false;
            }
        }
        for (let i = 0; i < list.length; i++) {
            let item = cc.instantiate(this.acc_recordItem);
            item.parent = this.acc_content;
            item.active = true;

            item.getChildByName("bg").active = i % 2 == 0;
            let time = item.getChildByName("time")
            time.getComponent(cc.Label).string = list[i].time;
            let type = item.getChildByName("state")
            type.getComponent(cc.Label).string = list[i].type;
            type.color = list[i].type == "已通过" ? cc.color(130, 184, 65) : cc.color(127, 126, 128);
            let current_flow = item.getChildByName("flow").children[0];
            current_flow.getComponent(cc.Label).string = this.cutFloat(list[i].current_flow);
            let need_flow = item.getChildByName("flow").children[1];
            need_flow.getComponent(cc.Label).string = "/" + this.cutFloat(list[i].need_flow);
            let coin = item.getChildByName("coin")
            coin.getComponent(cc.Label).string = this.cutFloat(list[i].coin);
        }
        let lines = this.acc_recordLine.children;
        let lineLength = list.length == 0 ? 104 : 530;
        for (let i = 0; i < lines.length; i++) {
            lines[i].height = lineLength;
        }
    },
    //初始化取现资金明细UI
    initAccDetailUI(list, isChange) {
        if (isChange) {
            this.acc_content.removeAllChildren();
        }
        for (let i = 0; i < list.length; i++) {
            let item = cc.instantiate(this.acc_detailItem);
            item.parent = this.acc_content;
            item.active = true;

            item.getChildByName("bg").active = i % 2 == 0;
            let time = item.getChildByName("time")
            time.getComponent(cc.Label).string = list[i].create_time;
            let type = item.getChildByName("type")
            type.getComponent(cc.Label).string = list[i].type;
            let coin = item.getChildByName("coin")
            coin.getComponent(cc.Label).string = this.cutFloat(list[i].pay_money);
        }
        let lines = this.acc_detailLine.children;
        let lineLength = list.length == 0 ? 66 : 530;
        for (let i = 0; i < lines.length; i++) {
            lines[i].height = lineLength;
        }
    },
    accScrollViewBottom() {
        cc.log("acc__ScrollViewBottom");
        this.drawAccContentPageIndex++;
        if (this.accountType == 1) {
            this.accrecord_cb(false);
        } else {
            this.accdetail_cb(false);
        }
    },
    //==========================================================account

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
            return value.toFixed(num);
        }
    },

    OnDestroy() {
        this.unRegisterEvent();
    },

    //注册滑动到底部的监听事件，node.on监听，节点销毁就注销了
    registerScrollEvent() {
        this.acc_scrollView.on("scroll-to-bottom", this.accScrollViewBottom, this);         //福利明细与资金明细
    },

    start() { },

    // update (dt) {},
});

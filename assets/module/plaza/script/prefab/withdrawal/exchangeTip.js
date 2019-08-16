glGame.baseclass.extend({
    properties: {
        label: cc.Label,
        pawBgEbx: cc.EditBox,
        phoneNum: cc.Label,
        getCodeBtn: cc.Node,
        phoneNumNode: cc.Node,
        drawPasswordPanel: cc.Node,
        codePanel: cc.Node,
        pawBg: cc.Node,
        drawPasswordEdx: cc.EditBox,
        confirmTitle: cc.Node,
        setDrawPasswordTitle: cc.Node,
        setDrawPasswordNode: cc.Node,
        pwd: cc.EditBox,
        pwdCheck: cc.EditBox,
        CD: cc.Label,
        setPhoneCode: cc.Node,
        phoneEdx: cc.EditBox,
        phoneCheckEdx: cc.EditBox,
        bindPhoneCD: cc.Label,
    },
    onLoad() {
        this.verifiCD = 60;
        this.verifiState = false;
        glGame.emitter.on("withdrawSuccess", this.withdrawSuccess, this);
    },
    initUI() {
        switch (this["showModel"]) {
            case 1: this.showexchangeAlipayTip(); break;
            case 2: this.showexchangeBankcard(); break;
        }
        this.initCheckType();
    },

    initData() {
        glGame.gameNet.send_msg("http.reqWithdrawConfig", null, (route, data) => {
            console.log("请求取现配置接口", data)
            // 回包内容
            // integer_multiple: "50"
            // min_service_charge: "5"
            // phone: "1553585522203"
            // phone_check: 1 0 不需要验证  1手机验证 2取现密码
            // service_charge: "10"
            // cash_password: 0 未设置取现密码 1已设置取现密码
            this.phoneCode = data.phone;
            this.checkType = data.phone_check;
            this.drawPwdState = data.cash_password;
            if (this.checkType == 2 && this.drawPwdState == 0) {
                this.showSetDrawPassword();
                return;
            }
            if (this.checkType == 1 && !this.phoneCode) {
                this.checkType = 3;
                this.showSetPhoneCode();
                return;
            }
            this.initUI();
        })


    },

    showSetPhoneCode() {
        console.log("showSetPhoneCode")
        this.setPhoneCode.active = true;
    },

    reqSetDrawPassword() {
        let msg = {
            cpwd: md5(this.pwdCheck.string),
            pwd: md5(this.pwd.string)
        }
        glGame.gameNet.send_msg("http.reqSetWithdrawPwd", msg, (route, data) => {
            //刷新当前界面为输入密码界面
            this.initData();
        })
    },

    initCheckType() {
        let posArr = [];
        switch (this.checkType) {
            case 0:
                posArr = [0];
                break;
            case 1:
                posArr = [60, -20, -90];
                this.codePanel.active = true;
                this.phoneNumNode.y = posArr[1];
                this.pawBg.y = posArr[2];
                this.phoneNum.string = this.phoneCode.replace(this.phoneCode.substring(3, 7), "****");
                break;
            case 2:
                posArr = [22, -64];
                this.drawPasswordPanel.active = true;
                this.drawPasswordPanel.y = posArr[1];
                break;
        }
        this.confirmTitle.y = posArr[0];
    },

    //兑换成功的回调
    withdrawSuccess() {
        clearInterval(this.updateVerifiCD);
        glGame.panel.showPanelByName("exchangeWin").then(panel => {
            let script = panel.getComponent(panel.name);
            script.showSuccess({ name: 'tixianchenggong' });
        })
        this.node.destroy();
    },
    showexchangeAlipayTip() {
        this.confirmTitle.active = true;
        this.label.string = this["amount"];
    },
    showexchangeBankcard() {
        this.confirmTitle.active = true;
        this.label.string = this["amount"];
    },
    showSetDrawPassword() {
        this.confirmTitle.active = false;
        this.setDrawPasswordTitle.active = true;
        this.setDrawPasswordNode.active = true;
    },

    //点击绑定事件
    onClick(name, node) {
        switch (name) {
            case "sure": this.click_sure(); break;
            case "cancel": this.click_cancel(); break;
            case "close": this.click_cancel(); break;
            case "getCodeBtn": this.click_getCode(); break;
            case "getBindCodeBtn": this.click_getPhoneCodeBtn(); break;
            default: console.error("no find button name -> %s", name);
        }
    },

    click_getPhoneCodeBtn() {
        if (this.verifiState) {
            glGame.panel.showTip("获取验证码操作过于频繁,请稍后再尝试");
            return;
        }
        if (!this.phoneEdx.string) {
            glGame.panel.showTip("请填写手机号码");
            return;
        }
        if (this.checkType == 3) {
            let msg = {};
            msg["phone"] = this.phoneEdx.string;
            msg["type"] = 1;
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                msg.phone_type = 1;
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                msg.phone_type = 2;
            } else {
                msg.phone_type = 0;
            }
            console.log("aaaaaaaaa", msg)
            glGame.gameNet.send_msg("http.reqPostPhoneCode", msg, (route, data) => {
                glGame.panel.showTip("验证码发送成功");
                this.verifiState = true;
                this.updateVerifiCD = setInterval(() => {
                    if (this.verifiCD < 0) {
                        clearInterval(this.updateVerifiCD);
                        this.verifiCD = 60;
                        this.verifiState = false;
                    } else {
                        this.bindPhoneCD.string = this.verifiCD === 0 ? "发送" : `${this.verifiCD}s`;
                        this.verifiCD--;
                    }
                }, 1000)
            })
        }
    },

    click_getCode() {
        if (this.verifiState) {
            glGame.panel.showTip("获取验证码操作过于频繁,请稍后再尝试");
            return;
        }
        if (this.checkType == 1) {
            glGame.gameNet.send_msg("http.reqWithdrawPhone", null, (route, data) => {
                if (!data.result) {
                    glGame.panel.showTip("验证码发送失败");
                    return;
                }
                glGame.panel.showTip("验证码发送成功");
                if (data && data.code) {
                    console.log("是否有验证码", data.code)
                    this.pawBgEbx.string = data.code;
                }
                this.verifiState = true;
                this.updateVerifiCD = setInterval(() => {
                    if (this.verifiCD < 0) {
                        clearInterval(this.updateVerifiCD);
                        this.verifiCD = 60;
                        this.verifiState = false;
                    } else {
                        this.CD.string = this.verifiCD === 0 ? "发送" : `${this.verifiCD}s`;
                        this.verifiCD--;
                    }
                }, 1000)
            })
        }
    },
    click_sure() {
        if (this.checkType == 2 && this.drawPwdState == 0) {
            this.reqSetDrawPassword()
            return;
        }
        let checkCode = {
            "0": ``,
            "1": `${this.pawBgEbx.string}`,
            "2": `${this.drawPasswordEdx.string}`,
            "3": `${this.phoneCheckEdx.string}`,
        }
        if (this.checkType == 3 && this.phoneCheckEdx.string == '') return glGame.panel.showTip('请填写验证码');
        if (this.checkType == 2 && this.drawPasswordEdx.string == '') return glGame.panel.showTip('请填写取现密码');
        if (this.checkType == 1 && this.pawBgEbx.string == '') return glGame.panel.showTip('验证码不能为空');
        if (this.checkType == 3) {
            let msg = {};
            msg["phone"] = `${this.phoneEdx.string}`;
            msg["code"] = `${this.phoneCheckEdx.string}`;
            console.log("bbbbbbb", msg)
            glGame.gameNet.send_msg("http.reqBindPhone", msg, (route, data) => {
                console.log("bindphone callback", data)
                glGame.panel.showMsgBox("提示", "绑定成功，点击确定进行提现", () => {
                    clearInterval(this.updateVerifiCD);
                    this.verifiCD = 60;
                    this.verifiState = false;
                    this.bindPhoneCD.string = "发送";
                    this.setPhoneCode.active = false;
                    this.initData();
                })
            });
        } else {
            glGame.user.reqWithdraw(this["amount"], this["showModel"], checkCode[this.checkType]);
        }
    },
    click_cancel() {
        this.node.destroy();
    },

    //浮点型运算取俩位
    cutFloat(num) {
        return (this.getFloat(Number(num).div(100))).toString();
    },
    getFloat(value, num = 2) {
        value = Number(value);
        if (isNaN(value)) return;
        if (~~value === value) {
            return value.toString();
        } else {
            return (Math.floor(value * 100) / 100).toFixed(num);
        }
    },



    set(key, value) {
        this[key] = value;
    },

    OnDestroy() {
        clearInterval(this.updateVerifiCD);
        glGame.emitter.off("withdrawSuccess", this);
    },
});

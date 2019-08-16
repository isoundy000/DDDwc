//该命名必须对应预支中的控件名（方法较为便利）
let LIST_CONTROL = [
    "acc",          //账号
    "psw",          //密码
    "cpsw",         //确认密码
    "wpsw",         //取款密码
    //-----以上为固定的注册信息（可不添加如回包信息里）
    "proxy",        //邀请码
    "name",         //真实姓名
    "sex",          //性别
    "phone",        //手机号码
    "wechat",       //微信号码
    "qq",           //QQ号码
    "email",        //邮箱地址
    "nickname",     //昵称
    "verifica"      //验证码
]
//页面索引枚举
const PANELINDEX = {
    ACC: 0,
    PHONE: 1,
    WECHAT: 2,
    REGISTRA: 3,
    RETRIEVEPSW: 4,
}
glGame.baseclass.extend({
    properties: {
        node_regis: cc.Node,
        node_login: cc.Node,
        node_protocol: cc.Node,
        agree_toggle: cc.Node,
        content_str: cc.RichText,


        regis_content: cc.Node,
        verificacode: cc.Label,
        phoneverification: cc.EditBox,

        sex: cc.Node,

        content_Panel: cc.Node,
        node_LeftList: cc.Node,                 //左边按钮
        sprite_title: cc.Sprite,                //标题
        spreteFrame_title: [cc.SpriteFrame],
        node_bottom: cc.Node,                   //底部

        node_agree: cc.Node,

        //登录
        login_acc: cc.EditBox,
        login_psw: cc.EditBox,
        node_rememberAcc: cc.Node,

        //找回密码
        retrieve_phone: cc.EditBox,
        retrieve_verifica: cc.EditBox,
        retrieve_psw: cc.EditBox,
        retrieve_cpsw: cc.EditBox,
        retrieve_sendVerifica: [cc.Node],
        label_retrivevcode: cc.Label,

        //手机登录
        node_rememberPhone: cc.Node,
        phone_phone: cc.EditBox,
        phone_code: cc.EditBox,
        phone_sendVerifica: [cc.Node],
        label_phoneCode: cc.Label,
    },
    onLoad() {
        this.public_list = [
            "accountTitle",
            "division",
            "membershipTitle",
            "acc",          //账号
            "psw",          //密码
            "cpsw",         //确认密码
            "wpsw",         //取款密码
            "verifica"      //验证码
        ];
        this.registerEvent();
        this.initRegisContent();
        glGame.logon.reqRegisterConfig();   //获取注册表
        this.iSagree = true; //是否同意用户协议
        this.iSregisUI = false; // 当前是否为注册界面
        this.isRememberAcc = false;
        this.isRememberPhone = false;
        this.initUI();
    },

    // 按钮点击事件
    onClick(name, node) {
        switch (name) {
            case "close": return this.remove();
            case "send": return this.btn_sendCode();
            case "btn_birthday": return this.btn_editbirthday();
            case "btn_protocol": return this.btn_protocol();
            case "btn_guanbi": return this.btn_guanbi();

            //leftlist
            case "toggle_acc": return this.leftList_cb(PANELINDEX.ACC);
            case "toggle_phone": return this.leftList_cb(PANELINDEX.PHONE);
            case "toggle_wechat":
                this.leftList_cb(PANELINDEX.WECHAT);
                this.weChatLogin_cb();
                break;
            case "toggle_registra": return this.leftList_cb(PANELINDEX.REGISTRA);
            case "toggle_retrievePsw": return this.leftList_cb(PANELINDEX.RETRIEVEPSW);

            //toggle
            case "btn_agree": return this.agree_cb();

            //accLogin
            case "btn_accLogin": return this.accLogin_cb();
            case "btn_rememberAcc": return this.rememberAcc_cb();

            //retistrationLogin
            case "btn_registrationLogin": this.registrationLogin_cb(); break;         //确认注册账号

            //retrievePsw
            case "btn_contactService": glGame.panel.showService(); break;
            case "btn_retrievePsw": this.retrievePsw_cb(); break;
            case "btn_retrievePswSend": this.retrievePswSend_cb(); break;

            //phoneLogin
            case "btn_phoneSendVerifica": this.phoneSendVerifica_cb(); break;
            case "btn_phoneLogin": return this.phoneLogin_cb();
            case "btn_rememberPhone": return this.rememberPhone_cb();

            default: console.error("no find button name -> %s", name);
        }
    },

    //初始化一些toggle
    initUI() {
        this.isRememberAcc = glGame.storage.getItem("accNumber") ? true : false;
        this.node_rememberAcc.active = this.isRememberAcc;
        if (this.isRememberAcc) {
            this.login_acc.string = glGame.storage.getItem("accNumber").data;
        }

        this.isRememberPhone = glGame.storage.getItem("phoneNumber") ? true : false;
        this.node_rememberPhone.active = this.isRememberPhone;
        if (this.isRememberPhone) {
            this.phone_phone.string = glGame.storage.getItem("phoneNumber").data;
        }

        this.iSagree = glGame.storage.getItem("isAgree") ? glGame.storage.getItem("isAgree").data : true;
        this.node_agree.active = this.iSagree;

        let loginSwitch = glGame.user.get("loginSwitch")
        this.node_LeftList.getChildByName("toggle_acc").active = loginSwitch.account == 1;
        this.node_LeftList.getChildByName("toggle_phone").active = loginSwitch.phone == 1;
        this.node_LeftList.getChildByName("toggle_wechat").active = loginSwitch.wechat == 1 && cc.sys.isNative;
        this.node_LeftList.getChildByName("toggle_retrievePsw").active = loginSwitch.self_edit_login_pwd == 1;
    },
    //记住账号回调
    rememberAcc_cb() {
        this.node_rememberAcc.active = !this.node_rememberAcc.active;
    },
    //记住手机号码回调
    rememberPhone_cb() {
        this.node_rememberPhone.active = !this.node_rememberPhone.active;
    },
    //同意协议回调
    agree_cb() {
        this.iSagree = !this.iSagree;
        glGame.storage.setItem("isAgree", { data: this.iSagree })
        this.node_agree.active = this.iSagree;
    },

    //左边标签回调
    leftList_cb(index) {
        this.setTitleBottom(index);
        this.setContent(index)
    },
    //切换左边按钮标签以及标题
    setTitleBottom(index) {
        this.sprite_title.spriteFrame = this.spreteFrame_title[index];
        if (index == 4) {
            this.node_bottom.getChildByName("btn_contactService").active = true;
            this.node_bottom.getChildByName("btn_agree").active = false;
        } else if (index == 2) {
            this.node_bottom.getChildByName("btn_contactService").active = false;
            this.node_bottom.getChildByName("btn_agree").active = false;
        } else {
            if (!this.protocolinfo) return
            this.node_bottom.getChildByName("btn_agree").active = this.protocolinfo.value == 1;
            this.node_bottom.getChildByName("btn_contactService").active = false;
        }
    },
    //切换中间content
    setContent(index) {
        for (let i = 0; i < this.content_Panel.childrenCount; i++) {
            this.content_Panel.children[i].active = index == i;
        }
    },

    //微信登录
    weChatLogin_cb() {
        console.log("微信登录")
        glGame.platform.loginWX();
    },
    //账号登录
    accLogin_cb() {
        if (!this.iSagree && this.protocolinfo.value == 1) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.PROTOCOL);
            return;
        }
        let acc = this.checkAcc(this.login_acc.string);
        if (!acc) return;
        let psw = this.checkPassword(this.login_psw.string);
        if (!psw) return;
        glGame.logon.reqAccLogin({ username: acc, password: md5(psw) });    //username:phone,code:验证码,plat:5

        if (this.node_rememberAcc.active) {
            glGame.storage.setItem("accNumber", { data: acc })
        } else {
            glGame.storage.removeItemByKey("accNumber");
        }
    },
    //手机登录
    phoneLogin_cb() {
        if (!this.iSagree && this.protocolinfo.value == 1) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.PROTOCOL);
            return;
        }
        let phone = this.checkPhone(this.phone_phone.string);
        let code = this.phone_code.string;
        //手机登录
        glGame.logon.reqPhoneLogin({ username: phone, code: code });    //username:phone,code:验证码,plat:5

        if (this.node_rememberPhone.active) {
            glGame.storage.setItem("phoneNumber", { data: phone })
        } else {
            glGame.storage.removeItemByKey("phoneNumber");
        }
    },
    //确认注册账号
    registrationLogin_cb() {
        if (!this.iSagree && this.protocolinfo.value == 1) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.PROTOCOL);
            return;
        }
        // 代理推荐码输入框中只允许输入数字和英文，英文允许大小写。11位
        let msg = {};

        let verificaValue;
        for (let key in this.Configdata) {
            let rdata = this.Configdata[key];
            if (rdata.key == "verifica") {
                verificaValue = rdata.value
                break;
            }
        }
        //获取默认选项的
        for (let key in this.public_list) {
            let data = this.public_list[key];
            if (data == "verifica" && verificaValue == 3) continue;
            if (!data) continue;
            let regisContent = this.switchRegis(data);
            if (regisContent == null) return;
            if (regisContent) {
                msg[data] = regisContent;
                if (data == "psw") msg["cpsw"] = regisContent;
            }
        }

        for (let key in this.Configdata) {
            let rdata = this.Configdata[key];
            if (rdata.key == "verifica" && rdata.value == 1) {
                regisContent = this.getEditBoxString("verifica")
                if (regisContent) msg[rdata.key] = regisContent;
                continue
            }
            //排除多余信息
            if (!rdata || this.checkRegisList(rdata.key)) continue;
            if (this.regisOptional(rdata)) continue;
            let regisContent = this.switchRegis(rdata.key);
            if (regisContent == null) return;

            if (regisContent) msg[rdata.key] = regisContent;
            console.log("这是当前注册发送的消息", rdata.key, msg)
            //手机验证码
            if (rdata.key == "phone") {
                if (this.phoneverification.string == "") {
                    glGame.panel.showErrorTip("手机验证码不能为空");
                    return
                } else if (this.phoneverification.string.length < 6) {
                    glGame.panel.showErrorTip("手机验证码要为6位数");
                    return
                }
                msg["verification"] = this.phoneverification.string
            }
        }
        console.log('这是当前发送的消息', msg);
        glGame.logon.reqRegister(msg);
    },
    //找回密码
    retrievePsw_cb() {
        let msg = {};
        let phone = this.checkPhone(this.retrieve_phone.string)
        if (!phone) return;
        let psw = this.checkPassword(this.retrieve_psw.string, this.retrieve_cpsw.string);
        if (!psw) return;

        let code = this.retrieve_verifica.string;
        msg.phone = phone;
        msg.pwd = psw;
        msg.code = code;
        glGame.user.ReqRetrievePwd(msg);
    },
    //找回密码发送验证码
    retrievePswSend_cb() {
        let phone = this.checkPhone(this.retrieve_phone.string)
        if (!phone) return;
        glGame.user.ReqPostPhoneCode({ phone: phone, type: 8 });
    },
    //手机登录发送验证码
    phoneSendVerifica_cb() {
        let phone = this.checkPhone(this.phone_phone.string)
        if (!phone) return;
        glGame.user.reqPhoneCode({ phone: phone, type: 9 });
    },
    //切换为注册界面
    setRegisUi() {
        this.leftList_cb(PANELINDEX.REGISTRA);
    },

    setLeftUIRegisGap() {
        this.iSregisUI = true;
    },

    initRegisContent() {
        for (let i = 0, count = this.public_list.length; i < count; i++) {
            let name = this.public_list[i];
            if (!name || name == "verifica") continue;
            let regis_strip = this.getRegisObj(name);
            regis_strip.active = true;
        }
    },

    OnDestroy() {
        this.unRegisterEvent();
        glGame.user.clearPostPhoneInterval();
        glGame.user.clearPhoneInterval();
    },
    registerEvent() {
        glGame.emitter.on("loginSuccess ", this.loginSuccess, this);
        glGame.emitter.on("RegisterConfig", this.RegisterConfig, this)
        glGame.emitter.on("editBirthDay", this.editBirthDay, this);
        glGame.emitter.on("retrievePswCD", this.retrievePswCD, this);
        glGame.emitter.on("phoneCodeCD", this.phoneCodeCD, this);
        glGame.emitter.on("changePswSuccess", this.changePswSuccess, this);
    },
    unRegisterEvent() {
        glGame.emitter.off("loginSuccess ", this);
        glGame.emitter.off("RegisterConfig", this)
        glGame.emitter.off("editBirthDay", this);
        glGame.emitter.off("retrievePswCD", this);
        glGame.emitter.off("phoneCodeCD", this);
        glGame.emitter.off("changePswSuccess", this);
    },

    //更改密码成功
    changePswSuccess() {
        this.node_LeftList.getChildByName("toggle_acc").getComponent(cc.Toggle).check();
    },

    //找回密码验证码
    retrievePswCD(msg) {
        if (glGame.user.get("retrievePswState") && msg > 0) {
            this.retrieve_sendVerifica[0].active = false;
            this.retrieve_sendVerifica[1].active = true;
            this.label_retrivevcode.string = msg;
        } else {
            this.retrieve_sendVerifica[0].active = true;
            this.retrieve_sendVerifica[1].active = false;
        }
    },
    //手机登录验证码
    phoneCodeCD(msg) {
        if (glGame.user.get("phoneCodeState") && msg > 0) {
            this.phone_sendVerifica[0].active = false;
            this.phone_sendVerifica[1].active = true;
            this.label_phoneCode.string = msg;
        } else {
            this.phone_sendVerifica[0].active = true;
            this.phone_sendVerifica[1].active = false;
        }
    },
    //获取注册表的回调
    RegisterConfig(Configdata) {
        console.log("这是当前注册的信息", Configdata)
        this.Configdata = Configdata.data;
        this.protocolinfo = Configdata.protocol
        this.initRegisUi();
        if (this.iSregisUI) {
            this.node_LeftList.getChildByName("toggle_registra").getComponent(cc.Toggle).check();
        } else {
            for (let i = 0; i < this.node_LeftList.childrenCount; i++) {
                if (this.node_LeftList.children[i].active) {
                    this.onClick(this.node_LeftList.children[i].name);
                    this.node_LeftList.children[i].getComponent(cc.Toggle).isChecked = true;
                    return
                }
            }
        }
    },
    sort(name, index) {
        let childdata = this.regis_content.children;
        for (let i = 0, count = this.regis_content.childrenCount; i < count; i++) {
            let data = childdata[i];
            if (data.name == name) {
                if (index === i) break;
                var temp = childdata[i];
                childdata[i] = childdata[index];
                childdata[index] = temp;
                return true;
            }
        }
        return false;
    },

    checkRegisList(regisname) {
        let bContinue = false;
        for (let i = 0, count = this.public_list.length; i < count; i++) {
            let name = this.public_list[i];
            if (!name) continue;
            if (name == regisname) { bContinue = true; break; }
        }
        return bContinue;
    },

    //初始化注册界面UI
    initRegisUi() {
        console.log('这是当前的注册初始化问题', this.Configdata);
        let index = 8;
        for (let key in this.Configdata) {
            let rdata = this.Configdata[key];

            let regisObj = this.getRegisObj(rdata.key);
            if (regisObj.getChildByName("editBox")) {
                regisObj.getChildByName("editBox").getComponent(cc.EditBox).placeholder = rdata.description;
            }
            //排除多余信息
            if (rdata.key == "verifica" && rdata.value == 1) {
                this.setVerificacode();
                regisObj.active = true;
            }
            if (!rdata || this.checkRegisList(rdata.key)) continue;

            if (!regisObj || rdata.value == 3) continue;
            if (rdata.value == 2) regisObj.getChildByName("label").getChildByName("star").active = false;
            else if (rdata.value == 1) regisObj.getChildByName("label").getChildByName("star").active = true;
            regisObj.setSiblingIndex(index);
            index++;
            regisObj.active = true;

        }
        //收到包开启确认按钮（间隔条）
        this.getRegisObj("gap_frame").active = true;
        this.getRegisObj("btn_registrationLogin").active = true;
        console.log("这是当前的index索引", index)
        //是否隐藏会员资料的字体判断以及那条线
        let draw = false;
        for (let key in this.Configdata) {
            if (this.Configdata[key].key == "acc" || this.Configdata[key].key == "psw" || this.Configdata[key].key == "verifica" || this.Configdata[key].key == "cpsw"
                || this.Configdata[key].key == "wpsw") {
                continue
            }
            console.log("这是当前的配置名字", key, this.Configdata[key].value)
            if (this.Configdata[key].value != 3) {
                draw = true
                break;
            }
        }
        if (!draw) {
            let title = this.getRegisObj("membershipTitle"),
                xian = this.getRegisObj("division");
            title.active = false;
            xian.active = false;
        }
    },

    //登录成功回调
    loginSuccess() {
        this.remove();
    },
    // 获取指定EditBox的文本
    getRegisObj(nodename) {
        return this.regis_content.getChildByName(nodename);
    },
    // 获取指定EditBox的文本
    getEditBoxString(nodename) {
        let regis_obj = this.regis_content.getChildByName(nodename),
            strObj = regis_obj.getChildByName("editBox");
        return strObj.getComponent(cc.EditBox).string;
    },

    btn_protocol() {
        glGame.gameNet.send_msg('http.reqProtocol', null, (route, data) => {
            console.log("这是当前的协议", data)
            this.node_protocol.active = true;
            this.content_str.string = `${data.data}`
        });
    },
    btn_guanbi() {
        this.node_protocol.active = false;
    },

    //是否同意用户协议
    btn_agree() {
        this.iSagree = !this.iSagree;
    },
    //发送手机号
    btn_sendCode() {
        let phone = this.checkPhone(this.getEditBoxString("phone"));
        if (!phone) return;
        glGame.user.sendVerificationCode({ phone: phone, type: 4 });
    },
    //清理倒计时
    cleanTimer() {
        if (this.setTimeOut != null) {
            clearTimeout(this.setTimeOut);
        }
        this.setTimeOut = null;
    },
    editBirthDay(msg) {
        console.log("这是当前选择的时间", msg)
        this.britharr = msg.split("_");
        let brithMonth = this.britharr[0],
            birthDay = this.britharr[1];
        this.regis_content.getChildByName("birthday").getChildByName("editBox").getComponent(cc.EditBox).string = `${brithMonth}月${birthDay}日`;
    },
    //生日选择
    btn_editbirthday() {
        glGame.panel.showBirthday();
    },

    editCheckAcc() {
        let str = this.login_acc.string;
        this.checkAcc(str);
    },

    setVerificacode() {
        let str = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
        console.log("这是当前的验证码", str)
        this.verificacode.string = str;
    },

    //判定是否填写内容有误
    switchRegis(regname) {
        let data = null;
        switch (regname) {
            case "acc":
                let acc = this.checkAcc(this.getEditBoxString(regname));
                if (acc) data = acc;
                break;
            case "psw":
                let psw = this.checkPassword(this.getEditBoxString("psw"), this.getEditBoxString("cpsw"));
                if (psw) data = md5(psw);
                break;
            case "wpsw":
                let wpsw = this.checkWithdrawalPsw(this.getEditBoxString(regname));
                if (wpsw) data = wpsw;
                break;
            case "proxy":
                let proxy = this.checkProxy(this.getEditBoxString(regname));
                if (proxy) data = proxy;
                break;
            case "name":
                let name = this.checkName(this.getEditBoxString(regname));
                if (name) data = name;
                break;
            case "sex":
                let sex = this.sex.getChildByName("toggle").children[0].children[1].active == true ? 1 : 2;
                data = sex;
                break;
            case "phone":
                let phone = this.checkPhone(this.getEditBoxString(regname));
                if (phone) data = phone;
                break;
            case "wechat":
                let wechat = this.checkWX(this.getEditBoxString(regname));
                if (wechat) data = wechat;
                break;
            case "qq":
                let qqNum = this.checkQQ(this.getEditBoxString(regname));
                if (qqNum) data = qqNum;
                break;
            case "email":
                let email = this.checkMail(this.getEditBoxString(regname));
                if (email) data = email;
                break;
            case "nickname":
                let nickName = this.checkNickName(this.getEditBoxString(regname));
                if (nickName) data = nickName;
                break;
            case "birthday":
                let birthday = this.checkbirthday(this.britharr)
                if (birthday) data = birthday;
                break;
            case "verifica":
                let verif = this.getEditBoxString(regname) == this.verificacode.string ? true : false;
                if (!verif) {
                    glGame.panel.showErrorTip(glGame.tips.REGISTRATION.VERIFICA);
                } else data = false;
                break;

            default: data = false; break;
        }
        return data;
    },

    //排除显示注册item的多余信息
    regisOptional(regisdata) {
        let blConent = false;
        if (regisdata.value == 1) return blConent;
        if (regisdata.value == 3) {
            blConent = true
            return blConent
        }
        switch (regisdata.key) {
            case "proxy":
            case "name":
            case "phone":
            case "wechat":
            case "qq":
            case "email":
            case "nickname":
            case "birthday":
                blConent = this.getEditBoxString(regisdata.key) == "";
                break;
            default: break;
        }
        return blConent;
    },
    //生日
    checkbirthday(data) {
        if (!data) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.BIRTHDAY);
            return null;
        }
        let birthday = `${data[0]}-${data[1]}`
        return birthday
    },
    // 银行取现
    checkWithdrawalPsw(wpsw) {
        if (!wpsw) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.WITHDRAWALPSW);
            return null;
        }
        let reg = /^\d{4,6}$/; //验证规则
        let iswpsw_matcher = reg.test(wpsw);
        if (!iswpsw_matcher) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.WITHDRAWALPSWLENGTH);
            return false;
        }
        return wpsw;
    },
    //代理推荐码检查
    checkProxy(proxy) {
        if (!proxy) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.PROXY);
            return null;
        }
        // let reg = /^\w{11}$/;
        // let proxy_check = reg.test(proxy);
        // if (!proxy_check) {
        //     glGame.panel.showErrorTip('代理推荐码不存在！');
        //     return false;
        // }
        return proxy;
    },
    // 手机号码检查
    checkPhone(acc) {
        if (!acc) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.PHONENULL);
            return null;
        }

        let reg = /^\d{11}$/; //验证规则
        let isacc_matcher = reg.test(acc);
        if (!isacc_matcher) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.PHONETYPE);
            return false;
        }
        return acc;
    },
    // 验证码检查
    checkVerification(verif) {
        if (!verif) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.VERIFINULL);
            return null;
        }
        return verif;
    },
    // 账号检查
    checkAcc(acc) {
        if (!acc || acc == '') {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.ACCNULL);
            return false;
        }
        if (acc.length <= 1) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.ACCLENGTH);
            return false;
        }
        let reg = /^\w{2,15}$/;
        let acc_check = reg.test(acc);
        if (!acc_check) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.ACCTYPE);
            return false;
        }
        return acc;
    },
    // QQ检查
    checkQQ(qqNum) {
        if (!qqNum || qqNum == '') {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.QQNULL);
            return null;
        }
        let reg = /^[1-9][0-9]{4,9}$/gim; //验证规则
        let isQQNum_matcher = reg.test(qqNum);
        if (!isQQNum_matcher) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.QQTYPE);
            return false;
        }
        return qqNum;
    },
    // 微信检查
    checkWX(wxNum) {
        if (!wxNum || wxNum == '') {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.WECHATNULL);
            return null;
        }
        let reg = /^[a-zA-Z\d_]{5,}$/; //验证规则
        let isWXNum_matcher = reg.test(wxNum);
        if (!isWXNum_matcher) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.WECHATTYPE);
            return false;
        }
        return wxNum;
    },

    // 姓名检查
    checkName(nameNum) {
        if (!nameNum || nameNum == '') {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.NAMENULL);
            return null;
        }

        if (this.checkStrLength(nameNum, 4, 12)) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.NAMELENGTH);
            return false;
        }
        let reg = /^[\u4E00-\u9FA5A-Za-z]+$/; //验证规则
        let isnameNum_matcher = reg.test(nameNum);
        if (!isnameNum_matcher) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.NAMETYPE);
            return false;
        }
        return nameNum;
    },

    //检查中文和英文混合的字符长度
    checkStrLength(str, min, max) {
        let mTextMaxlenght = 0;
        let arr = str.split("");
        for (let i = 0; i < arr.length; i++) {
            let charAt = arr[i].charCodeAt();
            //32-122包含了空格，大小写字母，数字和一些常用的符号，
            //如果在这个范围内则算一个字符，
            //如果不在这个范围比如是汉字的话就是两个字符
            if (charAt >= 32 && charAt <= 122) {
                mTextMaxlenght++;
            } else {
                mTextMaxlenght += 2;
            }
        }
        return mTextMaxlenght < min || mTextMaxlenght > max
    },
    // 昵称检查
    checkNickName(nameNum) {
        if (!nameNum || nameNum == '') {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.NICKNAMENULL);
            return null;
        }
        if (this.checkStrLength(nameNum, 4, 12)) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.NICKNAMELENGTH);
            return false;
        }
        let reg = /^[\u4E00-\u9FA5A-Za-z]+$/; //验证规则
        let isnameNum_matcher = reg.test(nameNum);
        if (!isnameNum_matcher) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.NICKNAMETYPE);
            return false;
        }
        return nameNum;
    },
    // 邮箱检查
    checkMail(mailNum) {
        if (!mailNum || mailNum == '') {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.EMAILNULL);
            return null;
        }
        let reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/; //验证规则
        let ismailNum_matcher = reg.test(mailNum);
        if (!ismailNum_matcher) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.EMAILTYPE);
            return false;
        }
        return mailNum;
    },
    // 密码检查
    checkPassword(psw, confimpsw) {
        if (!psw) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.LOGPSWNULL);
            return null;
        }
        if (psw.length < 6) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.PSWLENGTH);
            return false;
        }
        if (!/\w$/.test(psw)) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.PSWWRONGFUL);
            return null;
        }
        if (confimpsw == null) return psw;
        if (!confimpsw || psw !== confimpsw) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.PSWCOFAIL);
            return null;
        }
        return psw;
    },
});

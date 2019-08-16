

glGame.baseclass.extend({

    properties: {
        //个人资料
        panel_userinfo: cc.Node,
        panel_bindPhone: cc.Node,
        panel_untiedPhone: cc.Node,
        panel_unbind: cc.Node,
        panel_editNickName: cc.Node,
        panel_editAcc: cc.Node,
        panel_exitAcc: cc.Node,
        edit_name: cc.EditBox,
        edit_wechat: cc.EditBox,
        edit_qq: cc.EditBox,
        edit_email: cc.EditBox,
        label_birth: cc.Label,

        //绑定手机
        edit_bindPhoneNumber: cc.EditBox,
        edit_bindPhoneCode: cc.EditBox,
        node_send: cc.Node,
        bindPohneCD: cc.Label,

        //修改昵称
        edit_nickname: cc.EditBox,

        //修改账号
        edit_acc: cc.EditBox,
        edit_psw: cc.EditBox,
        edit_cpsw: cc.EditBox,

        //解绑手机
        label_untied: cc.Label,
        edit_untiedCode: cc.EditBox,
        node_untiedSend: cc.Node,
        label_untiedCD: cc.Label,
    },


    onLoad() {
        this.registerEvent();
    },

    start() { },

    onClick(name, node) {
        switch (name) {
            case "btn_birthPanel": this.showbirthPanel(); break;
            case "btn_userSure": this.userSure_cb(); break;
            case "btn_userCancel": this.userCancel_cb(); break;

            case "btn_bindPhoneSend": this.bindPhoneSend_cb(); break;
            case "btn_bindPhoneSure": this.bindPhoneSure_cb(); break;
            case "btn_bindPhoneCancel": this.bindPhoneCancel_cb(); break;

            case "btn_untiedSure": this.untiedSure_cb(); break;
            case "btn_untiedCancel": this.untiedCancel_cb(); break;
            case "btn_untiedSend": this.untiedSend_cb(); break;

            case "btn_unbindSure": this.unbindSure_cb(); break;
            case "btn_unbindCancel": this.unbindCancel_cb(); break;

            case "btn_editNickSure": this.editNickSure_cb(); break;
            case "btn_editNickCancel": this.editNickCancel_cb(); break;

            case "btn_editAccSure": this.editAccSure_cb(); break;
            case "btn_editAccCancel": this.editAccCancel_cb(); break;

            case "btn_exitAccSure": this.exitAccSure_cb(); break;
            case "btn_exitAccCancel": this.exitAccCancel_cb(); break;
            default:
                break;
        }
    },

    registerEvent() {
        glGame.emitter.on("editBirthDay", this.editBirthEnd, this);
        glGame.emitter.on("user_showUserInfo", this.showUserInfo, this);
        glGame.emitter.on("user_showBindPhone", this.showBindPhone, this);
        glGame.emitter.on("bindPhoneCodeCD", this.bindPhoneCodeCD, this);
        glGame.emitter.on("UntiedCode", this.UntiedCode, this);
        glGame.emitter.on("user_showEditNickName", this.showEditNickName, this);
        glGame.emitter.on("user_showEditAcc", this.showEditAcc, this);
        glGame.emitter.on("exitAcc", this.exitAcc, this);
    },
    unregisterEvent() {
        glGame.emitter.off("editBirthDay", this);
        glGame.emitter.off("user_showUserInfo", this);
        glGame.emitter.off("user_showBindPhone", this);
        glGame.emitter.off("bindPhoneCodeCD", this);
        glGame.emitter.off("UntiedCode", this);
        glGame.emitter.off("user_showEditNickName", this);
        glGame.emitter.off("user_showEditAcc", this);
        glGame.emitter.off("exitAcc", this);
    },
    //显示退出账号
    exitAcc() {
        this.panel_exitAcc.active = true;
    },
    exitAccSure_cb() {
        let loginCache = glGame.storage.getItem("loginCache");
        if (loginCache) {
            let username = loginCache.pd.substr(-loginCache.le);
            glGame.storage.setItem("number", { data: username })
        }
        glGame.storage.removeItemByKey("loginCache");
        glGame.logon.reqTouLogin();
        this.panel_exitAcc.active = false;
        glGame.emitter.emit("unRegisterEventMyinfo")
    },
    exitAccCancel_cb() {
        this.panel_exitAcc.active = false;
    },
    //显示生日界面
    showbirthPanel() {
        glGame.panel.showBirthday();
    },

    //编辑昵称
    showEditNickName() {
        this.panel_editNickName.active = true;
    },
    editNickSure_cb() {
        let nickname = this.edit_nickname.string;
        glGame.gameNet.send_msg('http.reqEditMyInfo', { nickname: nickname }, (route, data) => {
            this.panel_editNickName.active = false;
            glGame.panel.showTip(glGame.tips.USER.EDITINFO.NICKNAME);
            glGame.user.reqMyInfo();
        })
    },
    editNickCancel_cb() {
        this.panel_editNickName.active = false;
    },

    //编辑账号
    showEditAcc() {
        this.panel_editAcc.active = true;
    },
    editAccSure_cb() {
        let username = this.edit_acc.string;
        let psw = this.checkPassword(this.edit_psw.string, this.edit_cpsw.string)
        if (!psw) return;
        glGame.gameNet.send_msg('http.reqEditMyInfo', { username: username, password: psw }, (route, data) => {
            this.panel_editAcc.active = false;
            glGame.panel.showTip(glGame.tips.USER.EDITINFO.ACC);
            glGame.user.reqMyInfo();
        })
    },
    editAccCancel_cb() {
        this.panel_editAcc.active = false;
    },

    //解绑手机
    untiedSend_cb() {
        let phone = glGame.user.get("phone");
        glGame.user.reqUntiedCode({ phone: phone, type: 10 })
    },
    untiedSure_cb() {
        let phone = glGame.user.get("phone");
        let code = this.edit_untiedCode.string;
        if (!code || code == '') return glGame.panel.showErrorTip(glGame.tips.USER.EDITINFO.UNCODE);
        glGame.gameNet.send_msg('http.ReqUntyingPhone', { phone: phone, code: code }, (route, msg) => {
            glGame.panel.showTip(glGame.tips.USER.BIND.UNTIED);
            glGame.user.reqMyInfo();
            glGame.user.clearUntiedInterval();
            this.UntiedCode(0);
            this.panel_untiedPhone.active = false;
        });
    },
    untiedCancel_cb() {
        this.panel_untiedPhone.active = false;
    },
    UntiedCode(msg) {
        if (glGame.user.get("untiedCodeState") && msg > 0) {            //解绑手机验证码倒计时
            this.node_untiedSend.children[0].active = false;
            this.node_untiedSend.children[1].active = true;
            this.label_untiedCD.string = msg;
        } else {
            this.node_untiedSend.children[0].active = true;
            this.node_untiedSend.children[1].active = false;
        }
    },

    //显示个人资料界面
    showUserInfo() {
        this.inituserinfo();
        this.panel_userinfo.active = true;
    },
    inituserinfo() {
        this.edit_name.string = glGame.user.get("name") || "";
        this.edit_wechat.string = glGame.user.get("wechat") || "";
        this.edit_qq.string = glGame.user.get("qq") || "";
        this.edit_email.string = glGame.user.get("email") || "";

        this.brithDay = glGame.user.get("birthday") || "";
        if (this.brithDay && this.brithDay != "") {
            let arr = this.brithDay.split("-");
            this.label_birth.string = `${arr[0]}月  ${arr[1]}日`;
            this.label_birth.node.color = new cc.Color(255, 255, 255);
        }
    },
    editBirthEnd(str) {
        this.brithDay = str;                            //生日编辑结束
        let arr = this.brithDay.split("_");
        this.label_birth.string = `${arr[0]}月  ${arr[1]}日`
    },
    userSure_cb() {
        let msg = {};
        //name
        if (this.edit_name.string != "" && this.edit_name.string != glGame.user.get("name")) {
            let name = this.checkNickName(this.edit_name.string);
            if (!name) return;
            msg.name = name;
        }
        //wechat
        if (this.edit_wechat.string != glGame.user.get("wechat") && this.edit_wechat.string != "") {
            let wechat = this.checkWX(this.edit_wechat.string);
            if (!wechat) return;
            msg.wechat = wechat;
        }
        //qq
        if (this.edit_qq.string != glGame.user.get("qq") && this.edit_qq.string != "") {
            let qq = this.checkQQ(this.edit_qq.string);
            if (!qq) return;
            msg.qq = qq;
        }
        //email
        if (this.edit_email.string != glGame.user.get("email") && this.edit_email.string != "") {
            let email = this.checkMail(this.edit_email.string);
            if (!email) return;
            msg.email = email;
        }
        //birth
        if (this.brithDay != glGame.user.get("birthday") && this.brithDay != "") {
            msg.birthday_month = this.brithDay;
        }

        if (Object.keys(msg).length == 0) {
            this.panel_userinfo.active = false;
            return;
        }

        glGame.gameNet.send_msg('http.reqEditMyInfo', msg, (route, data) => {
            this.panel_userinfo.active = false;
            glGame.panel.showTip(glGame.tips.USER.EDITINFO.BASEINFO);
            glGame.user.reqMyInfo();
        })
    },
    userCancel_cb() {
        this.panel_userinfo.active = false;
    },

    //显示绑定手机界面 1 绑定手机，2解绑，3无法绑定
    showBindPhone(type) {
        switch (type) {
            case 1: this.panel_bindPhone.active = true; break;
            case 2: this.panel_untiedPhone.active = true;
                this.label_untied.string = glGame.user.get("phone");
                break;
            case 3: this.panel_unbind.active = true; break;
            default:
                break;
        }
    },
    bindPhoneSend_cb() {
        let phone = this.checkPhone(this.edit_bindPhoneNumber.string)        //绑定手机发送
        if (!phone) return;
        glGame.user.reqBindPhoneCode({ phone: phone, type: 1 })
    },
    bindPhoneCodeCD(msg) {
        if (glGame.user.get("bindPhoneCodeState") && msg > 0) {              //绑定手机验证码倒计时
            this.node_send.children[0].active = false;
            this.node_send.children[1].active = true;
            this.bindPohneCD.string = msg;
        } else {
            this.node_send.children[0].active = true;
            this.node_send.children[1].active = false;
        }
    },
    bindPhoneSure_cb() {
        let phone = this.checkPhone(this.edit_bindPhoneNumber.string)       //绑定手机确定
        if (!phone) return;
        let code = this.edit_bindPhoneCode.string;

        glGame.gameNet.send_msg('http.reqBindPhone', { phone: phone, code: code }, (route, msg) => {
            if (msg.result) {
                glGame.user.reqMyInfo();
                glGame.user.clearBindPhoneInterval();
                this.bindPhoneCodeCD(0);
                this.panel_bindPhone.active = false;
                glGame.panel.showTip(glGame.tips.USER.BIND.PHONE);
            }
        })
    },
    bindPhoneCancel_cb() {                                                  //绑定手机取消
        this.panel_bindPhone.active = false;
    },

    //无法更改手机
    unbindSure_cb() {
        this.panel_unbind.active = false;
        glGame.panel.showService();
    },
    unbindCancel_cb() {
        this.panel_unbind.active = false;
    },
    //===========================================================================================
    //邮箱检查
    checkMail(mailNum) {
        let reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/ //验证规则
        let ismailNum_matcher = reg.test(mailNum);
        if (!ismailNum_matcher) {
            glGame.panel.showErrorTip("邮箱格式错误！");
            return false;
        }
        return mailNum;
    },
    // QQ检查
    checkQQ(qqNum) {
        let reg = /^[1-9][0-9]{4,9}$/gim; //验证规则
        let isQQNum_matcher = reg.test(qqNum);
        if (!isQQNum_matcher) {
            glGame.panel.showErrorTip("QQ格式错误！");
            return false
        }
        return qqNum;
    },
    // 微信检查
    checkWX(wxNum) {
        let reg = /^[a-zA-Z\d_]{5,}$/; //验证规则
        let isWXNum_matcher = reg.test(wxNum);
        if (!isWXNum_matcher) {
            glGame.panel.showErrorTip("微信格式错误！");
            return false
        }
        return wxNum;
    },
    // 姓名检查
    checkName(nameNum) {
        if (this.checkStrLength(nameNum, 2, 12)) {
            glGame.panel.showErrorTip("姓名字符长度为2~12！");
            return false
        }
        let reg = /^[\u4E00-\u9FA5A-Za-z]+$/; //验证规则
        let isnameNum_matcher = reg.test(nameNum);
        if (!isnameNum_matcher) {
            glGame.panel.showErrorTip("姓名格式错误！");
            return false
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
        if (this.checkStrLength(nameNum, 2, 12)) {
            glGame.panel.showErrorTip("昵称字符长度为2~12！");
            return false
        }
        let reg = /^[A-Za-z0-9\u4e00-\u9fa5]+$/; //验证规则
        let isnameNum_matcher = reg.test(nameNum);
        if (!isnameNum_matcher) {
            glGame.panel.showErrorTip("昵称只能输入中文、英文和数字！");
            return false
        }
        return nameNum;
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
    // 密码检查
    checkPassword(psw, confimpsw) {
        if (!psw) {
            glGame.panel.showErrorTip(glGame.tips.REGISTRATION.PSWNULL);
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

    OnDestroy() {
        this.unregisterEvent();
    },
});

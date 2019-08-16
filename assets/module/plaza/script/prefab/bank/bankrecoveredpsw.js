/**
 * 找回银行密码
 */
glGame.baseclass.extend({
    properties: {
        phone: cc.Label,        // 手机号码
        verifi: cc.EditBox,     // 验证码
        newpsw: cc.EditBox,     // 新密码
        confirmpsw: cc.EditBox, // 确认密码
        CD: cc.Label
    },
    onLoad () {
        this.CD.string = glGame.user.verifiState ?`${glGame.user.verifiCD}s`  : "获取";
        this.registerEvent();
        this.resetData();
        this.showPanelInfo();
        this.showUI();
    },
    registerEvent () {
        glGame.emitter.on("userVerifiUpdateCD", this.updateVerifiCD, this);
    },
    unRegisterEvent () {
        glGame.emitter.off("userVerifiUpdateCD", this);
    },
    OnDestroy () {
        this.unRegisterEvent();
    },
    updateVerifiCD (data) {
        if(this.CD){
            this.CD.string = data === 0 ? "获取" : `${data}s`;
        }
    },
    // 界面数据初始化
    resetData () {
        this.phoneNumber = glGame.user.get("userName");
    },
    // 显示手机号, 屏蔽中间4位手机号
    showPanelInfo () {
        this.phone.string = this.phoneNumber.replace(this.phoneNumber.substring(3,this.phoneNumber.length-4),'****');
    },
    // 清空界面数据
    clearPanelInfo () {
        this.resetData();
        this.verifi.string = "";
        this.newpsw.string = "";
        this.confirmpsw.string = "";
    },
    showUI () {

    },
    onClick (name, node) {
        switch (name) {
            case "send": this.click_send(); break;
            case "confirm": this.click_confirm(); break;
            default: console.error("no find button name -> %s", name);
        }
    },
    // 发送验证码
    click_send () {
        this.registerEvent();
        glGame.user.sendVerificationCode({phone: this.phoneNumber, type: 3});
    },
    // 确认修改密码
    click_confirm () {
        let verifi = this.checkVerification(this.verifi.string);
        if (!verifi) return;
        let psw = this.checkPassword(this.newpsw.string, this.confirmpsw.string);
        if (!psw) return;
        this.unRegisterEvent();
        this.CD.string = "获取";
        glGame.user.reqResetPwd({phone: this.phoneNumber, password: md5(psw), re_password: md5(psw), code: verifi, type: 2}, ()=>{this.clearPanelInfo()});
    },
    // 验证码检查
    checkVerification (verif) {
        if (!verif) {
            glGame.panel.showErrorTip(glGame.tips.EDITBOX.VERIFINULL);
            return null;
        }
        return verif;
    },
    // 密码检查
    checkPassword (psw, confimpsw) {
        if (!psw) {
            glGame.panel.showErrorTip(glGame.tips.EDITBOX.PSWNULL);
            return null;
        }
        if (!/\w$/.test(psw)) {
            glGame.panel.showErrorTip(glGame.tips.EDITBOX.PSWWRONGFUL);
            return null;
        }
        if (psw !== confimpsw) {
            glGame.panel.showErrorTip(glGame.tips.EDITBOX.PSWCOFAIL);
            return null;
        }
        return psw;
    },
    set (key, value) {
        this[key] = value;
    },
    get (key) {
        return this[key];
    }
});

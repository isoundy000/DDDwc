/**
 * 修改账号登陆密码面板
 */
glGame.baseclass.extend({
    properties: {
        psw: cc.EditBox,        // 旧密码
        newpsw: cc.EditBox,     // 新密码
        confirmpsw: cc.EditBox  // 确认新密码
    },
    onLoad () {
        this.registerEvent();
    },
    registerEvent () {
        glGame.emitter.on("editpswsuccess", this.editpswsuccess, this)
    },
    OnDestroy() {
        this.unRegisterEvent();
    },
    unRegisterEvent () {
        glGame.emitter.off("editpswsuccess", this);
    },
    editpswsuccess () {
        this.remove();
    },
    onClick (name, node) {
        switch (name) {
            case "close": this.click_close(); break;
            case "confirm": this.click_confirm(); break;
            default: console.error("no find button name -> %s", name);
        }
    },
    click_close () {
        this.remove();
    },
    // 确认更改密码
    click_confirm () {
        let psw = this.checkPassword(this.psw.string, this.newpsw.string, this.confirmpsw.string);
        if (psw) {
            glGame.user.reqEditPwd({old_pwd: md5(this.psw.string), pwd: md5(this.newpsw.string), type: 1});
        }
    },
    // 密码检查
    checkPassword (psw, newpsw, confirmpsw) {
        if (!psw) return this.showErrorTip(glGame.tips.EDITBOX.PSWNULL);
        if (!/\w$/.test(psw)) return this.showErrorTip(glGame.tips.EDITBOX.PSWWRONGFUL);
        if (!newpsw) return this.showErrorTip(glGame.tips.EDITBOX.NEWPSWNULL);
        if (!/\w$/.test(newpsw)) return this.showErrorTip(glGame.tips.EDITBOX.NEWPSWWRONGFUL);
        if (!confirmpsw) return this.showErrorTip(glGame.tips.EDITBOX.CONFIRMPSWNULL);
        if (!/\w$/.test(confirmpsw)) return this.showErrorTip(glGame.tips.EDITBOX.CONFIRMPSWWRONGFUL);
        if (psw === newpsw) return this.showErrorTip(glGame.tips.EDITBOX.OLDNEWPSWEQUALS);
        if (newpsw !== confirmpsw) return this.showErrorTip(glGame.tips.EDITBOX.PSWCOFAIL);
        return psw;
    },
    showErrorTip (msg) {
        glGame.panel.showTip(msg);
        this.clearUIData();
        return null;
    },
    clearUIData () {
        // this.psw.string = "";
        // this.newpsw.string = "";
        // this.confirmpsw.string = "";
    }
});
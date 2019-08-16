/**
 * 修改银行密码
 */
glGame.baseclass.extend({
    properties: {
        usedpsw: cc.EditBox,    // 旧密码
        newpsw: cc.EditBox,     // 新密码
        confirmpsw: cc.EditBox  // 确认新密码
    },
    onLoad() {
        glGame.emitter.on("editpswsuccess", this.editpswsuccess, this);
    },
    onClick(name, node) {
        switch (name) {
            case "confirm": this.click_confirm(); break;
            default: console.error("no find button name -> %s", name);
        }
    },
    click_confirm() {
        let psw = this.checkPassword(this.usedpsw.string, this.newpsw.string, this.confirmpsw.string);
        if (psw) {
            glGame.user.reqEditPwd(psw);
        }
    },
    editpswsuccess() {
        this.usedpsw.string = "";
        this.newpsw.string = "";
        this.confirmpsw.string = "";
    },
    // 密码检查
    checkPassword(usedpsw, newpsw, confirmpsw) {
        if (!usedpsw) {
            glGame.panel.showErrorTip("请输入旧密码");
            return null;
        }
        if (!/\w$/.test(usedpsw)) {
            glGame.panel.showErrorTip(glGame.tips.EDITBOX.PSWWRONGFUL);
            return null;
        }
        if (!newpsw) {
            glGame.panel.showErrorTip("请输入新密码");
            return null;
        }
        if (!/\w$/.test(newpsw)) {
            glGame.panel.showErrorTip(glGame.tips.EDITBOX.NEWPSWWRONGFUL);
            return null;
        }
        if (!confirmpsw) {
            glGame.panel.showErrorTip("请输入确认密码");
            return null;
        }
        if (!/\w$/.test(confirmpsw)) {
            glGame.panel.showErrorTip(glGame.tips.EDITBOX.CONFIRMPSWWRONGFUL);
            return null;
        }
        if (usedpsw === newpsw) {
            glGame.panel.showErrorTip(glGame.tips.EDITBOX.OLDNEWPSWEQUALS);
            return null;
        }
        if (newpsw !== confirmpsw) {
            glGame.panel.showErrorTip(glGame.tips.EDITBOX.PSWCOFAIL);
            return null;
        }
        return { old_pwd: md5(usedpsw), pwd: md5(newpsw), type: 2 };
    },
    set(key, value) {
        this[key] = value;
    },
    get(key) {
        return this[key];
    },
    OnDestroy() {
        glGame.emitter.off("editpswsuccess", this);
    },
});

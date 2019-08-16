const TITLE = {
    "": 0,
    "提示": 0,
    "错误": 1,
}
glGame.baseclass.extend({
    properties: {
        node_cancel: cc.Node,
        cancel_label: cc.Label,
        node_confirm: cc.Node,
        confirm_label: cc.Label,
        lab_content: cc.Label,
        richText_content: cc.RichText,
        title_list: [cc.SpriteFrame],
        sprite_title: cc.Sprite,
    },
    onLoad() {
        this.node.zIndex = 1000;
        this.confirm = null;
        this.cancel = null;
        this.registerEvent();
    },
    registerEvent() {
        glGame.emitter.on("onStartGame", this.onStartGame, this);
    },
    unRegisterEvent() {
        glGame.emitter.off("onStartGame", this);
    },
    OnDestroy() {
        this.unRegisterEvent();
    },

    onClick(name, node) {
        switch (name) {
            case "close": this.cancel(); break;
            case "confirm": this.confirm(); break;
            default: console.error("no find button name -> %s", name);
        }
        this.remove();
    },
    /**
     * @param title 标题
     * @param content 提示内容
     * @param isSingle 是否显示单个确定按钮
     * @param next 确定回调
     * @param cancel 取消回调
     * @param cancel_label 取消按钮文本
     * @param confirm_label 确定按钮文本
     */
    showMsg(title, content, isSingle, next, cancel, cancel_label, confirm_label, center = false) {
        this.confirm = next || function () { };
        this.cancel = cancel || function () { this.node.destroy() };
        this.setType(isSingle);
        this.sprite_title.spriteFrame = this.title_list[TITLE[title]] ? this.title_list[TITLE[title]] : this.title_list[0];
        if (~content.indexOf("<color=")) {
            this.lab_content.node.active = false;
            this.richText_content.node.active = true;
            this.richText_content.string = content;
        } else {
            this.lab_content.string = content;
        }
        this.lab_content._updateRenderData(true);
        if (this.lab_content.node.height > 60) {
            this.lab_content.horizontalAlign = 0;
        }
        if (center) {
            this.lab_content.horizontalAlign = 1;
        }
        if (confirm_label) this.confirm_label.string = confirm_label;
    },

    onStartGame() {
        this.remove();
    },
    //显示类型
    setType(isSingle) {
        if (isSingle) {
            this.node_cancel.active = false;
            this.node_confirm['_firstX'] = this.node_confirm.x;
            this.node_confirm.x = 0;
        } else {
            this.node_cancel.active = true;
            if (this.node_confirm['_firstX']) this.node_confirm.x = this.node_confirm['_firstX'];
        }
    }
});

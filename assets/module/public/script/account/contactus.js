
glGame.baseclass.extend({
    properties: {
        lab_content: cc.Label,
    },
    onLoad() {
        this.node.zIndex = 1000;
        this.confirm = null;
        this.cancel = null;
    },
    OnDestroy() {
    },

    onClick(name, node) {
        switch (name) {
            case "confirm": this.confirm(); break;
            case "close": this.cancel(); break;
            default: console.error("no find button name -> %s", name);
        }
        if (this.bolOff || name == "close") this.remove();
    },
    /**
     * @param bol    是否在点击界面进行关闭
     * @param content 提示内容
     * @param next 确定回调
     * @param cancel 取消回调
     */
    showMsg(bol, content, next, cancel) {
        this.bolOff = bol
        this.confirm = next || function () { };
        this.cancel = cancel || function () { };
        this.lab_content.string = content;
        //单行
        if (this.lab_content.node.height <= this.lab_content.lineHeight) {
            this.lab_content.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            // this.lab_content.node.y = 50;
        } else {
            this.lab_content.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            // this.lab_content.node.y = 110;
        }
    },

});

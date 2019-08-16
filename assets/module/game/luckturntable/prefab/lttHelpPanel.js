glGame.baseclass.extend({
    properties: {
        webContent: cc.WebView,
    },

    onLoad() {
        this.toggleCB(1);
    },

    start() {

    },

    onClick(ButtonName) {
        switch (ButtonName) {
            case "1": case "2": case "3": this.toggleCB(ButtonName); break;
            case "closeBtn": this.removeSelf(); break;
        }
    },

    toggleCB(index) {
        // http://192.168.1.240:86/gamerule/luckturntable/1.html
        this.webContent.url = glGame.servercfg.getGameRuleURL(index);
    },

    removeSelf() {
        this.remove();
    }
    // update (dt) {},
});

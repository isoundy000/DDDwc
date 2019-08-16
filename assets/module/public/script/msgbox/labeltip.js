glGame.baseclass.extend({
    properties: {
        content: cc.Label,
        bg_node: cc.Node,
    },
    onLoad() {
        this.allTimeout = [];
    },
    showTip(content, _time) {
        let time = _time * 1000;
        this.content.string = content;
        this.content._updateRenderData(true);
        this.bg_node.width = this.content.node.width + 320;
        this.content.node.color = new cc.Color(255, 255, 255);
        this.allTimeout.push(setTimeout(() => {
            this.remove();
        }, time));
    },

    changeBgWidth() {
        this.allTimeout.push(setTimeout(() => {
            this.bg_node.width = this.content.node.width + 320;
        }, 0.01))
    },

    showErrorTip(content, next) {
        this.content.string = content;
        this.content._updateRenderData(true);
        this.bg_node.width = this.content.node.width + 320;
        this.content.node.color = new cc.Color(255, 108, 0);
        this.allTimeout.push(setTimeout(() => {
            if (next) next();
            this.remove();
        }, 1000));
    },
    OnDestroy() {
        let count = this.allTimeout.length;
        for (let i = 0; i < count; i++) {
            clearTimeout(this.allTimeout[i]);
        }
    },
});

glGame.baseclass.extend({

    properties: {
        urgentnotice: cc.Node,
        content: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.reqEmergentNotice();
        glGame.emitter.on("newrotice", this.newrotice, this);
    },
    onClick(name, node) {
        console.log("这是当前按键的按钮名字", name)
        switch (name) {
            case "Background":
                this.reqIgnoreEmergentNotice();
                break;
            case "close":
                glGame.panel.showFirstEnterPanel();
                glGame.isfirstEnterPlaza = false;
                this.urgentnotice.active = false;
                break;
        }
    },
    newrotice() {
        this.reqEmergentNotice();
    },
    //紧急公告请求
    reqEmergentNotice() {
        glGame.gameNet.send_msg("http.reqEmergentNotice", {}, (route, msg) => {
            console.log("这是当前紧急公告的消息", msg)
            if (msg.result.content) {
                this.urgentnotice.active = true;
                this.content.string = `${msg.result.content}`
            } else {
                this.urgentnotice.active = false;
                glGame.panel.showFirstEnterPanel();
                glGame.isfirstEnterPlaza = false;
            }
        })
    },
    //不显示紧急公告
    reqIgnoreEmergentNotice() {
        glGame.gameNet.send_msg("http.reqIgnoreEmergentNotice", {}, (route, msg) => {
            console.log("不再显示紧急公告请求成功")
        })
    },
    OnDestroy() {
        glGame.emitter.off("newrotice", this);
    }
});

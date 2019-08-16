glGame.baseclass.extend({

    properties: {
        BGM:{
            type:cc.AudioClip,
            default: null
        },
        audio_welcome:{
            type:cc.AudioClip,
            default: null
        },
        prefab_up: cc.Prefab,
        prefab_center: cc.Prefab,
        prefab_down: cc.Prefab,
        prefab_banner: cc.Prefab,
        game_web: cc.WebView,
    },

    onLoad() {

        if (!glGame.user.get("url")) {
            glGame.user.reqUrl();
        }
        glGame.user.ReqRedDot();
        glGame.panel.closeLoading();
        if (glGame.isfirstEnterPlaza) {
            glGame.audio.playSoundEffect(this.audio_welcome, true);
        }
        glGame.emitter.on("plazaOpen", this.plazaOpen, this);
        // glGame.emitter.on("cantWithdraw", this.cantWithdraw, this);
        glGame.emitter.on("gameWebStart", this.gameWebStart, this);

        if (glGame.isPlayPlazaBGM) {
            glGame.audio.playBGM(this.BGM);
            glGame.isPlayPlazaBGM = false;
        }

        glGame.user.reqUnread();
        glGame.user.reqMyInfo();
        //大厅主要预支初始化
        glGame.panel.showChildPanel(this.prefab_up, this.node);
        glGame.panel.showChildPanel(this.prefab_center, this.node);
        glGame.panel.showChildPanel(this.prefab_down, this.node);
        glGame.panel.showChildPanel(this.prefab_banner, this.node);
        var scheme = "onclosegameview";
        this.game_web.setJavascriptInterfaceScheme(scheme);
        this.game_web.setOnJSCallback(this.jsCallback.bind(this));
    },

    jsCallback(url){
        this.game_web.url="";
        this.game_web.node.active = false;
        glGame.audio.continueAllMusic();
    },

    gameWebStart(data){
        if (!isEnableHotUpdate) {
            return;
        }
        this.game_web.node.active = true;
        console.log("aaaaaaa", `${glGame.gamelistcfg.getWebGameUrl()}?src=${data.url}&id=1`)
        this.game_web.url=`${glGame.gamelistcfg.getWebGameUrl()}?src=${data.url}&id=1`;
        glGame.audio.pauseAllMusic();
    },

    plazaOpen(nodeName) {
        if (nodeName) {
            this.node.active = true;
            return;
        }
        glGame.panel.revertCloseNodeEffect(this.node, 2)
    },
    // cantWithdraw() {
    //     glGame.panel.showMsgBox("", "您的账号已被禁止取现，详情请联系客服！")
    // },
    OnDestroy() {
        glGame.emitter.off("plazaOpen", this);
        // glGame.emitter.off("cantWithdraw", this);
        glGame.emitter.off("gameWebStart", this);
    },
});

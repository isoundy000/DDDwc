glGame.baseclass.extend({
    properties: {
        scrollview: cc.Node,
        nextNode: cc.Node,    // 游戏图标滑动列表
        btnWebGame: cc.Node,
    },
    onLoad() {
        // 向 php 获取到当前游戏配置数量后进行UI展现
        glGame.gamelistcfg.initGameList(() => {
            glGame.gamelistcfg.reqGameGroup(() => {
                this.initList();
            })
        });
    },

    initList() {
        let gameList = glGame.gamelistcfg.get("gameList");
        let gameGroup = glGame.gamelistcfg.getGameGroup();
        if (gameList && gameGroup) {
            glGame.fileutil.readPrefab(glGame.panel.plazaPanelDict["gameitem"]).then(prefab => {
                let count = gameGroup.length;
                for (let i = 0; i < count; i++) {
                    let panel = glGame.panel.showPanel(prefab);
                    panel.getComponent(panel.name).initUI(gameGroup[i]);
                    //判定客户端是否有相关游戏配置
                    if (panel.getComponent(panel.name).checkGame(gameGroup[i]) != -1) panel.parent = this.nextNode;
                    if (i == count - 1) {
                        glGame.emitter.emit("showTour");
                    }
                }
                
                //外接游戏渲染
                if (!isEnableHotUpdate) return;
                let webgameList = glGame.gamelistcfg.getWebGamelistType();
                if (!webgameList) return;
                let webGamecount = webgameList.length;
                for (let i=0; i < webGamecount; i++) {
                    let newPrefab = cc.instantiate(this.btnWebGame);
                    newPrefab.parent = this.nextNode;
                    newPrefab.name = "webgame" + i;
                    newPrefab.active = true;
                    glGame.panel.showRemoteImage(newPrefab.getChildByName("mask").getChildByName("bg"), webgameList[i].img);
                }
            });
        }
    },

    onClick(name, node) {
        switch (name) {
            default:
                if (!isEnableHotUpdate) break;
                if (name.indexOf("webgame") !== -1) {
                    let str = name.split("webgame"),
                        gameList = glGame.gamelistcfg.getWebGamelistType(),
                        gamedata = gameList[Number(str[str.length-1])];
                    glGame.emitter.emit("gameWebStart", {url:gamedata.url});
                }
        }
    },

    OnDestroy() {

    },
});

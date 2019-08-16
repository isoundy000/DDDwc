/**
 * 场景管理器
 */
let Scene = function () {
    this.upScene = "";
    this.registerEvent();
},
    scene = Scene.prototype,
    g_instance = null;

scene.registerEvent = function () {
};
scene.unRegisterEvent = function () {
};
scene.setNextSceneTag = function (tag) {
    console.log("这是当前设置nextscene", tag)
    glGame.storage.setItem(glGame.scenetag.NEXTSCENETAG, { nextSceneTag: tag });
};
scene.getSceneNameByID = function (ID) {
    return this.sceneDict[ID];
};
/**
 * 切换到下一个场景
 */
scene.enterNextScene = function () {
    return new Promise((resolve, reject) => {
        this.upScene = cc.director.getScene().name;
        let nextSceneTag = glGame.storage.getItem(glGame.scenetag.NEXTSCENETAG) || glGame.scenetag.PLAZA,
            nextSceneName = glGame.scene.getSceneNameByID(nextSceneTag.nextSceneTag),
            publicPreload = ((nextSceneName !== "plaza" && nextSceneName !== "login" && !glGame.panel.preloadPlazaState())),
            plazaPreload = (nextSceneName === "plaza" && !glGame.panel.preloadPlazaState());

        if (nextSceneName === "plaza") glGame.panel.changeRollNoticeState(false);
        if (nextSceneName !== "plaza" || plazaPreload)
            glGame.panel.showLoading();
        glGame.emitter.emit("hideCleanupCache");

        if (plazaPreload) {
            //预加载大厅资源
            glGame.panel.preloadplazaPublicMode().then(() => {
                this.switchScene(resolve, nextSceneName);
            })
        } else if (publicPreload) {
            glGame.panel.preloadPublicMode().then(() => {
                this.switchScene(resolve, nextSceneName);
            })
        } else {
            this.switchScene(resolve, nextSceneName);
        }
    })
};


/**
 * 切换游戏
 * @param gameID
 */
scene.switchGame = function (gameID) {
    // if (cc.sys.isNative) {
    //     console.log("重置前的搜索路径", JSON.stringify(jsb.fileUtils.getSearchPaths()));
    //     let nextSearchPaths = [glGame.gamelistcfg.getGameSearchPaths(gameID)];
    //     cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(nextSearchPaths));
    //     jsb.fileUtils.setSearchPaths(nextSearchPaths);
    //     console.log("重置后的搜索路径", JSON.stringify(jsb.fileUtils.getSearchPaths()));
    //     reStartGame();
    // } else {
    //     glGame.room.reqMyRoomState();
    // }
    glGame.room.reqMyRoomState();
};


scene.switchScene = function (resolve, nextSceneName) {
    //只在游戏内显示debug
    // if (glGame.isDevelop) {
    //     let debug = glGame.panel.showDebug();
    //     if (nextSceneName == "plaza" || nextSceneName == "login") {
    //         debug.active = false;
    //     } else {
    //         debug.active = true;
    //     }
    // }
    // if ("plaza" === nextSceneName) {
        console.log("preloadScene", nextSceneName);
        cc.director.preloadScene(nextSceneName, () => {
            if ("plaza" !== nextSceneName) {
                //glGame.animation.switchAnimationPath(nextSceneName);
            }
            console.log("loadScene", nextSceneName);
            cc.director.loadScene(nextSceneName, () => {
                glGame.systemclass.iphonex();
                cc.sys.garbageCollect();
                resolve()
                console.log("loadScene win", nextSceneName);
            });
        });
    // } else {
    //     cc.loader.downloader.loadSubpackage(nextSceneName, (err)=>{
    //         if (err) {
    //             return console.warn(err);
    //         }
    //         console.log("加载子包成功");
    //         resolve();
    //     })
    // }

    
}

scene.getUpScene = function () {
    for (let key in this.sceneDict) {
        if (this.upScene == this.sceneDict[key]) return parseInt(key);
    }
    return 0;
}

/**
 * 重新加载场景
 */
scene.enterNowScene = function () {
    cc.director.loadScene(cc.director.getScene().name, () => { }, () => {
        setTimeout(() => {
            glGame.systemclass.iphonex();
        }, 1000)
        glGame.emitter.emit("gl.sceneUi");
    });
};




module.exports = function () {
    if (!g_instance) {
        g_instance = new Scene();
    }
    return g_instance;
};

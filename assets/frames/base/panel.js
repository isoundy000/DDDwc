
let
    panelPaths = require('panelpaths'),
    actionDir = { up: 0, down: 1, left: 2, right: 3, close: 4, none: 5 },
    Panel = function () {
        this.resetData();
        this.juhuaoff = false;
    },
    panel = Panel.prototype,
    g_instance = null;

panel.resetData = function () {
    this.needEffectPanels = ["popularize", "announcement", "withdrawal", "email"
        , "yubao", "bank", "backWater", "userinfo", "service", "shop"];
    this.preload_plaza = 0;
    this.curPrefabSearchPaths = null;
    this.compelprefab = null;
    this.curScenePrefabDict = {};
    this.publicPanelDict = {};
    this.plazaPanelDict = {};
    this.iconList = {};
    this.juhuaPanel = null;
    this.rollnoticePanel = null;
    this.newenter = true;// 保存公告是否显示
};
panel.isNeedEffect = function (panelName) {
    for (let i = 0; i < this.needEffectPanels.length; i++) {
        if (this.needEffectPanels[i] == panelName) return true;
    }
    return false;
};

panel.showPanelEffect = function (openNode, openDir, closeNode) {
    if (openNode.getComponent(cc.Widget)) {
        openNode.getComponent(cc.Widget).updateAlignment();
    }
    let posY = openNode.height;
    let posX = openNode.width;
    let posArr = [cc.v2(posX, posY / 2 + posY), cc.v2(posX, posY / 2 - posY)
        , cc.v2(posX / 2 - posX, posY / 2), cc.v2(posX / 2 + posX, posY / 2)]
    openNode.pauseSystemEvents(true);
    if (closeNode) closeNode.pauseSystemEvents(true);
    let act1 = cc.moveTo(0, posArr[openDir].x, posArr[openDir].y),
        act2 = cc.fadeIn(0),
        act3 = cc.moveTo(0.3, posX / 2, posY / 2),
        act4 = cc.callFunc(() => {
            glGame.emitter.emit(`${openNode.name}ActionEnd`)
            openNode.resumeSystemEvents(true);
        });
    let act = cc.sequence(act1, act2, act3, act4);
    openNode.runAction(act.easing(cc.easeOut(2)));
    if (closeNode) {
        this.closePanelEffect(closeNode, openDir)
    }
};

panel.closePanelEffect = function (closeNode, dir) {
    if (!closeNode.active) return;
    // closeNode.pauseSystemEvents(true);
    let oriPos = closeNode.position;
    let posY = closeNode.height / 4;
    let posX = closeNode.width / 4;
    let actionArr = [cc.moveBy(0.3, 0, -posY)
        , cc.moveBy(0.3, 0, posY)
        , cc.moveBy(0.3, posX, 0)
        , cc.moveBy(0.3, -posX, 0)];
    let endCallback = () => {
        closeNode.resumeSystemEvents(true)
        closeNode.active = false;
    }
    closeNode.runAction(cc.sequence(actionArr[dir], cc.callFunc(endCallback)));
};

panel.revertOpenNodeEffect = function (openNode, dir) {
    return new Promise((resolve, reject) => {
        openNode.pauseSystemEvents(true);
        let openNodeY = openNode.height,
            openNodeX = openNode.width;
        let actArr = [cc.moveBy(0.3, 0, -openNodeY)
            , cc.moveBy(0.3, 0, openNodeY)
            , cc.moveBy(0.3, openNodeX, 0)
            , cc.moveBy(0.3, -openNodeX, 0)];
        let actEndCallback = () => {
            openNode.resumeSystemEvents(true);
            glGame.user.ReqRedDot();
            resolve();
        }
        let act = cc.sequence(actArr[dir], cc.callFunc(actEndCallback));
        openNode.runAction(act.easing(cc.easeOut(2)));
    })
};

panel.revertCloseNodeEffect = function (closeNode, dir) {
    if (closeNode.active) return;
    closeNode.pauseSystemEvents(true);
    let closeNodeY = closeNode.height,
        closeNodeX = closeNode.width;
    closeNode.active = true;
    closeNode.runAction(cc.sequence(cc.moveTo(0.3, closeNodeX / 2, closeNodeY / 2), cc.callFunc(() => {
        closeNode.resumeSystemEvents(true);
    })));
};

/**
 * @param prefab 界面预制
 * @param isEffect 是否使用开界面动画
 * @param dir 动画防线
 * @Explain 打开一个界面
 * @Explain isEffect和dir参数,可选用
 * 非大厅界面closePanelEffect功能需手动调用
 */
panel.showPanel = function (prefab, isEffect, dir) {
    let newPrefabLayer = cc.instantiate(prefab);
    newPrefabLayer.opacity = isEffect ? 0 : 255;
    newPrefabLayer.parent = cc.director.getScene();
    console.log("scene", prefab.name, isEffect, dir,cc.director.getScene().name);
    let closeNode = null;
    if ("plaza" == cc.director.getScene().name) {
        closeNode = cc.director.getScene().getChildByName("plaza_hall");
        if (cc.director.getScene().getChildByName("longhudouentry")) {
            closeNode.active = false;
        }
    }
    if (isEffect) {
        this.showPanelEffect(newPrefabLayer, dir, closeNode);
        return newPrefabLayer;
    }
    return newPrefabLayer;
};
/**
 * @param panelName 界面预制名称
 * @Explain 打开一个界面
 */
panel.showPanelByName = function (panelName) {
    return new Promise((resolve, reject) => {
        if (this.plazaPanelDict.hasOwnProperty(panelName)) {
            glGame.fileutil.readPrefab(this.plazaPanelDict[panelName]).then(prefab => {
                if (this.isNeedEffect(panelName)) {
                    resolve(this.showPanel(prefab, true, actionDir.right));
                } else if (panelName == "longhudouentry") {
                    resolve(this.showPanel(prefab, false, actionDir.close));
                } else {
                    resolve(this.showPanel(prefab));
                }
            });
        }
    });
};
/**
 * @param prafab 界面预制
 * @Explain 关闭一个界面
 */
panel.closePanel = function (prafab) {
    let curScene = cc.director.getScene();
    let prefabLayer = curScene.getChildByName(prafab.name);
    if (!prefabLayer) return console.error("无法关闭没有打开的界面");
    if (!cc.isValid(prefabLayer)) prefabLayer.destroy();
};

/**
 * @param prefab 预制对象
 * @param parent 父节点
 * @param tag 标记
 * @Explain 创建一个子节点
 */
panel.showChildPanel = function (prefab, parent, tag) {
    let newPrefabLayer = cc.instantiate(prefab);
    if (tag) {
        let script = newPrefabLayer.getComponent(newPrefabLayer.name);
        script.set("fromTag", tag);
    }
    newPrefabLayer.parent = parent;
    return newPrefabLayer;
};
/**
 * @param panelName 预制对象名字
 * @param parent 父节点
 * @param tag 标记
 * @Explain 创建一个子节点
 * @returns {Promise<any>}
 */
panel.showChildPanelByName = function (panelName, parent, tag) {
    return new Promise((resolve, reject) => {
        if (this.plazaPanelDict.hasOwnProperty(panelName)) {
            glGame.fileutil.readPrefab(this.plazaPanelDict[panelName]).then(prefab => {
                resolve(this.showChildPanel(prefab, parent, tag));
            });
        }
    });
};
/**
 * @param fromTag
 * @param parent
 * @Explain 删除一个子节点
 */
panel.closeChildPanel = function (fromTag, parent) {
    let children = parent.children;
    if (!children) return;
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        let script = child.getComponent(child.name);
        if (!script) continue;
        let childTag = script.get("fromTag");
        if (childTag === fromTag) {
            return child.destroy();
        }
    }
};


//强制预加载的文件
panel.compelPreload = function (name) {
    if (this.compelprefab == null) {
        if (!panelPaths) return console.log(`public还没有配置动态加载资源的文件`);
        if (!panelPaths["paths"]) return false;
        if (!panelPaths["paths"]["compelprefab"]) return false;
        this.compelprefab = panelPaths["paths"]["compelprefab"];
    }
    for (let key in this.compelprefab) {
        if (!this.compelprefab[key]) continue
        if (name == this.compelprefab[key]) return true;
    }
    return false;
}

//判定当前大厅需要预加载的预支是否加载完毕
panel.preloadPlazaState = function () {
    let count = Object.keys(this.plazaPanelDict).length;
    return count > 0;
};

//判定当前大厅需要预加载的预支是否加载完毕
panel.preloadPlazaCount = function () {
    return this.preload_plaza;
};

//合并预加载通用和大厅资源模块
panel.preloadplazaPublicMode = function () {
    if (!panelPaths) return console.log(`public还没有配置动态加载资源的文件`);
    if (!panelPaths["paths"]) return;
    if (!panelPaths["paths"]["plazaprefab"]) return;
    let publicPaths = panelPaths["paths"]["prefab"];
    let plazaPaths = panelPaths["paths"]["plazaprefab"];

    //预加载基数
    var preload_count = this.preload_plaza = Object.keys(plazaPaths).length - 1 + Object.keys(publicPaths).length;;

    let basepaths = plazaPaths['base'];

    //预加载回调
    let ofend = (resolve) => {
        preload_count--;
        glGame.emitter.emit("plazaloading", { count: preload_count });
        if (preload_count <= 0) resolve();
    };
    //Object.keys
    return new Promise((resolve, reject) => {

        glGame.emitter.emit("plazaloading", { count: preload_count });
        //提示内容 弹窗形式
        for (let key in publicPaths) {
            this.publicPanelDict[key] = publicPaths[key];
            if (glGame.isbeforehand || this.compelPreload(key)) {
                glGame.fileutil.readPrefab(this.publicPanelDict[key]).then(() => {
                    ofend(resolve);
                });
            } else ofend(resolve);
        }
        //提示内容 弹窗形式
        for (let key in plazaPaths) {
            if (key === 'base') continue;
            this.plazaPanelDict[key] = basepaths + plazaPaths[key];
            if (glGame.isbeforehand || this.compelPreload(key)) {
                glGame.fileutil.readPrefab(this.plazaPanelDict[key]).then(() => {
                    ofend(resolve);
                });
            } else ofend(resolve);
        }
    });
}


//预加载大厅资源模块
panel.preloadplazaMode = function () {
    if (!panelPaths) return console.log(`public还没有配置动态加载资源的文件`);
    if (!panelPaths["paths"]) return;
    if (!panelPaths["paths"]["plazaprefab"]) return;
    let plazaPaths = panelPaths["paths"]["plazaprefab"];

    //预加载基数
    var preload_count = this.preload_plaza = Object.keys(plazaPaths).length - 1;

    let basepaths = plazaPaths['base'];

    //预加载回调
    let ofend = (resolve) => {
        preload_count--;
        glGame.emitter.emit("plazaloading", { count: preload_count });
        if (preload_count <= 0) resolve();
    };
    //Object.keys
    return new Promise((resolve, reject) => {

        glGame.emitter.emit("plazaloading", { count: preload_count });
        //提示内容 弹窗形式
        for (let key in plazaPaths) {
            if (key === 'base') continue;
            this.plazaPanelDict[key] = basepaths + plazaPaths[key]
            if (glGame.isbeforehand || this.compelPreload(key)) {
                glGame.fileutil.readPrefab(this.plazaPanelDict[key]).then(() => {
                    ofend(resolve);
                });
            } else ofend(resolve);
        }
    });
}

//预加载公共模块
panel.preloadPublicMode = function () {
    if (!panelPaths) return console.log(`public还没有配置动态加载资源的文件`);
    if (!panelPaths["paths"]) return;
    if (!panelPaths["paths"]["prefab"]) return;
    let publicPaths = panelPaths["paths"]["prefab"];

    //预加载基数
    var preload_count = Object.keys(publicPaths).length;

    //预加载回调
    let ofend = (resolve) => {
        preload_count--;
        if (preload_count <= 0) resolve();
    };
    //Object.keys
    return new Promise((resolve, reject) => {
        //提示内容 弹窗形式
        for (let key in publicPaths) {
            this.publicPanelDict[key] = publicPaths[key];

            if (glGame.isbeforehand || this.compelPreload(key)) {
                glGame.fileutil.readPrefab(this.publicPanelDict[key]).then(() => {
                    ofend(resolve);
                });
            } else ofend(resolve);
        }
    });
};

/**
 * 进入前需要预加载的优先模块
 */
panel.preloadLoinMode = function () {
    if (!panelPaths) return console.log(`public 还没有配置动态加载资源的文件`);
    if (!panelPaths["paths"]) return;
    if (!panelPaths["paths"]["loinprefab"]) return;
    let publicPaths = panelPaths["paths"]["loinprefab"];

    //预加载基数
    var preload_count = Object.keys(publicPaths).length;

    //预加载回调
    let ofend = (resolve) => {
        preload_count--;
        if (preload_count <= 0) resolve();
    };
    //Object.keys
    return new Promise((resolve, reject) => {
        //提示内容 弹窗形式
        for (let key in publicPaths) {
            this.publicPanelDict[key] = publicPaths[key];
            if (key == "juhua") {
                glGame.fileutil.readPrefab(this.publicPanelDict[key]).then(prefab => {
                    this.juhuaPanel = prefab;
                    ofend(resolve);
                });
                continue;
            }
            if (key == "rollnotice") {
                glGame.fileutil.readPrefab(this.publicPanelDict[key]).then(prefab => {
                    this.rollnoticePanel = prefab;
                    ofend(resolve);
                });
                continue;
            }
            glGame.fileutil.readPrefab(this.publicPanelDict[key]).then(() => {
                ofend(resolve);
            });
        }

    });
};

panel.getCommonPrefab = function (_name) {
    if (this.publicPanelDict[_name]) return this.publicPanelDict[_name];
    return panelPaths["paths"]["prefab"][_name];
};

panel.getLoinPrefab = function (_name) {
    if (this.publicPanelDict[_name]) return this.publicPanelDict[_name];
    return panelPaths["paths"]["loinprefab"][_name];
};

panel.getPlazaPrefab = function (_name) {
    if (this.plazaPanelDict[_name]) return this.plazaPanelDict[_name];
    return panelPaths["paths"]["plazaprefab"]["base"] + panelPaths["paths"]["plazaprefab"][_name];
};

panel.PrefabRelease = function (_name) {
    let prefab = "";
    switch (_name) {
        //常用不做清理
        case "juhua":
        case "room_juhua":
        case "rollnotice":
        case "labeltip":
        //游戏内子界面不做清理
        case "setting":
        case "gamerule":
        case "record":
            return;
    }
    if (this.compelPreload(_name) || !cc.sys.isNative) return;
    if (this.plazaPanelDict[_name]) prefab = this.plazaPanelDict[_name];
    else if (this.publicPanelDict[_name]) prefab = this.publicPanelDict[_name];
    if (prefab != "") glGame.fileutil.releasePrefab(prefab);
}

/**
 * 获取界面时间
 * @param {String} key
 * @returns {Object}
 */
panel.get = function (key) {
    return this[key];
};
panel.set = function (key, value) {
    this[key] = value;
};
module.exports = function () {
    if (!g_instance) {
        g_instance = new Panel();
    }
    return g_instance;
};

let
    Animation = function () {
        this.resetData();
    },
    animation = Animation.prototype,
    g_instance = null;

animation.resetData = function () {
    this.animationCache = {};
    this.animationPaths = {};
};
/**
 * 切换 prefab 加载路径
 * @param sceneName
 */
animation.switchAnimationPath = function (sceneName) {
    // if (cc.sys.isNative) this.releaseCurSceneAllRes();
    // let panelPaths = require(`${sceneName}panelpaths`);
    // if (!panelPaths) return console.log(`场景名字为 ${sceneName} 的游戏还没有配置动态加载动画的文件`);
    // console.log("切换 animation 加载路径", panelPaths);
    // if (!panelPaths["paths"]) return;
    // if (!panelPaths["paths"]["animation"]) return;
    // this.animationPaths = panelPaths["paths"]["animation"];
};
/**
 * 释放当前场景 load 进来的 animation 引用资源
 */
animation.releaseCurSceneAllRes = function () {
    if (!this.animationCache) return;
    for (let key in this.animationCache) {
        if (!this.animationCache.hasOwnProperty(key)) continue;
        let deps = cc.loader.getDependsRecursively(this.animationCache[key]);
        cc.loader.release(deps);
        delete this.animationCache[key];
    }
};

animation.playGameItemEffect = function (animationNode, effectName) {
    return new Promise((resolve, reject)=>{
        let play = () => {
            animationNode.addClip(this.animationCache[effectName], effectName);
            animationNode.play(effectName);
            animationNode.node.active = true;
            resolve();
        };
        if (this.animationCache.hasOwnProperty(effectName)) {
            play();
        } else {
            glGame.fileutil.readAnimation(`${this.animationPaths["base"]}${this.animationPaths["gameitem"]}${effectName}`).then(animation => {
                this.animationCache[effectName] = animation;
                play();
            })
        }
    });
};

module.exports = function () {
    if (!g_instance) {
        g_instance = new Animation();
    }
    return g_instance;
};
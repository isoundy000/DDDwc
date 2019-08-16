let
    GameListCfg = function () {
        this.resetData();
    },
    gameListCfg = GameListCfg.prototype,
    g_instance = null;

gameListCfg.resetData = function () {
    this.gameList = null;
    this.loadedGame = {};
    this.gameupdate = [];
    if (cc.sys.isNative) {

        let base_path = "master/subpackages/";//"master/res/raw-assets/modules/games/";
        let rootPath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + base_path;
        this.gamesSearchPaths = {
            2: rootPath + "plaza", 15: rootPath + "zhajinhua", 18: rootPath + "qznn",
            22: rootPath + "brnn", 27: rootPath + "sangong", 28: rootPath + "honghei",
            29: rootPath + "shuiguoji", 30: rootPath + "longhudou", 31: rootPath + "laba",
            32: rootPath + "baijiale", 33: rootPath + "paijiu", 34: rootPath + "luckturntable",
            35: rootPath + "dzpk", 36: rootPath + "ddz",
            37: rootPath + "jszjh", 38: rootPath + "esyd", 39: rootPath + "ebg", 40: rootPath + "fish",
            41: rootPath + "qhbjl", 42: rootPath + "sss", 43: rootPath + 'hcpy', 44: rootPath + 'slwh'
        }
    }
};
gameListCfg.initGameList = function (next) {
    glGame.gameNet.send_msg("http.reqGameList", null, (route, data) => {
        this.gameList = data.result;
        cc.log("拉取下来的游戏列表，", this.gameList)
        next();
    })
};


gameListCfg.reqGameGroup = function (next) {
    glGame.gameNet.send_msg("http.ReqGameGroup", null, (route, data) => {
        this.gametypeList = data.game;
        this.webGameUrl = data.url;
        cc.log(data);
        next();
    })
};

//通过对比，拿到有用的游戏数据
gameListCfg.getGameGroup = function () {
    this.GameGroup = [];
    let gametypeList = this.gametypeList[0].game;
    for (let j = 0; j < gametypeList.length; j++) {
        for (let i = 0; i < this.gameList.length; i++) {
            if (gametypeList[j] == this.gameList[i].id) {
                this.GameGroup.push(gametypeList[j])
                break;
            }
        }
    }
    return this.GameGroup;
};

gameListCfg.getGamelistType = function (type) {
    for (let i = 0; i < this.gametypeList.length; i++) {
        if (this.gametypeList[i].id == type) {
            return this.gametypeList[i].game;
        }
    }
};

gameListCfg.getWebGamelistType = function () {
    for (let i = 0; i < this.gametypeList.length; i++) {
        if (this.gametypeList[i].id == 1) {
            return this.gametypeList[i].external_game;
        }
    }
};

gameListCfg.getWebGameUrl = function () {
    return this.webGameUrl;
};

gameListCfg.setGameUpdate = function (gameName) {
    this.gameupdate[gameName] = true;
};

gameListCfg.getGameUpdate = function (gameName) {
    return this.gameupdate[gameName];
};

gameListCfg.closeGameUpdate = function () {
    this.gameupdate = [];
};

gameListCfg.enterSubGame = function (gameid) {
    if (!cc.sys.isNative) return;
    if (this.loadedGame[gameid]) return;
    //window.require(`${this.gamesSearchPaths[gameid]}`+"/game.js")
    this.loadedGame[gameid] = true;
};


/**
 * 获取已经下载的游戏列表
 */
gameListCfg.checkDownloadGames = function () {
    let keys = Object.keys(this.gamesSearchPaths);
    let count = keys.length;
    let downloadGameIDArr = [];
    for (let i = 0; i < count; i++) {
        let key = keys[i];
        let gamesSearchPath = this.gamesSearchPaths[key];
        if (jsb.fileUtils.isDirectoryExist(gamesSearchPath) && key !== "2")
            downloadGameIDArr.push(key);
    }
    return downloadGameIDArr.sort(function (a, b) {
        return a > b;
    });
};
/**
 * 获取游戏列表, 将已经下载的游戏排列到前面
 */
gameListCfg.getGameList = function () {
    if (!cc.sys.isNative) return this.gameList;
    let downloadGameIDArr = this.checkDownloadGames();
    let count = downloadGameIDArr.length - 1;
    for (let i = count; i >= 0; i--) {
        let gameID = Number(downloadGameIDArr[i]);
        let num = this.gameList.length;
        for (let c = 0; c < num; c++) {
            if (this.gameList[c]["id"] === gameID) {
                this.gameList.unshift(this.gameList.splice(c, 1)[0]);
                break;
            }
        }
    }
    return this.gameList;
};
gameListCfg.getGameSearchPaths = function (gameID) {
    return this.gamesSearchPaths[gameID];
};


gameListCfg.getGameVersion = function (wholeurl) {
    console.log("getGameVersion");
    return new Promise(function (resolve, reject) {
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                let respone = xhr.responseText;
                let data = JSON.parse(respone);
                console.log("version=", data, data.version);
                resolve(data);
            }
        };
        xhr.timeout = 5000;
        console.log("getGameVersion wholeurl=", wholeurl);
        xhr.open("GET", wholeurl, true);
        xhr.send();
    })
};


gameListCfg.get = function (key) {
    return this[key];
};
gameListCfg.setGamesUpdateData = function (gameid, key, value) {
    this.gamesUpdateData[gameid][key] = value;
}
module.exports = function () {
    if (!g_instance) {
        g_instance = new GameListCfg();
    }
    return g_instance;
};

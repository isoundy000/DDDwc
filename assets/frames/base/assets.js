let AssetsManager = function (gameName, manifestUrl, processCB, successCB, failCB) {
    this.resetData(gameName, manifestUrl, processCB, successCB, failCB);
    this.init(gameName);
},
    assetsManager = AssetsManager.prototype;

module.exports = AssetsManager;
let base_path = "master/subpackages/";//"master/res/raw-assets/modules/games/";
/**
 * 参数初始化
 * @param gameName      游戏code
 * @param manifestUrl   本地清单地址
 * @param processCB     过程回调
 * @param successCB     成功回调
 * @param failCB        失败回调
 */
assetsManager.resetData = function (gameName, manifestUrl, processCB, successCB, failCB) {
    let hotUpdateURL = glGame.servercfg.getHotupdateVersionUrl();
    this.customManifestStr = JSON.stringify({
        "packageUrl": `${hotUpdateURL}${gameName}/`,
        "remoteManifestUrl": `${hotUpdateURL}${gameName}/${gameName}project.manifest`,
        "remoteVersionUrl": `${hotUpdateURL}${gameName}/${gameName}version.manifest`,
        "version": "0.0.0",
        "assets": {},
        "searchPaths": []
    });
    this.manifestUrl = manifestUrl;
    this.processCB = processCB;
    this.successCB = successCB;
    this.failCB = failCB;
    this.update_error = 0;
    this.fileError = false;
    this.gameName = gameName;
};
/**
 * 热更下载管理器初始化
 * @param gameName
 */
assetsManager.init = function (gameName) {
    let temp_path = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + `${base_path + gameName}_temp`);
    if (jsb.fileUtils.isDirectoryExist(temp_path)) {
        jsb.fileUtils.removeDirectory(temp_path);
    }
    this._storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + `${base_path + gameName}`);
    console.log('本地路径 : ' + this._storagePath);
    this.versionCompareHandle = function (versionA, versionB) {
        console.log("JS 自定义版本比较: version A : " + versionA + ', version B : ' + versionB);
        return versionA === versionB ? 0 : -1;
    };
    this._am = new jsb.AssetsManager('', this._storagePath, this.versionCompareHandle);

    this._am.setVerifyCallback(function (path, asset) {
        let compressed = asset.compressed;
        let expectedMD5 = asset.md5;
        let relativePath = asset.path;
        let size = asset.size;
        if (compressed)
            console.log(`验证通过 : ${relativePath}`);
        else
            console.log(`验证通过 : ${relativePath}(${expectedMD5})`);
        return true;
    });
    if (cc.sys.os === cc.sys.OS_ANDROID) {
        this._am.setMaxConcurrentTask(10);
        console.log("Android平台最大并发任务计数限制于2");
    }
    this.processCB(0);
    // 检测更新
    this.checkUpdate();
};
/**
 * 销毁热更下载管理器
 */
assetsManager.destroy = function () {
    if (this._updateListener) {
        // cc.eventManager.removeListener(this._updateListener);
        this._am.setEventCallback(null);
        this._updateListener = null;
    }
    // if (this._am && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
    //     this._am.release();
    // }
};

/**
 * 检测更新
 */
assetsManager.checkUpdate = function () {
    if (this._updating) {
        return console.log("正在检查或更新, 请稍等 ...");
    }
    if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
        console.log("正在检查是否需要更新中, 请稍等 ...");
        this._am.loadLocalManifest(this.manifestUrl);
    }
    if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
        if (this._am.getState() !== jsb.AssetsManager.State.UNINITED) return;
        console.log("无法加载本地清单, 使用默认更新清单 ...");
        let manifest = new jsb.Manifest(this.customManifestStr, this._storagePath);
        this._am.loadLocalManifest(manifest, this._storagePath);
    }
    // this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.checkCb.bind(this));
    // cc.eventManager.addListener(this._checkListener, 1);
    this._am.setEventCallback(this.checkCb.bind(this))
    this._am.checkUpdate();
    this._updating = true;
};
/**
 * 重试更新
 */
assetsManager.retry = function () {
    if (!this._updating && this._canRetry) {
        if (this.update_error <= 2) {
            this.update_error++;
            this._am.downloadFailedAssets();

            this.fileError = false;
        } else {
            this._canRetry = false;
            console.log("资源下载失败, 请重试 ...");
            glGame.panel.showDialog("提示", "下载失败, 请重试!", () => {
                this._am.downloadFailedAssets();
            }, () => {
                this.failCB();
                this.destroy();
            })
        }
    }
};
/**
 * 开始更新
 */
assetsManager.hotUpdate = function () {
    if (this._am && !this._updating) {
        // this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.updateCb.bind(this));
        // cc.eventManager.addListener(this._updateListener, 1);
        this._am.setEventCallback(this.updateCb.bind(this))
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            this._am.loadLocalManifest(this.manifestUrl);
        }
        this._failCount = 0;
        this._am.update();
        this._updating = true;
    }
};
/**
 * 检测更新事件回掉
 */
assetsManager.checkCb = function (event) {
    let isUpdate = false;
    switch (event.getEventCode()) {
        case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
        case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
        case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
            console.log("找不到本地清单文件或则无法下载清单文件, 跳过热更新.");
            glGame.panel.showMsgBox("提示", "更新检测失败", () => {
                // TODO 这里可能要直接退出游戏
                if (this._am.getState() !== jsb.AssetsManager.State.UNINITED) return;
                let manifest = new jsb.Manifest(this.customManifestStr, this._storagePath);
                this._am.loadLocalManifest(manifest, this._storagePath);
                this.checkUpdate();
            });
            break;
        case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
            console.log("已经更新了最新的远程版本.");
            isUpdate = true;
            this.successCB();
            break;
        case jsb.EventAssetsManager.NEW_VERSION_FOUND:
            console.log("'找到新版本, 请尝试更新.");
            isUpdate = true;
            break;
        default:
            return;
    }
    // cc.eventManager.removeListener(this._checkListener);
    this._am.setEventCallback(null);
    this._checkListener = null;
    this._updating = false;
    if (isUpdate) this.hotUpdate();
};
/**
 * 热更新事件回掉
 */
assetsManager.updateCb = function (event) {
    // let needRestart = false;
    let failed = false;
    switch (event.getEventCode()) {
        case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
            console.log("找不到本地清单文件，跳过热更新.");
            failed = true;
            break;
        case jsb.EventAssetsManager.UPDATE_PROGRESSION:
            // this.byteProgress.progress = event.getPercent();
            // this.fileProgress.progress = event.getPercentByFile();
            // this.fileLabel.string = event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
            // this.byteLabel.string = event.getDownloadedBytes() + ' / ' + event.getTotalBytes();
            this.processCB(event.getPercentByFile());
            let msg = event.getMessage();
            if (msg) console.log("更新后的文件", msg);
            break;
        case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
        case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
            console.log("无法下载清单文件，跳过热更新.");
            failed = true;
            break;
        case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
            console.log("已经更新了最新的远程版本.");
            failed = true;
            break;
        case jsb.EventAssetsManager.UPDATE_FINISHED:
            console.log(`更新完成. ${event.getMessage()}`);
            // needRestart = true;
            if (this.fileError) {
                this.fileError = false;
                this.retry()
            } else {
                // let HotUpdateSearchPaths = glGame.storage.getItem('HotUpdateSearchPaths');
                // if (HotUpdateSearchPaths && HotUpdateSearchPaths.indexOf(this._storagePath) == -1){
                //     HotUpdateSearchPaths.push(this._storagePath);
                //     glGame.storage.setItem('HotUpdateSearchPaths', HotUpdateSearchPaths);
                //     jsb.fileUtils.setSearchPaths(HotUpdateSearchPaths);
                // }
                //处理热更缓存记录
                this.successCB();
            }
            break;
        case jsb.EventAssetsManager.UPDATE_FAILED:
            console.log(`更新失败,弹窗提示. ${event.getMessage()}//${event.getAssetId()}`);
            console.log("测试log1")
            this._updating = false;
            this._canRetry = true;
            this.retry()
            break;
        case jsb.EventAssetsManager.ERROR_UPDATING:
            console.log("测试log4")
            let errorfile = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + this.gameName + "_temp/" + event.getAssetId() + ".tmp";
            console.log("删除无法转换文件：", errorfile);
            jsb.fileUtils.removeFile(errorfile);
            console.log(`资源更新错误. ${event.getAssetId()},${event.getMessage()}`);
            this.fileError = true;
            break;
        case jsb.EventAssetsManager.ERROR_DECOMPRESS:
            console.log(`jsb.EventAssetsManager.ERROR_DECOMPRESS ${event.getMessage()}`);
            break;
        default:
            break;
    }

    if (failed) {
        // cc.eventManager.removeListener(this._updateListener);
        this._am.setEventCallback(null);
        this._updateListener = null;
        this._updating = false;
    }

    // if (needRestart) {
    //     cc.eventManager.removeListener(this._updateListener);
    //     this._updateListener = null;
    //     let searchPaths = jsb.fileUtils.getSearchPaths();
    //     let newPaths = this._am.getLocalManifest().getSearchPaths();
    //     console.log(JSON.stringify(newPaths));
    //     Array.prototype.unshift(searchPaths, newPaths);
    //     cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
    //     jsb.fileUtils.setSearchPaths(searchPaths);
    //     cc.audioEngine.stopAll();
    //     cc.game.restart();
    // }
};

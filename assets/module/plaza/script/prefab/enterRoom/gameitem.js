/**
 * 大厅子游戏图标通用脚本
 */
//制作次序

glGame.baseclass.extend({
    properties: {
        pic_downloadBg: cc.Sprite,
        processNew: cc.Node,
        progressPic: cc.Sprite,

        inconSpine: sp.Skeleton,
        gamespine: {
            default: [],
            type: sp.SkeletonData
        },

        // gameBGbig: [cc.SpriteFrame],
        // gameBGsmall: [cc.SpriteFrame],
    },
    onLoad() {
        this.resetData();
        glGame.emitter.on("gameitemupdate", this.gameitemupdate, this);
        glGame.emitter.on("roomEntrance", this.roomEntrance, this);
    },

    roomEntrance(gameid) {
        if (gameid == this.gameID) {
            this.onClick();
        }
    },
    
    /**
     * 界面数据初始化
     */
    resetData() {
        //game 的相关数据对应
        this.GAME_ITEM = [
            glGame.scenetag.BAIJIALE,         // 百家乐
            glGame.scenetag.BRNN,             // 百人牛牛
            glGame.scenetag.DDZ,              // 斗地主
            glGame.scenetag.DZPK,             // 德州扑克
            glGame.scenetag.HONGHEI,          // 红黑
            glGame.scenetag.LABA,             // 拉霸
            glGame.scenetag.LONGHUDOU,        // 龙虎斗
            glGame.scenetag.LUCKTURNTABLE,    // 幸运大转盘
            glGame.scenetag.PAIJIU,           // 牌九
            glGame.scenetag.QZNN,             // 抢庄牛牛
            glGame.scenetag.SANGONG,          // 三公
            glGame.scenetag.SHUIGUOJI,        // 水果机
            glGame.scenetag.ZHAJINHUA,        // 炸金花
            glGame.scenetag.JSZJH,            // 极速炸金花
            glGame.scenetag.ESYD,             // 二十一点
            glGame.scenetag.EBG,              // 二八杠
            glGame.scenetag.FISH,             // 捕鱼
            glGame.scenetag.QHBJL,            // 抢红包接龙
            glGame.scenetag.SSS,              // 十三水
            glGame.scenetag.HCPY,             // 豪车漂移
            glGame.scenetag.SLWH,             // 森林舞会
        ];

        this.isUpdate = false;
        this.isEnter = false;
        this.gameInfo = {};
        this.gameSpine = {};
        this.assetsManager = null;
        // 对 this.gameicon 进行了包装, 使用图片名字作为 key, 图片对象作为 value
        for (let i = 0; i < this.GAME_ITEM.length; i++) {
            if (this.gamespine[i]) {
                this.gameSpine[this.GAME_ITEM[i]] = this.gamespine[i];
            }
        }
    },
    /**
     * 初始化图标状态
     */
    initUI(index) {
        let gameList = glGame.gamelistcfg.get("gameList");
        for (let i = 0; i < gameList.length; i++) {
            if (gameList[i]["id"] == index) {
                this.gameInfo = gameList[i]
                break;
            }
        }
        // this.gameInfo = gameList[index];
        this.gameID = this.gameInfo["id"];
        // this.status = this.gameInfo["status"] ? this.gameInfo["status"] : 2;    //这里已经生成图标，取不到状态默认设置为维护中
        this.gameName = glGame.scene.getSceneNameByID(this.gameID);
        if (!this.gameName) return this.node.active = false;                          //临时措施，PHP已给游戏，客户端还未完成
        this.inconSpine.skeletonData = this.gameSpine[this.gameID];
        this.inconSpine.setAnimation(0, "animation", true);

        if (glGame.gamelistcfg.getGameUpdate(this.gameName)) {
            this.isUpdate = false;
        } else this.isNeedUpdate();
    },

    checkGame(gameid) {
        return this.GAME_ITEM.indexOf(gameid);
    },

    showDown() {

    },
    // 按钮点击事件
    onClick(name, node) {
        // 原生平台游戏下载判定
        if (cc.sys.isNative) {
            if (this.isUpdating) return;
            if (this.assetsManager != null) return;
            let update_data = glGame.storage.getItem('update_data');
            // 如果没有这个游戏的路径则说明游戏未下载
            if (!update_data || !update_data[this.gameName]) {
                this.downloadGame(null, false);
                return;
            }
            if (this.isUpdate) {
                // let base_path = "master/res/raw-assets/modules/games/";
                // let gamesSearchPath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + base_path + this.gameName;
                // this.downloadGame(`${gamesSearchPath}/project.manifest`);
                this.downloadGame(null, true);
                return;
            }
        }
        // if (this.status == 2) return glGame.panel.showErrorTip("游戏维护中！")
        if (glGame.panel.showSuspicious("game")) {
            return;
        }
        glGame.gamelistcfg.enterSubGame(this.gameID);
        // 单机游戏进入逻辑
        if (this.gameID === glGame.scenetag.LABA) {
            if (glGame.user.isTourist()) {
                glGame.panel.showRegisteredGift(true);
                return;
            }
            glGame.room.reqMyGameState(this.gameID).then(() => {
                glGame.logon.ReqGameState(this.gameID, () => {
                    // TODO 修改进入房间的方式
                    if (glGame.enterRoomVerification) {
                        glGame.room.reqGoldRoomVerify(glGame.scenetag.LABA, 1);
                    } else {
                        glGame.room.setGoldRoomInfo(glGame.scenetag.LABA, 1);
                    }
                })
            });
            // glGame.room.reqGoldRoomVerify(glGame.scenetag.LABA, 1);
            return;
        }
        glGame.logon.ReqGameState(this.gameID, gameid => {
            glGame.panel.showPanelByName(`longhudouentry`).then(panel => {
                let script = panel.getComponent("hundredgameentry");
                script.setGameId(gameid);
                script.updateBgInfo();
            });
        })
        // glGame.panel.showPanelByName(`longhudouentry`).then(panel => {
        //     let script = panel.getComponent("hundredgameentry");
        //     script.setGameId(this.gameInfo.id);
        //     script.updateBgInfo();
        // });
    },
    downloadGame(manifestUrl, bol) {
        this.pic_downloadBg.node.active = true;
        this.processNew.active = true;
        this.isUpdating = true;
        this.assetsManager = new glGame.assets(glGame.scene.getSceneNameByID(this.gameID), manifestUrl, (process) => {
            console.log("下载进度", process);
            if (process) {
                this.progressPic.fillRange = process;
            } else {
                this.progressPic.fillRange = 0;
            }
            this.processNew.getChildByName("label").getComponent(cc.Label).string = `${parseInt(process * 100) || 0}%`
        }, () => {    // 成功回调
            console.log("测试log5");
            this.pic_downloadBg.node.active = false;
            this.processNew.active = false;
            this.isUpdating = false;
            this.isUpdate = false;
            this.assetsManager.destroy();
            this.assetsManager = null;
            let data = { gameName: this.gameName };
            glGame.emitter.emit("gameitemupdate", data);
            glGame.gamelistcfg.setGameUpdate(this.gameName);
            let hotUpdateURL = glGame.servercfg.getHotupdateVersionUrl();
            let url = `${hotUpdateURL}${this.gameName}/${this.gameName}version.manifest`
            glGame.gamelistcfg.getGameVersion(url).then(verdata => {
                let data = glGame.storage.getItem('update_data');
                if (data) {
                    data[this.gameName] = verdata.version;
                } else {
                    data = {};
                    data[this.gameName] = verdata.version;
                }
                glGame.storage.setItem('update_data', data);
            })
        }, () => {    // 失败回调
            this.pic_downloadBg.node.active = false;
            this.processNew.active = false;
            this.isUpdate = false;
            this.isUpdating = false;
            this.assetsManager.destroy();
            this.assetsManager = null;
        });
    },
    isNeedUpdate() {
        if (!cc.sys.isNative) return;
        let update_data = glGame.storage.getItem('update_data');
        console.log("2gameitem checkVersion", this.gameName);
        if (update_data && update_data[this.gameName]) {
            let hotUpdateURL = glGame.servercfg.getHotupdateVersionUrl();
            let url = `${hotUpdateURL}${this.gameName}/${this.gameName}version.manifest`
            glGame.gamelistcfg.getGameVersion(url).then(data => {
                this.version = data.version;
                if (data.version === update_data[this.gameName]) {
                    this.isUpdate = false;
                    glGame.gamelistcfg.setGameUpdate(this.gameName);
                } else this.isUpdate = true;
            }, () => { this.isUpdate = true });
        } else this.isUpdate = true
    },
    set(key, value) {
        this[key] = value;
    },
    gameitemupdate(data) {
        console.log(data.gameName == this.gameName, this.gameName, "gameitemupdate");
        if (data.gameName == this.gameName) {
            this.isUpdate = false;
        }
    },
    OnDestroy() {
        glGame.emitter.off("gameitemupdate", this);
        glGame.emitter.off("roomEntrance", this);
    }
});

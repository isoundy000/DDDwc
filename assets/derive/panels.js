
//继承类
module.exports = function () {
    let panel = glGame.panel;
    /**
     * @param title 标题
     * @param content 内容
     * @param next 确定后的回调
     */
    // glGame.panel.showMsgBox("示例标题", "示例内容", ()=>{console.log("确定");})
    panel.showMsgBox = function (title, content, next, center = false) {
        glGame.fileutil.readPrefab(this.getLoinPrefab("confirmbox")).then(prefab => {
            let panel = this.showPanel(prefab);
            panel.getComponent(panel.name).showMsg(title, content, true, next, false, false, false, center);
            panel.zIndex = 9999;
        });
    };
    panel.showMsgBoxZMax = function (title, content, next) {
        glGame.fileutil.readPrefab(this.getLoinPrefab("confirmbox")).then(prefab => {
            let panel = this.showPanel(prefab);
            panel.getComponent(panel.name).showMsg(title, content, true, next);
            panel.zIndex = 9999;
        });
    };
    // glGame.panel.showDialog("示例标题", "示例内容...", ()=>{console.log("确定")}, ()=>{console.log("取消")})
    panel.showDialog = function (title, content, next, cancel, cancel_label, confirm_label, zIndex = null, center = false) {
        glGame.fileutil.readPrefab(this.getLoinPrefab("confirmbox")).then(prefab => {
            let panel = this.showPanel(prefab);
            panel.getComponent(panel.name).showMsg(title, content, false, next, cancel, cancel_label, confirm_label, center);
            if (zIndex != null) panel.zIndex = zIndex;
        });
    };
    //安装修复软件的弹窗
    panel.showInstallTipBox = function () {
        glGame.fileutil.readPrefab(this.getLoinPrefab("installTipBox")).then(prefab => {
            this.showPanel(prefab);
        });
    };
    /**
     * 可疑账号判断
     */
    panel.showSuspicious = function (name = null) {
        if (glGame.user.get("is_demo_player") == 1) {
            let demo_player = glGame.user.get("demo_player")
            if (demo_player[name] == 2) {
                glGame.panel.showDialog("账号异常", "        您好，您的账号存在异常，请及时联系客服！",
                    () => { glGame.panel.showService() }, () => { }, "我知道了", "联系客服")
                return true;
            }
        }
        if (glGame.logon.get("firstlogin") && glGame.user.get("suspicious") == 1) {
            glGame.panel.showDialog("账号异常", "        您账号所绑定的机器码重复，请及时联系客服处理，否则游戏中部分功能将无法使用！",
                () => { glGame.panel.showService() }, () => { glGame.panel.showPanelByName("urgentnotice") }, "我知道了", "联系客服")
            glGame.logon.set("firstlogin", false)
            return true
        }
        if (!glGame.user.get(name)) {
            return false;
        }
        if (name == "game" && glGame.user.get(`is_${name}`) == 2) {
            glGame.panel.showDialog("账号异常", "        您好，您的账号存在异常，请及时联系客服！",
                () => { glGame.panel.showService() }, () => { }, "我知道了", "联系客服")
            return true;
        }
        if (glGame.user.get("suspicious") == 2) {
            return false
        }
        if (glGame.user.get("suspicious") == 1 && glGame.user.get(name) == 1) {
            return false
        }
        glGame.panel.showDialog("账号异常", "        您好，您的账号存在异常，请及时联系客服！",
            () => { glGame.panel.showService() }, () => { }, "我知道了", "联系客服")
        return true;
    };

    /**
     * @param content 提示内容
     */
    panel.showTip = function (content, _time = 1) {
        glGame.fileutil.readPrefab(this.getCommonPrefab("labeltip")).then(prefab => {
            let panel = this.showPanel(prefab);
            panel.getComponent(panel.name).showTip(content, _time);
        });
    };

    panel.showErrorTip = function (content, next) {
        glGame.fileutil.readPrefab(this.getCommonPrefab("labeltip")).then(prefab => {
            let panel = this.showPanel(prefab);
            panel.getComponent(panel.name).showErrorTip(content, next);
        });
    };

    //显示生日
    panel.showBirthday = function () {
        glGame.fileutil.readPrefab(this.getCommonPrefab("editBirthday")).then(prefab => {
            this.showPanel(prefab);
        });
    };

    /**
     * 显示设置界面
     * @param bool
     */
    panel.showSetting = function (zIndex) {
        glGame.fileutil.readPrefab(this.getCommonPrefab("setting")).then(prefab => {
            let panel = this.showPanel(prefab);
            if (zIndex) {
                panel.zIndex = zIndex;
            }
        });
    };
    /**
    * 显示第一次进入大厅界面弹窗
    * @param bool
    */
    panel.showFirstEnterPanel = function () {
        let name;
        if (glGame.user.plazaShowPanel && glGame.user.plazaShowPanel.length != 0) {
            name = glGame.user.plazaShowPanel.splice(0, 1);
        } else {
            return
        }
        switch (name[0]) {
            case "setupRepairTool":
                this.showInstallTipBox();
                break;
            case "urgentnotice":
                this.showPanelByName("urgentnotice");
                break;
            case "touristtip":
                this.showRegisteredGift(true);
                break;
            case "signin":
                this.showPanelByName('signin');
                break;
            case "announcement":
                this.showPanelByName('announcement');
                break;
            default:
                break;
        }
    };
    /**
     * 显示游戏规则界面
     * @param gameName
     */
    panel.showGameRule = function (gameName) {
        glGame.fileutil.readPrefab(this.getCommonPrefab("gamerule")).then(prefab => {
            let panel = this.showPanel(prefab);
            if (!gameName) gameName = cc.director.getScene().name;
            panel.getComponent(panel.name).updateUI(gameName);
        });
    };

    /**
     * 显示注册有礼界面
     * bool 是否播放音效
     */
    panel.showRegisteredGift = function (bool) {
        glGame.fileutil.readPrefab(this.getPlazaPrefab("touristtip")).then(prefab => {
            let panel = this.showPanel(prefab);
            let script = panel.getComponent(panel.name);
        });
    };
    /**
     * 显示DDZ游戏规则界面(new)
     * @param gameName
     */
    panel.showNewGameRule = function (gameID, zIndex) {
        //豪车漂移
        if (gameID == 43) {
            glGame.fileutil.readPrefab(this.getCommonPrefab("hcpyRule")).then(prefab => {
                let panel = this.showPanel(prefab);
                panel.getComponent(panel.name).updateUI(gameID);
                if (zIndex) {
                    panel.zIndex = zIndex;
                }
            })
        } else {
            glGame.fileutil.readPrefab(this.getCommonPrefab("gamerule")).then(prefab => {
                let panel = this.showPanel(prefab);
                panel.getComponent(panel.name).updateUI(gameID);
                if (zIndex) {
                    panel.zIndex = zIndex;
                }
            });
        }

    };
    /**
     * 显示新游戏记录界面
     * @param gameID
     */
    panel.showNewGameRecord = function (gameID, zIndex) {
        if (gameID == 43) {
            glGame.fileutil.readPrefab(this.getCommonPrefab("hcpyRecord")).then(prefab => {
                let panel = this.showPanel(prefab);
                panel.getComponent("record").updateUI(gameID);
                if (zIndex) {
                    panel.zIndex = zIndex;
                } else {
                    panel.zIndex = 30;
                }
            });
        } else {
            glGame.fileutil.readPrefab(this.getCommonPrefab("record")).then(prefab => {
                let panel = this.showPanel(prefab);
                panel.getComponent(panel.name).updateUI(gameID);
                if (zIndex) {
                    panel.zIndex = zIndex;
                } else {
                    panel.zIndex = 30;
                }
            });
        }
    };

    /**
     * 显示debug入口
     */
    panel.showDebug = function () {
        let scene = cc.director.getScene();
        if (scene.getChildByName("debug")) return scene.getChildByName("debug");
        glGame.fileutil.readPrefab(this.getCommonPrefab("debug")).then(prefab => {
            this.showPanel(prefab);
        });
    };

    /**
     * 显示注册界面
     */
    panel.showRegistration = function (bCut = false) {
        glGame.fileutil.readPrefab(this.getCommonPrefab("registration")).then(prefab => {
            let panel = this.showPanel(prefab);
            if (bCut) panel.getComponent(panel.name).setLeftUIRegisGap();
        });
    };

    /**
     * 显示联系客服界面
     */
    panel.showContactus = function (blOff, content, next, cancel) {
        glGame.fileutil.readPrefab(this.getCommonPrefab("contactus")).then(prefab => {
            let panel = this.showPanel(prefab);
            panel.getComponent(panel.name).showMsg(blOff, content, next, cancel);
        });
    };

    /**
     * 显示客服界面
     */
    panel.showService = function () {
        glGame.fileutil.readPrefab(this.getCommonPrefab("service")).then(prefab => {
            let panel = this.showPanel(prefab, true, 3);
            return panel;
        });
    };
    /**
     * 显示debug面板
     */
    panel.showDebugPanel = function () {
        glGame.fileutil.readPrefab(this.getCommonPrefab("debugpanel")).then(prefab => {
            let panel = this.showPanel(prefab);
            return panel;
        });
    };
    /**
     * 显示换桌
     */
    panel.showChangeTablePanel = function () {
        glGame.fileutil.readPrefab(this.getCommonPrefab("changetable")).then(prefab => {
            this.showPanel(prefab);
        });
    };

    /**
     * 显示退房弹窗
     */
    panel.showExitRoomPanel = function (_type, _zIndex) {
        glGame.fileutil.readPrefab(this.getCommonPrefab("exitRoom")).then(prefab => {
            let panel = this.showPanel(prefab);
            panel.getComponent(panel.name).showType(_type);
            if (_zIndex) panel.zIndex = _zIndex;
        });
    };

    /**
     * 显示滚动公告界面
     * @param pos       这是跑马位置
     * @param size      这只跑马大小
     * @param second    设置跑马每秒位移像素
     * @param bActive   设置跑马是否一直显示
     * @param bBottome  设置跑马底图是否显示
     * @return {Promise}
     */
    panel.showRollNotice = function (pos = cc.v2(700, 500), size = cc.size(600, 50), bPersist = true, speed = 60, bActive = false, bBottome = true) {
        if (cc.find("rollnotice")) {
            return;
        }
        if (this.rollnoticePanel) {
            let panel = this.showPanel(this.rollnoticePanel);
            this.changeRollNoticeState(bPersist);
            panel.getComponent(panel.name).setPosition(pos);
            panel.getComponent(panel.name).setContentSize(size);
            panel.getComponent(panel.name).setSpeed(speed);
            panel.getComponent(panel.name).setActive(bActive);
            panel.getComponent(panel.name).setBottom(bBottome);
        } else {
            glGame.fileutil.readPrefab(this.getCommonPrefab("rollnotice")).then(prefab => {
                let panel = this.showPanel(prefab);
                panel.getComponent(panel.name).setPosition(pos);
                panel.getComponent(panel.name).setContentSize(size);
                panel.getComponent(panel.name).setSpeed(speed);
                panel.getComponent(panel.name).setActive(bActive);
                panel.getComponent(panel.name).setBottom(bBottome);
                this.changeRollNoticeState(bPersist);
            });
        }
    };

    panel.changeRollNoticeState = function (bPersist) {
        let noticeNode = cc.find("rollnotice");
        if (!noticeNode) return;
        if (bPersist) {
            cc.game.addPersistRootNode(noticeNode);
            return;
        }
        cc.game.removePersistRootNode(noticeNode)
    };

    panel.firstShowShop = function (_zIndex) {
        glGame.fileutil.readPrefab(this.getCommonPrefab("shop")).then(prefab => {
            let panel = this.showPanel(prefab, true, 3);
            if (_zIndex) {
                panel.zIndex = _zIndex;
            }
        });
    };

    panel.showShop = function (_zIndex) {
        this.userRecharge = glGame.user.get("userRecharge");
        if (this.userRecharge.exists == 0) {//首冲
            glGame.fileutil.readPrefab(this.getCommonPrefab("firstRecharge")).then(prefab => {
                let panel = this.showPanel(prefab);
                if (_zIndex) {
                    panel.zIndex = _zIndex;
                }
            });
        } else {
            glGame.fileutil.readPrefab(this.getCommonPrefab("shop")).then(prefab => {
                let panel = this.showPanel(prefab, true, 3);
                if (_zIndex) {
                    panel.zIndex = _zIndex;
                }
            });
        }
    };

    //显示图片头像
    panel._showcion = function (node, pathUrl) {
        if (this.iconList[pathUrl] != null) {
            node.getComponent(cc.Sprite).spriteFrame = this.iconList[pathUrl];
            node.getComponent(cc.Sprite).type = cc.Sprite.Type.SIMPLE;
            node.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.CUSTOM;
            return;
        }
        glGame.loader.remoteLoad(pathUrl).then(data => {
            this.iconList[pathUrl] = data;
            node.getComponent(cc.Sprite).spriteFrame = data;
            node.getComponent(cc.Sprite).type = cc.Sprite.Type.SIMPLE;
            node.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.CUSTOM;
        })
    }

    /**
     * 获取远程图片展示，发现回包有误，继续获取
     */
    panel.loaderImageIcon = function (node, url, count) {
        if (count > 5) return;
        glGame.loader.loadUrlpic(url).then(path => {
            glGame.panel._showcion(node, path);
        }).catch(() => {
            let nextCount = ++count;
            glGame.panel.loaderImageIcon(node, url, nextCount)
        });
    }


    /**
     * 加载远程图片
     */
    panel.showRemoteImage = function (node, url) {
        if (!node) return;
        if (!node.children) return;
        if (cc.sys.isNative) {
            this.loaderImageIcon(node, url, 0);
        } else {
            this._showcion(node, url);
        }
    };

    /**
     * 加载头像图片
     */
    panel.showHeadImage = function (node, url) {
        if (!node) return;
        if (!node.children) return;
        let headUrl = glGame.user.get("url").resource_url + url;
        console.log("头像地址", headUrl);
        if (cc.sys.isNative) {
            this.loaderImageIcon(node, headUrl, 0);
        } else {
            this._showcion(node, headUrl);
        }
    };

    /**
     * 显示房间菊花屏蔽层
     */
    panel.showRoomJuHua = function () {
        let scene = cc.director.getScene();
        if (!scene) return;
        let panel = scene.getChildByName("room_juhua");
        // 重置菊花状态
        if (panel) {
            let script = panel.getComponent("juhua");
            script.CountTime();
            return panel;
        }
        if (this.juhuaPanel) {
            let juhua = this.showPanel(this.juhuaPanel);
            juhua.setName("room_juhua")
            return juhua;
        } else {
            glGame.fileutil.readPrefab(this.getLoinPrefab("juhua")).then(prefab => {
                let juhua = this.showPanel(prefab);
                juhua.setName("room_juhua")
                return juhua;
            });
        }
    };
    panel.hideRoomjuhua = function () {
        let scene = cc.director.getScene();
        if (!scene) return;
        let panel = scene.getChildByName("room_juhua");
        if (panel) {
            let script = panel.getComponent(panel.name);
            script.hidepic();
        }
    };
    /**
     * 关闭房间菊花屏蔽层
     */
    panel.closeRoomJuHua = function () {
        let scene = cc.director.getScene();
        if (!scene) return;
        let panel = scene.getChildByName("room_juhua");
        if (panel) panel.destroy();
    };
    /**
     * 显示菊花屏蔽层
     */
    panel.showJuHua = function () {
        let scene = cc.director.getScene();
        if (!scene) return;
        let panel = scene.getChildByName("juhua");
        // 重置菊花状态
        if (panel) {
            let script = panel.getComponent("juhua");
            script.CountTime();
            return panel;
        }
        let sceneName = scene.name;
        // 菊花只有在登陆或则大厅才能出现, 不能在游戏内出现
        if (sceneName !== "login" && sceneName !== "plaza") return null;
        if (this.juhuaPanel) {
            return this.showPanel(this.juhuaPanel);
        } else {
            glGame.fileutil.readPrefab(this.getLoinPrefab("juhua")).then(prefab => {
                return this.showPanel(prefab);
            });
        }
    };
    panel.hidejuhua = function () {
        let scene = cc.director.getScene();
        if (!scene) return;
        let panel = scene.getChildByName("juhua");
        if (panel) {
            let script = panel.getComponent(panel.name);
            script.hidepic();
        }
    };
    /**
     * 关闭菊花屏蔽层
     */
    panel.closeJuHua = function () {
        let panel = cc.director.getScene().getChildByName("juhua");
        if (panel) panel.destroy();
    };
    /**
     * 限制按钮点击菊花层
     */
    panel.showlimitJuhua = function () {
        glGame.fileutil.readPrefab(this.getLoinPrefab("juhua")).then(prefab => {
            this.showPanel(prefab);
        });
    }

    /**
     * 显示加载进度条
     */
    panel.showLoading = function () {
        glGame.fileutil.readPrefab(this.getLoinPrefab("loading")).then(prefab => {
            this.showPanel(prefab);
        });
    };

    /**
     * 显示加载进度条(进入房间后的loading遮罩)
     */
    panel.showRoomLoading = function () {
        // if (!glGame.room.get('changeTableState')) {
        //     if (this.publicPanelDict.hasOwnProperty("loading")) {
        //         let panel = this.showPanel(this.publicPanelDict["loading"]);
        //         panel.getComponent(panel.name).setloadingTipsSprite();
        //         return panel;
        //     }
        // }
    };


    /**
     * 关闭加载
     */
    panel.closeLoading = function () {
        // let loading = cc.director.getScene().getChildByName("loading");
        // if (!loading) return;
        // loading.destroy();
    };
};

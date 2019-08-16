/**
 * 修改适配游戏的机制
 */
let SystemClass = function () { },
    systemClass = SystemClass.prototype,
    g_instance = null;


//前后台切换事件
systemClass.enterFrontandback = function () {
    cc.game.on(cc.game.EVENT_HIDE, () => {
        if (window.isShow) {
            glGame.emitter.emit("EnterBackground");
            window.isShow = false;
        }
    });
    cc.game.on(cc.game.EVENT_SHOW, () => {
        if (!window.isShow) {
            glGame.emitter.emit("EnterForeground");
            window.isShow = true;
        }
    });
}

//web子游戏旋转后适配
systemClass.webGameChange = function () {
    var evt = "onorientationchange" in window ? "orientationchange" : "resize";
    window.addEventListener(evt, function () {
        console.log("onorientationchange", window.orientation);
        //glGame.panel.showMsgBox("", cc.director.getScene().name+window.orientation)
        if (cc.director.getScene().name == "plaza" || cc.director.getScene().name == "login") {
            //通过深入 Document 内部对 body 进行检测，获取窗口大小
            if (window.orientation == 0 || window.orientation == 180) {
                glGame.scene.enterNowScene();
                glGame.readyroom.reqExitArea();
            } else if (window.orientation == 90 || window.orientation == -90) {
                glGame.scene.enterNowScene();
                glGame.readyroom.reqExitArea();
            }
        }
    }, false);
}

// 获取转屏的设定(暂时废弃)
systemClass.webChange = function () {
    if (!cc.sys.isNative) {
        var evt = "onorientationchange" in window ? "orientationchange" : "resize";
        window.addEventListener(evt, function () {
            console.log("onorientationchange", window.orientation);
            //通过深入 Document 内部对 body 进行检测，获取窗口大小
            let ratio = cc.view.getDevicePixelRatio(),
                cutSize = cc.view.getFrameSize(),
                winWidth = cutSize.width * ratio,//cc.view.getFrameSize().width,
                winHeight = cutSize.height * ratio / 1.154700538379252;//cc.view.getFrameSize().height;
            if (window.orientation == 0 || window.orientation == 180) {
            } else {
            }
            cc.view.resizeWithBrowserSize(true);
        }, false);
    }
    //ip x 适配
    let size = cc.view.getFrameSize();
    if (cc.sys.isNative && ((size.width == 2436 && size.height == 1125) || (size.width == 1125 && size.height == 2436))) {
        cc.view.setFrameSize(size.width - 250, size.height);
        cc.view.resizeWithBrowserSize(true);
    }
}

// 强制热更判定
systemClass.updateBag = function () {
    let version = "1.0.0";              //需要更换底包修改时修改（默认的底包为版本 1.0.0）
    let data = glGame.storage.getItem("pack_version");
    if (data && data.v) {
        glGame.version = data.v;
    } else {
        glGame.storage.setItem("pack_version", { v: version });
        glGame.version = version;
    }
}


// 适配iPhonex
systemClass.iphonex = function () {
    let size = cc.view.getFrameSize();
    //console.log("设备 size", size);
    if (
        cc.sys.isNative && cc.sys.platform == cc.sys.IPHONE
        && ((size.width == 2436 && size.height == 1125)
            || (size.width == 1125 && size.height == 2436))
        //size.width == 812 && size.height == 375
    ) {
        // let cvs = cc.director.getScene()._children[0].getComponent(cc.Canvas);
        // cvs.fitHeight = true;
        // cvs.fitWidth = true;
        // glGame.emitter.emit("gl.sceneUi");
    } else if (size.width / size.height <= 960 / 640) {
        let cvs = cc.director.getScene()._children[0].getComponent(cc.Canvas);
        cvs.fitHeight = true;
        cvs.fitWidth = true;
        glGame.emitter.emit("gl.sceneUi");
    }
}

//android: 返回键监听注册到全局
systemClass.androidOn = function () {
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, (event) => {
        switch (event.keyCode) {
            case cc.KEY.back:
                // glGame.emitter.emit("backPressed");
                if (glGame.isAndroidExit) return;
                if (glGame.isHaveWebView) {
                    glGame.chargeWebView.remove();
                    glGame.chargeWebView = null;
                    return;
                }
                glGame.isAndroidExit = true;
                glGame.panel.showDialog("提示", "是否立即关闭游戏?", () => {
                    glGame.isAndroidExit = false;
                    cc.director.end();
                }, () => { glGame.isAndroidExit = false });
                break;
            default:
                console.error("啥瘠薄key, 不处理")
        }
    }, window)
}

//多点触控的函数
systemClass.nodeRewrite = function () {
    cc.Node.maxTouchNum = 1;
    cc.Node.touchNum = 0;
    var __dispatchEvent__ = cc.Node.prototype.dispatchEvent;
    cc.Node.prototype.dispatchEvent = function (event) {
        switch (event.type) {
            case 'touchstart':
                if (cc.Node.touchNum < cc.Node.maxTouchNum) {
                    cc.Node.touchNum++;
                    cc.Node.touchNum = cc.Node.touchNum > 1 ? 1 : cc.Node.touchNum
                    this._canTouch = true;
                    __dispatchEvent__.call(this, event);
                }
                break;
            case 'touchmove':
                if (!this._canTouch && cc.Node.touchNum < cc.Node.maxTouchNum) {
                    this._canTouch = true;
                    cc.Node.touchNum++;
                    cc.Node.touchNum = cc.Node.touchNum > 1 ? 1 : cc.Node.touchNum
                }

                if (this._canTouch) {
                    __dispatchEvent__.call(this, event);
                }

                break;
            case 'touchend':
                if (this._canTouch) {
                    this._canTouch = false;
                    cc.Node.touchNum--;
                    cc.Node.touchNum = cc.Node.touchNum < 0 ? 0 : cc.Node.touchNum
                    __dispatchEvent__.call(this, event);
                }
                break;
            case 'touchcancel':
                if (this._canTouch) {
                    this._canTouch = true;
                    cc.Node.touchNum--;
                    cc.Node.touchNum = cc.Node.touchNum < 0 ? 0 : cc.Node.touchNum
                    __dispatchEvent__.call(this, event);
                }
                break;
            default:
                __dispatchEvent__.call(this, event);
        }
    };

    var onPostActivated = cc.Node.prototype._onPostActivated;
    cc.Node.prototype._onPostActivated = function (active) {
        if (!active && this._canTouch) {
            this._canTouch = false;
            cc.Node.touchNum--;
            cc.Node.touchNum = cc.Node.touchNum < 0 ? 0 : cc.Node.touchNum
        }
        onPostActivated.call(this, active);
    };

    var __onPreDestroy__ = cc.Node.prototype._onPreDestroy;
    cc.Node.prototype._onPreDestroy = function () {
        if (this._canTouch) {
            this._canTouch = false;
            cc.Node.touchNum--;
            cc.Node.touchNum = cc.Node.touchNum < 0 ? 0 : cc.Node.touchNum
        }

        __onPreDestroy__.call(this);
    };
}

module.exports = function () {
    if (!g_instance) {
        g_instance = new SystemClass();
    }
    return g_instance;
};
let
    errorCode = require("NetCode"),
    NetErrMgr = function () { },
    netErrMgr = NetErrMgr.prototype,
    g_instance = null;


netErrMgr.enterPlaza = function() {
    if (cc.director.getScene().name!="plaza") {
        glGame.scene.setNextSceneTag(glGame.scenetag.PLAZA);
        glGame.scene.enterNextScene();
    }
}
netErrMgr.dealWithError = function (code) {
    console.log("去获取自己的状态=", code, typeof (code))
    switch (code) {
        case 10030012:
            this.enterPlaza();
            break;
        case 10030021://房间相关错误
        case 10030020:
        case 10030024:
        case 10030041:
        case 10030053:
            //检测自己的房间状态
            glGame.room.reqMyRoomState();
            break;
        case 20010001://token无效

        case 20040016://uid无效
        case 10020004://token错误
        case 500:
            //清除登录缓存
            // glGame.storage.removeItemByKey("loginCache");
            // 重启游戏
            reStartGame();
            break;
        case 20030018://未经验证,非法进入房间
        case 20040009://房间已结束
        case 10030017://不在房间中
        case 10030042://找不到房间信息
        case 20040013://百人场初始化未完成
            glGame.panel.showMsgBox('提示', `${errorCode.check(code)}，请重新选择房间`,this.enterPlaza.bind(this));
            break;
        case 20040012://房间已满
        case 10000006://捕鱼房间人数已满
            glGame.panel.showMsgBox('提示', `${errorCode.check(code)}，请重新选择房间`,
            () => {
                glGame.room.enterRoomFailure();
                if (cc.director.getScene().name != "plaza") {
                    glGame.scene.setNextSceneTag(glGame.scenetag.PLAZA);
                    glGame.scene.enterNextScene();
                }
            });
            break;
        case 20100007:
            if (glGame.room.curEnterGameID == glGame.scenetag.DDZ) return glGame.emitter.emit("ddzExitTip");
            glGame.panel.showMsgBox('提示', '您正在游戏中，不能退出');
            break;
        case 20040015://金币不足无法进入房间
            glGame.panel.showMsgBox('提示', `${errorCode.check(code)}，请重新选择房间`,this.enterPlaza.bind(this));
            break;
        case 10010007://系统检测到您的账号存在异常，已被临时封停，如有疑问请联系客服
            glGame.panel.showMsgBox('提示', '系统检测到您的账号存在异常，已被临时封停，如有疑问请联系客服',
                () => {
                    //清除登录缓存
                    glGame.storage.removeItemByKey("loginCache");
                    // 重启游戏
                    reStartGame();
                });
            break;
        case 10010008://您的IP已被限制，如有疑问请联系客服
            glGame.panel.showMsgBox('提示', '    您的IP已被限制，如有疑问请联系客服');
            break;
        case 10010009://您的手机已被限制，如有疑问请联系客服
            glGame.panel.showMsgBox('提示', '您的手机已被限制，如有疑问请联系客服');
            break;
        case 10010010://系统检测到您的账号存在异常，暂时无法取现，如有疑问请联系客服
            glGame.panel.showMsgBox('提示', '系统检测到您的账号存在异常，暂时无法取现，如有疑问请联系客服');
            break;
        case 20040020://系统检测到您的账号存在异常，暂时无法进入牌局，如有疑问请联系客服！
            glGame.panel.showMsgBox('提示', '系统检测到您的账号存在异常，暂时无法进入牌局，如有疑问请联系客服！',
                () => {
                    this.enterPlaza();
                });
            break;
        case 20040022://系统检测到您的账号存在异常，无法继续进入牌局，如有疑问请联系客服！
            glGame.panel.showMsgBox('提示', '游戏已关闭，无法继续进行游戏！',this.enterPlaza.bind(this));
            break;
        case 10020002://用户账户不存在
        case 10020003://用户密码错误
            if (glGame.logon.get("isAutoLogin")) {
                glGame.storage.removeItemByKey("loginCache");
                reStartGame();
            }
            break;
        case 10020004://token错误
        case 10020005://该账号已存在，请重新登录
        case 10020006://注册失败
        case 10020007://登录失败
            let scene = cc.director.getScene(),
                data = glGame.storage.getItem("loginCache");
            if (scene.name == "login" && data != null) {
                glGame.storage.removeItemByKey("loginCache");
                reStartGame();
            }
            break;
        case 20100009:
            glGame.panel.showMsgBox('提示', `${errorCode.check(code)}`,
                () => {
                    glGame.room.enterRoomFailure();
                    if (cc.director.getScene().name != "plaza") {
                        glGame.scene.setNextSceneTag(glGame.scenetag.PLAZA);
                        glGame.scene.enterNextScene();
                    }
                });
            break;
        case 20100010:
                glGame.panel.showMsgBox('提示', '该游戏已经被挤爆了，我们正在努力增设房间，请稍后再试！',()=>{
                    glGame.emitter.emit("nodeRemove");
                });
            break;
    }
}



module.exports = function () {
    if (!g_instance) {
        g_instance = new NetErrMgr();
    }
    return g_instance;
}();

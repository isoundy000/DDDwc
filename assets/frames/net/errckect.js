let
    errorCode = require("NetCode"),
    netErrMgr = require("NetErrMgr"),
    NetErrorCheck = function () { },
    netErrorCheck = NetErrorCheck.prototype,
    g_instance = null,
    send_limit = 5;
/**
 * 网络消息错误检查
 * @param route
 * @param code
 * @param data
 * @returns Boolean
 */
netErrorCheck.CheckError = function (route, code, data) {

    if (code != null) code = parseInt(code);
    if (code != 500) {
        // 收到消息500 则继续重发直到发送次数限制.
        glGame.gameNet.getNetMgr().doneWithRoute(route, code);
    }
    //这个是服务器队列添加结果不予理会
    if (route == 'http.queResult')
        return console.log("收到了http.queResult");
    console.log("收到了服务器的回复=", route, data);
    if (data) {
        if (data.coolingtime != null) {
            glGame.panel.showErrorTip(`操作太过频繁,请等待${data.coolingtime}秒再试`);
            return false;
        }
    }
    // if(code!=null) code=parseInt(code);
    let errmsg = errorCode.check(code);
    if (code == 10020108) {      //用户注册填写的项与其他玩家冲突
        errmsg = data.msg;
    }
    if (code == 10020004 || code == 20028002) {        //根据需求，这错误码改为弹窗 -20028002红黑下注操作错误的错误码-子游戏内做处理
        return;
    }

    if ((code == 10020002 || code == 10020003) && glGame.logon.get("isAutoLogin")) {
        netErrMgr.dealWithError(code);
        return;
    }
    if (errmsg != null && (500 == code || 21000500 == code)) {
        glGame.panel.showMsgBox('提示', errmsg);
        return;
    }
    if (code == 10030012 || code == 10020099) {
        glGame.user.reqMyInfo();
    }
    if (code == 100201021) {
        glGame.panel.showMsgBox('提示', data.message, null, true);
        return;
    }
    if (errmsg != null) {
        if (code == 10010007 || code == 10010008 || code == 10010009 || code == 10010010 || code == 20040020 || code == 20040022
            || code == 10030017 || code == 10030042 || code == 20040009 || code == 20040012 || code == 20040013 || code == 20030018
            || code == 20100007 || code == 20040015 || code == 20100009) {//IP限制，取现限制，手机限制,账号被封停,禁止进入游戏,及房间内相关错误只弹窗不提示
            netErrMgr.dealWithError(code);
            return;
        }
        glGame.panel.showErrorTip(`${errmsg}`, () => {
            //在这里去恢复房间数据, 根据错误码去纠正错误
            netErrMgr.dealWithError(code);
        });
        return false;
    }
    return true;
};


/**
*   发送限制  发送超过指定次数 则不再发送 直接重启或弹框提示后玩家确认就重启.
*   @param sendNum
*/
netErrorCheck.checkSendLimit = function (sendNum) {
    if (sendNum >= send_limit) {
        console.log("[errorWithTimeout] 发送超过指定次数 => 重启游戏");
        glGame.gameNet.getNetMgr().destroy();
        //清除登录缓存
        glGame.storage.removeItemByKey("loginCache");
        glGame.panel.showMsgBox("", "请求超时请重新登录游戏", () => {
            // 重启游戏
            reStartGame();
        });
        return true;
    }
    return false;
}

module.exports = function () {
    if (!g_instance) {
        g_instance = new NetErrorCheck();
    }
    return g_instance;
}();
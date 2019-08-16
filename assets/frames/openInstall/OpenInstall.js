
var openinstall= {

    installCallback(appData){
    },

    wakeupCallback(appData){
    },

    getInstall: function (s, callback) {
        this.installCallback = callback;
        if (cc.sys.OS_ANDROID == cc.sys.os) {
            console.log("调用java getInstall============================")
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity",
                "getInstall", "(I)V", s);
        } else if(cc.sys.OS_IOS == cc.sys.os){
            jsb.reflection.callStaticMethod("IOSOpenInstallBridge","getInstall:",s);
        }
    },
    registerWakeUpHandler: function (callback) {
        this.wakeupCallback = callback;
        if (cc.sys.OS_ANDROID == cc.sys.os) {
            console.log("调用java registerWakeUpHandler============================")
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity",
                "registerWakeup", "()V");
        } else if(cc.sys.OS_IOS == cc.sys.os){
            jsb.reflection.callStaticMethod("IOSOpenInstallBridge","registerWakeUpHandler");
        }
    },

    reportRegister: function () {
        if (cc.sys.OS_ANDROID == cc.sys.os) {
            jsb.reflection.callStaticMethod("com/fm/openinstall/OpenInstall",
                "reportRegister", "()V");
        } else if(cc.sys.OS_IOS == cc.sys.os){
            jsb.reflection.callStaticMethod("IOSOpenInstallBridge","reportRegister");
        }
    },

    reportEffectPoint: function (pointId, pointValue) {
        if (cc.sys.OS_ANDROID == cc.sys.os) {
            jsb.reflection.callStaticMethod("com/fm/openinstall/OpenInstall",
                "reportEffectPoint", "(Ljava/lang/String;J)V", pointId, pointValue);
        } else if(cc.sys.OS_IOS == cc.sys.os){
            jsb.reflection.callStaticMethod("IOSOpenInstallBridge","reportEffectPoint:Value:",pointId,pointValue);
        }
    },

    _installCallback: function (appData) {
        console.log("安装参数：", appData.channelCode, appData.bindData);
        for (let key in appData.bindData) {
            console.log("installCallback", key, appData.bindData[key]);
        }
        this.installCallback(appData);
    },

    _wakeupCallback: function (appData) {
        console.log("唤醒参数:", appData.channelCode, appData.bindData);
        for (let key in appData.bindData) {
            console.log("wakeupCallback", key, appData.bindData[key]);
        }
        this.wakeupCallback(appData);
    },

};
module.exports = openinstall;

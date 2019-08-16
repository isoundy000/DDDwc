let
    Default = require("default"),
    AppClassName = "AppController",
    wechatClassName = "WXController",

    IOS = Default.extend({
        copyToClip: function (text, tipStr) {
            let methodName = "copyToClip:";
            jsb.reflection.callStaticMethod(AppClassName, methodName, text.toString());
            glGame.panel.showTip("复制成功！");
        },
        getMachineCode: function () {
            let methodName = "getMachineCode";
            let imeiCode = jsb.reflection.callStaticMethod(AppClassName, methodName);
            console.log("ios imeiCode", imeiCode);
            return imeiCode;
        },
        getPhoneType: function () {
            let methodName = "getPhoneType";
            let phoneType = jsb.reflection.callStaticMethod(AppClassName, methodName);
            console.log("ios phoneType", phoneType);
            return phoneType;
        },
        saveToLocal: function (url) {
            let methodName = "saveToLocal:";
            jsb.reflection.callStaticMethod(AppClassName, methodName, url.toString());
            glGame.panel.showTip("保存成功")
        },
        getRegisID: function () {
            let methodName = "getRegisID";
            let registerID = jsb.reflection.callStaticMethod(AppClassName, methodName);
            console.log("ios jpush registerID", registerID)
            return registerID;
        },
        /**
        * 分享链接给好友
        * @param {*} title 分享标题
        * @param {*} content 分享内容
        * @param {*} url 分享链接
        * @param {*} scene 分享场景 0 好友 1 朋友圈/空间 2收藏
        * @param {*} image 分享图片url
        */
        shareTotWX(title, content, url, scene, image) {
            let methodName = "share:Content:Url:ShareImg:Scene:";
            jsb.reflection.callStaticMethod(wechatClassName, methodName, title, content, url, image, scene);
        },

        /**
        * 分享图片给好友
        * @param {*} image 分享图片url
        * @param {*} scene 分享场景 1 好友 2 朋友圈/空间
        */
        shareImage(image, scene) {
            let methodName = "shareImage:Scene:";
            jsb.reflection.callStaticMethod(wechatClassName, methodName, image, scene);
        },

        loginWX: function () {
            let methodName = "login";
            jsb.reflection.callStaticMethod(wechatClassName, methodName);
        },
        jumpToApp: function (url) {
            let methodName = "jumpToApp:";
            jsb.reflection.callStaticMethod(AppClassName, methodName, url.toString());
        },
        loginCallBack(data) {
            console.log('loginCallBack' + JSON.stringify(data))
            let msg = {
                username: data.openid,
                wx_headurl: data.headimgurl,
                wx_nickname: data.nickname,
                wx_sex: data.sex,
            }
            glGame.logon.reqWxLogin(msg);
        },
    }),
    g_instance = null;

module.exports.getInstance = function () {
    if (!g_instance) {
        g_instance = new IOS();
    }
    return g_instance;
}

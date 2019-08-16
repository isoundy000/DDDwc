let
    Default = require("default"),
    AppClassName = "org/cocos2dx/javascript/AppActivity",
    paramInt = "I",
    paramFloat = "F",
    paramBoolean = "Z",
    paramString = "Ljava/lang/String;",
    Android = Default.extend({
        copyToClip: function (text, tipStr) {
            let methodName = "copyToClip";
            let methodSignature = `(${paramString})V`;
            jsb.reflection.callStaticMethod(AppClassName, methodName, methodSignature, text);
            glGame.panel.showTip("复制成功！");
        },
        getMachineCode: function () {
            let methodName = "getIMEI";
            let methodSignature = `()${paramString}`;
            let imeiCode = jsb.reflection.callStaticMethod(AppClassName, methodName, methodSignature);
            console.log("imei码", imeiCode);
            return imeiCode;
        },

        saveToLocal(ImgUrl) {
            let fileName = "textureName";
            let fileType = ".png";
            let filePath = null;
            let xhr = new XMLHttpRequest();
            console.log("下载二维码3", xhr.readyState, xhr.status)
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    console.log("下载二维码4", xhr.response, cc.sys.isNative)
                    if (xhr.response && cc.sys.isNative) {
                        let rootPath = jsb.fileUtils.getWritablePath();
                        filePath = rootPath + fileName + fileType;
                        let u8a = new Uint8Array(xhr.response);
                        jsb.fileUtils.writeDataToFile(u8a, filePath);
                        //JS调用JAVA saveTextureToLocal 方法 参数为 filePath 也就是路径
                        jsb.reflection.callStaticMethod(AppClassName, "saveTextureToLocal", "(Ljava/lang/String;)V", filePath);
                        glGame.panel.showTip("已保存到相册!");
                    }
                }
            },
                xhr.responseType = 'arraybuffer';
            xhr.open("GET", ImgUrl, true);
            xhr.send();
        },

        getRegisID() {
            let methodName = "getRegisID";
            let methodSignature = `()${paramString}`;
            let regisID = jsb.reflection.callStaticMethod(AppClassName, methodName, methodSignature);
            console.log('regisID ===== ', regisID);
            return regisID;
        },

        getClipText: function () {
            let methodName = "getClipText";
            let methodSignature = `()${paramString}`;
            let clipText = jsb.reflection.callStaticMethod(AppClassName, methodName, methodSignature);
            console.log("粘贴板", clipText);
            return clipText;
        },

        getPhoneType() {
            let methodName = "getPhoneType";
            let methodSignature = `()${paramString}`;
            let phoneType = jsb.reflection.callStaticMethod(AppClassName, methodName, methodSignature);
            console.log('getPhoneType ===== ', phoneType);
            return phoneType;
        },

        /**
        * 分享链接给好友
        * @param {*} title 分享标题
        * @param {*} content 分享内容
        * @param {*} url 分享链接
        * @param {*} scene 分享场景 1 好友 2 朋友圈/空间
        * @param {*} image 分享图片url
        */
        shareTotWX(title, content, url, scene, image) {
            console.log('shareStep1111111', title, content, url, scene);
            jsb.reflection.callStaticMethod(
                'com/game/kaixinqp/wxapi/WXEntryActivity', "share",
                "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;I)Z",
                title, content, url, image, scene
            );
        },

        /**
        * 分享图片给好友
        * @param {*} image 分享图片url
        * @param {*} scene 分享场景 0 好友 1 朋友圈/空间 2收藏
        */
        shareImage(image, scene) {
            console.log('shareStep1111111', image, scene);
            jsb.reflection.callStaticMethod(
                'com/game/kaixinqp/wxapi/WXEntryActivity', "shareImage",
                "(Ljava/lang/String;I)Z",
                image, scene
            );
        },

        openWX() {
            jsb.reflection.callStaticMethod(
                'com/game/kaixinqp/wxapi/WXEntryActivity', "openWeiXin",
                "()V",
            );
        },

        loginWX() {
            jsb.reflection.callStaticMethod(
                'com/game/kaixinqp/wxapi/WXEntryActivity', "login",
                "()V",
            );
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

        jumpToApp(url) {
            cc.sys.openURL(url.toString());
        }
    }),
    g_instance = null;

module.exports.getInstance = function () {
    if (!g_instance) {
        g_instance = new Android();
    }
    return g_instance;
}

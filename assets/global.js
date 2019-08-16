const crypto = require("crypto");
window.md5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
};
window.glGame = window.glGame || {};
// 重启游戏接口
window.reStartGame = function () {
    glGame.isAndroidExit = false;
    glGame.isReStartgame = true;
    pomelo.clearListener();
    pomelo.disconnect();
    glGame.panel.resetData();
    cc.audioEngine.stopAll();
    cc.game.restart();
};

// 清理缓存数据并进行重启
window.clearGame = function () {
    if (!cc.sys.isNative) return;
    cc.sys.localStorage.removeItem("HotUpdateSearchPaths");
    cc.sys.localStorage.removeItem("update_data");
    let masterfile = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "master_temp";
    jsb.fileUtils.removeDirectory(masterfile);
    masterfile = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "master";
    jsb.fileUtils.removeDirectory(masterfile);
    reStartGame();
};


window.glGame = window.glGame || {};
window.startGame = function () {
    cc.log("startGame_多点触控");
    // 进入房间是否请求验证的测试开关
    glGame.enterRoomVerification = false;
    // 是否开发模式
    glGame.isDevelop = true;

    //是否播放大厅背景音乐
    glGame.isPlayPlazaBGM = true;

    //是否是第一次进入大厅
    glGame.isfirstEnterPlaza = false;

    //是否开启选择登录方式
    glGame.isLoginSelect = true;

    //是否进入大厅开启预加载
    glGame.isbeforehand = false;

    //多点触控的开关
    glGame.isMuchEventTouch = false;

    //金币场30秒开关(ture 是开启30秒，false是关闭30秒)
    glGame.isThirtySecond = false;

    if (!glGame.isDevelop) {
        console.log = function () { };
        console.error = function () { };
        cc.log = function () { };
        cc.error = function () { }
    }

    window.isAndroid = cc.sys.os === cc.sys.OS_ANDROID;
    window.isIos = cc.sys.os === cc.sys.OS_IOS;
    window.isBrowser = cc.sys.isBrowser;
    window.isEnableHotUpdate = cc.sys.isNative;//&&cc.sys.isMobile;
    let size = cc.view.getFrameSize();
    window.isiPhoneX = (cc.sys.platform == cc.sys.IPHONE && ((size.width == 2436 && size.height == 1125) || (size.width == 1125 && size.height == 2436)));

    cc.view.enableAntiAlias(true);

    if (isBrowser) glGame.platform = require("web").getInstance();
    else if (isAndroid) glGame.platform = require("android").getInstance();
    else if (isIos) glGame.platform = require("ios").getInstance();
    else glGame.platform = require("default").getInstance();

    if (cc.sys.isNative) cc.game.setFrameRate(45);
    // 场景标记
    glGame.scenetag = glGame.scenetag || {};
    glGame.scenetag.NEXTSCENETAG = "nextSceneTag";
    glGame.scenetag.LOGIN = 1;            // 登陆
    glGame.scenetag.PLAZA = 2;            // 大厅
    glGame.scenetag.ZHAJINHUA = 15;       // 炸金花
    glGame.scenetag.QZNN = 18;            // 抢庄牛牛
    glGame.scenetag.BRNN = 22;            // 百人牛牛
    glGame.scenetag.SANGONG = 27;         // 三公
    glGame.scenetag.HONGHEI = 28;         // 红黑
    glGame.scenetag.SHUIGUOJI = 29;       // 水果机
    glGame.scenetag.LONGHUDOU = 30;       // 龙虎斗
    glGame.scenetag.LABA = 31;            // 拉霸
    glGame.scenetag.BAIJIALE = 32;        // 百家乐
    glGame.scenetag.PAIJIU = 33;          // 牌九
    glGame.scenetag.LUCKTURNTABLE = 34;   // 幸运大转盘
    glGame.scenetag.DZPK = 35;            // 德州扑克
    glGame.scenetag.DDZ = 36;             // 斗地主
    glGame.scenetag.JSZJH = 37;           // 极速炸金花
    glGame.scenetag.ESYD = 38;            // 二十一点
    glGame.scenetag.EBG = 39;             // 二八杠
    glGame.scenetag.FISH = 40;            // 捕鱼
    glGame.scenetag.QHBJL = 41;           // 抢红包接龙
    glGame.scenetag.SSS = 42;             // 十三水
    glGame.scenetag.HCPY = 43;            // 豪车飘逸
    glGame.scenetag.SLWH = 44;            // 森林舞会
    // 银行
    glGame.bank = glGame.bank || {};
    glGame.bank.DEPOSIT = 0;              // 银行存入模式
    glGame.bank.WITHDRAW = 1;             // 银行取出模式

    // 支付
    glGame.pay = glGame.pay || {};
    glGame.pay.ALIPAY = 1;                // 支付宝
    glGame.pay.BANKCARD = 2;              // 银行卡

    // 前后台切换保留联网时间差
    glGame.ground = glGame.ground || {};
    glGame.ground.cutgametime = 60 * 1000;
    glGame.ground.newenter = true // 第一次进入大厅

    //初始化相关脚本
    glGame.systemclass = require("systemclass")();  // 修改适配游戏的机制
    glGame.fileutil = require("fileutil")();        // 文件操作管理
    glGame.encrypt = require("encryptInit")();
    glGame.emitter = require("emitter")();          // 事件管理
    glGame.storage = require("storage")();          // 缓存管理
    glGame.gameNet = require("GameNet")();          // 网络管理
    glGame.loader = require("loader")();            // 资源加载管理
    glGame.scene = require("scene")();              // 场景管理
    glGame.panel = require("panel")();              // 界面管理
    glGame.assets = require("assets");              // 热跟新管理
    glGame.audio = require("audio")();              // 声音管理
    glGame.animation = require("animation")();      // 动画管理

    glGame.gamelistcfg = require("gamelistcfg")();  // 游戏列表
    glGame.servercfg = require("servercfg")();      // 服务器配置模块
    glGame.logon = require("logon")();              // 登陆数据模块
    glGame.user = require("user")();                // 玩家信息模块
    glGame.room = require("room")();                // 房间数据模块
    glGame.readyroom = require("readyroom")();      // 房间数据模块

    glGame.notice = require("noticelogic")();       // 跑马灯数据模块
    glGame.oiSdk = require("OICallFunc").getInstance();
    glGame.tips = require("tips");


    //继承类
    require("scenes")();
    require("panels")();


    // 注册前后台切换事件
    window.isShow = true;
    glGame.systemclass.enterFrontandback();

    //web旋转适配
    //if (!cc.sys.isNative) glGame.systemclass.webChange();
    //web子游戏旋转适配
    if (!cc.sys.isNative) glGame.systemclass.webGameChange();

    //强制热更判定
    glGame.version = "";
    if (cc.sys.isNative) glGame.systemclass.updateBag();              //底包版本号（用于强制更新）

    //适配iphonex
    if (isIos) glGame.systemclass.iphonex();

    glGame.isAndroidExit = false;

    // android: 返回键监听注册到全局
    if (isAndroid) glGame.systemclass.androidOn();

    if(!glGame.isReStartgame){
        if (!glGame.isMuchEventTouch) glGame.systemclass.nodeRewrite();
    }

    // js 调试, 拦截全局错误
    // if (!isAndroid && !isIos)
    //     window.onerror = function handleError(msg,url,line) {
    //         console.trace();
    //         let txt="拦截到 js 错误 ...\n\n";
    //         txt+=msg + "\n";
    //         txt+="URL: " + url + "\n";
    //         txt+="Line: " + line + "\n\n";
    //         txt+="请优先解决该问题 ...\n\n";
    //         alert(txt);
    //         return true
    //     };
    //
};

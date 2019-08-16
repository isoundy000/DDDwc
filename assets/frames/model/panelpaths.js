//预加载目录
exports.paths = {
    //通用登入后的预加载目录
    prefab: {
        debug: "prefab/public/debug/debug",
        debugpanel: "prefab/public/debug/debugpanel",
        labeltip: "prefab/public/msgbox/labeltip",
        setting: "prefab/public/setting/setting",
        gamerule: "prefab/public/gamerule/gamerule",
        hcpyRule: "prefab/public/gamerule/hcpyRule",
        record: "prefab/public/record/record",
        hcpyRecord: "prefab/public/record/hcpyRecord",
        changetable: "prefab/public/changetable/changetable",
        exitRoom: "prefab/public/exitRoom/exitRoom",
        rollnotice: "prefab/public/notice/rollnotice",
        shop: "prefab/public/shop/shop",
        registration: "prefab/public/account/registration",
        contactus: "prefab/public/account/contactus",
        service: "prefab/public/account/service",
        firstRecharge: "prefab/public/other/firstRecharge",
        editBirthday: "prefab/public/birthday/editBirthday",
    },
    //登入前预加载目录
    loinprefab: {
        confirmbox: "prefab/public/msgbox/confirmbox",
        installTipBox: "prefab/public/msgbox/installTipBox",
        juhua: "prefab/public/msgbox/juhua",
        loading: "prefab/public/loading/loading",
    },
    //进入大厅的预加载目录
    plazaprefab: {
        base: "prefab/plaza/",      //根目录索引，禁止随意修改以及变换顺序

        //userInfo
        bindpay: "exchange/bindpay",
        changehead: "userInfo/changehead",
        modifypsw: "userInfo/modifypsw",
        userinfo: "userInfo/userinfo",


        //幸运夺宝
        luckDrawPanel: "luckDraw/luckDrawPanel",

        //返水
        backWater: "pump/backWater",
        porpor: "pump/porpor",
        waterrecord: "pump/waterrecord",

        //签到
        signin: "signin/signin",

        //余额宝
        yubao: "yubao/yubao",
        //center
        gameitem: "center/gameitem",
        longhudouentry: "center/longhudouentry",
        longhudouselect: "center/longhudouselect",
        baijialeselect: "center/baijialeselect",
        brnnselect: "center/brnnselect",
        hongheiselect: "center/hongheiselect",
        luckturntableselect: "center/luckturntableselect",
        shuiguojiselect: "center/shuiguojiselect",
        paijiuselect: "center/paijiuselect",
        sangongselect: "center/sangongselect",
        zhajinhuaselect: "center/zhajinhuaselect",
        ddzselect: "center/ddzselect",
        dzpkselect: "center/dzpkselect",
        qznnselect: "center/qznnselect",
        ebgselect: "center/ebgselect",
        jszjhselect: "center/jszjhselect",
        esydselect: "center/esydselect",
        fishselect: "center/fishselect",
        qhbjlselect: "center/qhbjlselect",
        sssselect:'center/sssselect',
        hcpyselect:'center/hcpyselect',
        slwhselect:'center/slwhselect',

        //银行
        bank: "bank/bank",
        bankaccess: "bank/bankaccess",
        bankmodifypsw: "bank/bankmodifypsw",
        bankpassword: "bank/bankpassword",
        bankRecord: "bank/bankRecord",

        //邮件
        email: "email/email",

        //兑换
        exchangeWin: "exchange/exchangeWin",
        exchangeTip: "exchange/exchangeTip",
        exchangerecord: "exchange/exchangerecord",
        withdrawal: "exchange/withdrawal",

        //分享赚钱
        popularize: "other/popularize",
        announcement: "other/announcement",
        urgentnotice: "other/urgentnotice",
        touristtip: "touristtip",
    },

    //强制预加载的模块
    compelprefab: [
        "userinfo", "popularize", "luckDrawPanel", "shop", "changetable"
    ],
};

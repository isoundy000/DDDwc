/**
 * 玩家模型
 * @constructor
 */
let
    User = function () {
        this.resetData();
        this.registerEvent();
    },
    user = User.prototype,
    g_instance = null;

/**
 * 重置玩家属性
 */
user.resetData = function () {
    this.edit_username = null;  //1.可以修改账号
    this.qq = null;             //qq
    this.wechat = null;         //微信
    this.email = null;          //邮箱
    this.phone = null;          //手机
    this.brithday = null;       //生日
    this.name = null;           //姓名
    this.birthday = null;
    this.userName = null;       // 玩家昵称
    this.userID = null;         // 玩家ID
    this.gold = null;           // 金币
    this.vip_name = 0;          //玩家的vip等级
    this.bank_coin = null;      // 金库里的金币
    this.guarantee_income = null; // 保底收益
    this.real_income = null;      // 实际收益
    this.recessive_coin = null;   // 隐性财富
    this.accType = null;        // 账号类型
    this.alipayAcc = null;      // 支付宝账号
    this.alipayName = null;     // 支付宝名字
    this.bankCardNum = null;    // 银行卡号
    this.bankCardName = null;   // 银行名字
    this.bankCardType = null;   // 银行类型
    this.headURL = null;        // 头像地址
    this.headList = {};       // 玩家头像列表
    this.pay_password = null;   // 银行密码
    this.emails = [];           // 玩家邮件
    this.mailInfoDict = {};     // 已经获取的邮件详情
    this.verifiState = false;   // 验证码获取状态
    this.userGameRecord = {};   // 玩家游戏记录
    this.dialPrizeList = [];    // 抽奖的奖项
    this.dialHorseData = [];    // 抽奖跑马灯数据
    this.myDialResult = null;   // 抽奖结果
    this.dialTopPrize = [];     // 大奖记录
    this.dialScore = null;      // 抽奖积分
    this.scoreBet = null;       // 抽奖积分下注兑换比例
    this.betDialScore = null;   // 明日抽奖积分
    this.myDialRecord = null;   // 玩家个人抽奖记录
    this.userPumpRecord = {};   // 玩家返水记录
    this.userPumpMoney = {};     // 玩家返水等待发放时间和返水金额
    this.userSignin = {};       // 获取玩家是否签到数据
    this.userRecharge = {};     // 获取玩家是否首冲
    this.url = null;              // 获取远程的配置链接
    this.tips = false;          //进入大厅是否弹出注册弹窗
    this.signinSwitch = 0;      //签到的开关
    this.rebateSwitch = 0;      //返水的开关
    this.dialSwitch = 0;        //幸运夺宝的开关

    this.plazaShowPanel = [];   //大厅弹窗数据

    this.gameException = false; // PHP及时通知状态   账号异常
    this.KickOutGame = false;   //PHP及时通知状态   封停 、踢下线

    //验证码倒计时
    this.retrieveVerifiCD = 60;     //注册验证码倒计时
    this.phoneLoginVerifiCD = 60;   //手机登录验证码倒计时
    this.bindPhoneVerifiCD = 60;    //绑定手机验证码倒计时
    this.untiedVerifiCD = 60;       //解绑手机验证码倒计时

};
/**
 *push
 */
user.pushPlazaShowPanel = function (value) {
    this.plazaShowPanel.push(value)
}
/**
 * 注册事件监听
 * 数据模型的事件无需销毁
 * 理论上重启游戏后就不存在了
 */
user.registerEvent = function () {
    glGame.emitter.on("loginSuccess", this.loginSuccess, this);
    glGame.emitter.on("onPhpMessage", this.onPhpMessage, this);
};

user.loginSuccess = function () {
    this.reqUrl();
    this.reqMyInfo();
    this.reqReqCheckOrder();
};

/**
 * Php通过pomelo向客户端推送消息
 * type
 * 1:新邮件 2：新跑马 3:新公告
 * 4：封停账号 5：禁止游戏 6：禁止取现 7：踢出游戏 8:禁止领取返水 9：禁止积分夺宝
 * 10：禁止充值 11：禁止领取优惠活动 12：禁止领取推广奖励   13：禁止领取签到奖励
 * 16:解除封停游戏 17：解除禁止游戏 18：解除禁止取现,19:刷新myinfo
 * 7：踢出游戏 直接让他重登
 */
user.onPhpMessage = function (msg) {
    switch (msg.type) {
        case 1:
            this.ReqRedDot();                       //刷新红点状态
            break;
        case 2:
            if (cc.director.getScene().name != "plaza") return
            glGame.notice.reqGetHorseRaceLamp()     //获取跑马数据
            break;
        case 3:
            glGame.emitter.emit("newrotice");       //在紧急公告脚本监听
            break;
        case 4:
        case 7:
            if (cc.director.getScene().name == "plaza" || cc.director.getScene().name == "login") {
                this.KickOutGame = false;
                glGame.panel.showMsgBox("", "        您好，您的账号存在异常，请及时联系客服！", () => { glGame.logon.reLogon() }); break;
            } else {
                this.KickOutGame = true;
            }
            break;
        case 5:
            if (cc.director.getScene().name == "plaza" || cc.director.getScene().name == "login") {
                this.limitGame = false;
            } else {
                this.limitGame = true;
            }
            this.ReqRedDot();
            this.reqMyInfo();
            break;
        case 6:
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
            if (cc.director.getScene().name == "plaza" || cc.director.getScene().name == "login") {
                this.gameException = false;
            } else {
                this.gameException = true;
            }
            this.ReqRedDot();
            this.reqMyInfo();
            break;
        case 16:
        case 17:
        case 18:
            this.ReqRedDot();
            this.reqMyInfo();
            break;
        case 19:
            this.reqMyInfo();
            break;
        case 20:
            this.reqHomeView();
            break;
        default:
            console.log("未定义类型......", msg.type)
            break;
    }
};
user.reqHomeView = function (msg) {
    glGame.gameNet.send_msg("http.reqHomeView", {}, (route, msg) => {
        this.signinSwitch = msg.signin;
        this.rebateSwitch = msg.rebate;
        this.dialSwitch = msg.dial;
        this.sign_state = msg.sign_state;
        this.loginSwitch = msg.loginSwitch;
        glGame.emitter.emit("updatePlazaSwitch")
    })
};

/**
 * 获取商城数据
 */
user.reqPayGoodsList = function () {
    glGame.gameNet.send_msg('http.ReqPayGoodsList', null, (route, msg) => {
        this.ShopData = this.sortShopData(msg.result);
        glGame.emitter.emit("showShopUI")
    })
};
user.sortShopData = function (shopData) {
    let shopDataArr = [];
    for (let key in shopData) {
        if (shopData[key].sub_type == 99) {
            shopDataArr.unshift(shopData[key]);
        } else {
            shopDataArr.push(shopData[key]);
        }
    }
    return shopDataArr;
};
/**
* 获取URL
* help 客服帮助文档地址
* recharge h5版充值页面
* pay_jump 充值打开应用页面
* dowmload_jump 下载地址
*/
user.reqUrl = function () {
    if (this.url) glGame.emitter.emit("userurldata");
    else {
        glGame.gameNet.send_msg('http.reqUrl', {}, (route, data) => {
            this.url = data;
            glGame.emitter.emit("userurldata");
        });
    }
};
user.reqDownLoadJump = function () {
    if (this.url) glGame.emitter.emit("openDownload");
    else {
        glGame.gameNet.send_msg('http.reqUrl', {}, (route, data) => {
            this.url = data;
            glGame.emitter.emit("openDownload");
        });
    }
};

user.setUrl = function (data) {
    this.url = data;
};
/**
 * 获取玩家信息
 */
user.reqMyInfo = function () {
    glGame.gameNet.send_msg('http.reqMyInfo', null, (route, data) => {
        this.updateUserData(data);
        glGame.emitter.emit("updateUserData");
    });
};
/**
 * 获取可替换头像列表
 */
user.reqGetHeadList = function (sex, number) {
    let msg = { "sex": sex, "number": number }
    glGame.gameNet.send_msg("http.reqGetHeadList", msg, (route, data) => {
        for (let key in data.result) data.result[key] = `${data.result[key]}`;
        this.headList[sex] = data.result;
        glGame.emitter.emit("upheadlist", sex);
    });
};
/**
 * 获取奖项
 */
user.reqDialPrize = function () {
    glGame.gameNet.send_msg("http.reqDialPrize", null, (route, data) => {
        this.dialPrizeList = data.type;
        glGame.emitter.emit("updateDialPrizeList");
    });
};

/**
 * 获取抽奖结果
 */
user.reqDial = function (type) {
    this.myDialResult = null;
    glGame.gameNet.send_msg("http.reqDial", { type: type }, (route, data) => {
        this.dialScore = data.treasure;
        this.myDialResult = data;
        glGame.emitter.emit("getDialResult");
    });
};

/**
 * 获取抽奖跑马灯数据
 */
user.reqDialHorseLantern = function () {
    this.dialHorseData = [];
    glGame.gameNet.send_msg("http.reqDialHorseLantern", null, (route, data) => {
        this.dialHorseData = data.data;
    });
};

/**
 * 获取大奖记录
 */
user.reqDialTopPrizeLog = function () {
    this.dialTopPrize = [];
    glGame.gameNet.send_msg("http.reqDialTopPrizeLog", null, (route, data) => {
        this.dialTopPrize = data.data;
        if (this.dialTopPrize.length > 0) {
            glGame.emitter.emit("updateTopPrize");
        }
    });
};

user.reqDialIntegral = function () {
    glGame.gameNet.send_msg("http.reqDialIntegral", null, (route, data) => {
        this.dialScore = data.treasure;
        this.betDialScore = data.chip_in;
        this.scoreBet = data.score_bet;
        this.dialRefreshTime = data.time;
        this.dialRefreshType = data.type;
        glGame.emitter.emit("updateDialScore");
    });
};

/**
 * 获取大奖记录
 */
user.reqDialPersonal = function () {
    this.myDialRecord = null;
    glGame.gameNet.send_msg("http.reqDialPersonal", null, (route, data) => {
        this.myDialRecord = data.data;
        glGame.emitter.emit("updateMyRecord");
    });
};


/**
 * 查看玩家是否有新邮件
 */
user.reqUnread = function () {
    glGame.gameNet.send_msg("http.reqUnread", null, (route, data) => {
        if (data.result === 1) {
            this.ReqRedDot();
        }
    });
};
/**
 * 获取广告
 */
user.reqBillboards = function () {
    glGame.gameNet.send_msg("http.reqBillboards", null, (route, data) => {
        glGame.emitter.emit("initBillBoradsUI", data)
    });
};
/**
 * 请求玩家银行记录
 */
user.reqBankCoinList = function (page, pagesize) {
    glGame.gameNet.send_msg("http.reqBankCoinList", { page: page, pagesize: pagesize }, (route, data) => {
        this.bankrecord = data;
        glGame.emitter.emit("updateBankRecord");
    });
};
/**
 * 获取玩家邮件列表
 */
user.reqMailList = function (page, page_size, type) {
    glGame.gameNet.send_msg("http.ReqMailList", { page: page, page_size: page_size, type: type }, (route, data) => {
        this.allEmailMsg = data;
        this.emails = data["maillist"]
        glGame.emitter.emit("updateEmail");
    });
};
//删除指定邮件
user.ReqDeleOneMail = function (mailID) {
    glGame.gameNet.send_msg("http.ReqMailDel", { id: mailID }, (route, data) => {
        glGame.emitter.emit("updateDeleOneMail");
        this.ReqRedDot();
    });
};
//删除全部邮件
user.ReqDeleMail = function (type) {
    glGame.gameNet.send_msg("http.ReqMailAllDel", { type: type }, (route, data) => {
        glGame.emitter.emit("updateDeleMail");
        this.ReqRedDot();
    });
}
//领取指定邮件附件
user.ReqMailGet = function (mailID) {
    glGame.gameNet.send_msg("http.ReqMailGet", { id: mailID }, (route, data) => {
        glGame.emitter.emit("updateGetAttach");
        this.ReqRedDot();
        this.reqMyInfo();
    });
};
//领取全部邮件附件
user.ReqMailAllGet = function () {
    glGame.gameNet.send_msg("http.reqMailAllGet", {}, (route, data) => {
        glGame.emitter.emit("updateGetAllAttach");
        this.ReqRedDot();
        this.reqMyInfo();
    });
};
//获取所有邮箱公告信息
user.ReqNotice = function (page,page_size) {
    glGame.gameNet.send_msg("http.reqNotice", {page:page,page_size:page_size}, (route, data) => {
        this.announceMent = data;
        glGame.emitter.emit("updateAnnounceMent");
    })
};
/**
 * 获取指定ID的邮件信息
 * @param {number} mailID
 */
user.reqMailInfo = function (mailID) {
    glGame.gameNet.send_msg("http.reqMailInfo", { id: mailID }, (route, data) => {
        this.emails.push(data);
        for (let i = 0; i < this.emails.length; i++) {
            if (this.emails[i].id == data.id) {
                this.emails[i] = data;
                glGame.emitter.emit("updateEmailContent", this.emails[i]);
                this.ReqRedDot();
                return;
            }
        }
        glGame.emitter.emit("updateEmailContent", data);

    });
};
/**
 * 获取客服消息
 */
user.reqCustomServer = function (page, size, bool) {
    glGame.gameNet.send_msg("http.ReqCustomServer", { page: page, size: size, bool: bool }, (route, msg) => {
        this.customSever = msg;
        glGame.emitter.emit("updateCustomServer");
    })
};
/**
* 获取余额宝概览接口
*/
user.reqDiscountCoinBalanceSummary = function () {
    glGame.gameNet.send_msg("http.ReqDiscountCoinBalanceSummary", {}, (route, msg) => {
        this.yubaoOverView = msg;
        glGame.emitter.emit("updateYuBaoServer");
    })
}
/**
 * 获取余额宝申请列表接口
 */
user.reqDiscountCoinBalance = function (page, size) {
    glGame.gameNet.send_msg('http.reqDiscountCoinBalance', { page: page, size: size }, (route, msg) => {
        this.yubaoRecord = msg;
        glGame.emitter.emit("updateYuBaoRecord");
    })
}
/**
 * 获取余额宝申领
 */
user.reqDiscountCoinBalanceApply = function () {
    glGame.gameNet.send_msg('http.reqDiscountCoinBalanceApply', {}, (route, msg) => {
        this.yubaoApply = msg;
        glGame.emitter.emit("updateYuBaoApply");
        this.reqMyInfo();
    })
}
/**
 * 金币存入银行
 * @param {number} gold
 */
user.reqBankSave = function (gold) {
    glGame.gameNet.send_msg("http.reqBankSave", { coin: gold }, (route, data) => {
        glGame.panel.showTip(glGame.tips.BANK.SAVE.format(this.cutFloat(gold)));
        this.reqMyInfo();
    })
};
/**
 * 银行取出金币
 * @param {number} gold
 * @param {string} psw
 */
user.reqBankTakeOut = function (gold, psw) {
    glGame.gameNet.send_msg("http.reqBankTakeOut", { coin: gold, pay_password: psw }, (route, data) => {
        glGame.panel.showTip(glGame.tips.BANK.TAKE.format(this.cutFloat(gold)));
        this.reqMyInfo();
    })
};
//浮点型运算取俩位
user.cutFloat = function (num) {
    return (this.getFloat(Number(num).div(100))).toString();
};
//浮点型运算取俩位
user.getFloat = function (value, num = 2) {
    value = Number(value);
    if (isNaN(value)) return;
    if (~~value === value) {
        return value.toString();
    } else {
        return value.toFixed(num);
    }
};

/**
 *  重置用户密码
 * @param msg
 * @param next
 */
user.reqResetPwd = function (msg, next) {
    glGame.gameNet.send_msg("http.reqResetPwd", msg, (route, data) => {
        glGame.panel.showTip(msg.type === 1 ? glGame.tips.USER.PASSWORD.ACC : glGame.tips.USER.PASSWORD.ALP);
        next();
    });
};
/**
 * 更新玩家数据
 */
user.updateUserData = function (data) {
    this.edit_username = data.edit_username;
    this.qq = data.qq;
    this.wechat = data.wechat;
    this.email = data.email;
    this.name = data.name;
    this.birthday = data.birthday_month;
    this.grade_id = data.grade_id;
    this.grade_name = data.grade_name;
    this.nickname = data.nickname;
    this.userName = data.username;
    this.userID = data.id;
    this.logicID = data.logicid;
    this.gold = data.gold;
    this.coin = data.coin;
    this.bank_coin = data.bank_coin;
    this.guarantee_income = data.guarantee_income;
    this.real_income = data.real_income;
    this.recessive_coin = data.recessive_coin;
    this.accType = data.plat;
    this.phone = data.phone;
    this.alipayAcc = data.alipay;
    this.alipayName = data.alipay_name;
    this.bankCardNum = data.bank_card;
    this.bankCardName = data.bank_name;
    this.bankCardType = data.bank_type;
    this.headURL = data.headurl;
    this.userSex = data.sex;
    this.pay_password = data.pay_password;
    this.daily_win = data.daily_win;
    this.all_win = data.all_win;
    this.vip_name = data.vip_name;
    this.suspicious = data.suspicious // 可疑会员 1可疑 2 非可疑
    //以下参数基于可疑会员 1可以 2 禁止
    this.withdraw = data.withdraw // 提现
    this.recharge = data.recharge // 充值
    this.game = data.game // 是否可以游戏
    this.receive_rebate = data.receive_rebate //领取返水
    this.point_treasure = data.point_treasure //积分夺宝
    this.receive_discount = data.receive_discount // 领取优惠活动
    this.receive_promotion_award = data.receive_promotion_award // 领取推广奖励
    this.receive_Signin_award = data.receive_Signin_award // 领取签到奖励
    this.is_game = data.is_game //针对玩家游戏
    this.is_withdraw = data.is_withdraw // 针对玩家取现
    this.register_gold = data.register_gold//注册赠送金币数
    this.register_gold_type = data.register_gold_type;//赠送类型
    this.tips = data.tips;
    this.is_demo_player = data.is_demo_player; // 是否为试玩会员 1是 2 不是
    this.demo_player = data.demo_player; //1可以 2 禁止
};
/**
 * 是否游客
 */
user.isTourist = function () {
    // PHP 说根据 reqMyInfo 协议数据的 username 判断是否了绑定手机
    // 没有绑定手机就是游客
    return this.grade_id === 1;
};
/**
 * 是否绑定支付宝
 */
user.isBindAlipay = function () {
    return this.alipayAcc !== "";
};
/**
 * 是否绑定银行卡
 */
user.isBindBankCard = function () {
    return this.bankCardNum !== "";
};

/**
 * 推广分享开关
 * @param {Object} msg
 */
user.reqUserExtensionSwitch = function (msg) {
    glGame.gameNet.send_msg('http.ReqUserExtensionSwitch', msg, (route, msg) => {
        glGame.emitter.emit("checkExtensionSwitch", msg.switch);
    });
};
/**
 * 绑定支付宝
 * @param {string} alipayID
 * @param {string} alipayName
 */
user.reqBindAlipay = function (alipayID, alipayName) {
    glGame.gameNet.send_msg('http.reqBindAlipay', { alipay: alipayID, alipay_name: alipayName }, (route, msg) => {
        this.reqMyInfo();
        glGame.emitter.emit("bindPaySuccess");
        glGame.panel.showTip(glGame.tips.USER.BIND.ALP);
    })
};
/**
 * 绑定银行卡
 * @param {number} bank_id 银行id
 * @param {string} bank_card 银行卡号
 * @param {string} name 银行卡所有人签名
 */
user.reqBindBank = function (bank_id, bank_card, name) {
    glGame.gameNet.send_msg('http.reqBindBank', { bank_id: bank_id, bank_card: bank_card, name: name }, (route, msg) => {
        this.reqMyInfo();
        glGame.emitter.emit("bindPaySuccess");
        glGame.panel.showTip(glGame.tips.USER.BIND.BANK);
    })
};

/**
 * 玩家提现
 * @param {number} amount 提现数额
 * @param {number} type 提现方式: 2: 银行卡 1: 支付宝
 */
user.reqWithdraw = function (amount, type, pwd) {
    glGame.gameNet.send_msg('http.reqWithdraw', { amount: amount.mul(100), type: type, code: pwd }, (route, msg) => {
        this.reqMyInfo();
        glGame.emitter.emit("withdrawSuccess");
    });
};
/**
 * 找回密码发送验证码
 * @param {Object} msg  type 8为找回密码
 */
user.ReqPostPhoneCode = function (msg) {
    if (this.retrievePswState) return;
    glGame.gameNet.send_msg('http.ReqPostPhoneCode', msg, (route, msg) => {
        this.retrievePswState = true;

        this.retrieveUpdateVerifiCD = setInterval(() => {
            if (this.retrieveVerifiCD < 0) {
                clearInterval(this.retrieveUpdateVerifiCD);
                this.retrieveUpdateVerifiCD = null;
                this.retrieveVerifiCD = 60;
                this.retrievePswState = false;
            } else {
                glGame.emitter.emit("retrievePswCD", this.retrieveVerifiCD);
                this.retrieveVerifiCD--;
            }
        }, 1000)
        if (msg.is_code == 0) {
            glGame.panel.showErrorTip("发送验证码间隔过短");
        }
    });
};
/**
 * 清除找回密码定时器
 */
user.clearPostPhoneInterval = function () {
    if (this.retrieveUpdateVerifiCD) {
        clearInterval(this.retrieveUpdateVerifiCD);
        this.retrieveUpdateVerifiCD = null;
        this.retrieveVerifiCD = 60;
        this.retrievePswState = false;
    }
};
/**
 * 手机登录发送验证码
 * @param {Object} msg  type 9 手机登录
 */
user.reqPhoneCode = function (msg) {
    if (this.phoneCodeState) return;
    glGame.gameNet.send_msg('http.ReqPostPhoneCode', msg, (route, msg) => {
        this.phoneCodeState = true;

        this.phoneUpdateVerifiCD = setInterval(() => {
            if (this.phoneLoginVerifiCD < 0) {
                clearInterval(this.phoneUpdateVerifiCD);
                this.phoneUpdateVerifiCD = null;
                this.phoneLoginVerifiCD = 60;
                this.phoneCodeState = false;
            } else {
                glGame.emitter.emit("phoneCodeCD", this.phoneLoginVerifiCD);
                this.phoneLoginVerifiCD--;
            }
        }, 1000)
        if (msg.is_code == 0) {
            glGame.panel.showErrorTip("发送验证码间隔过短");
        }
    });
};
/**
 * 清除手机登录定时器
 */
user.clearPhoneInterval = function () {
    clearInterval(this.phoneUpdateVerifiCD);
    this.phoneUpdateVerifiCD = null;
    this.phoneLoginVerifiCD = 60;
    this.phoneCodeState = false;
};
/**
 * 绑定手机发送验证码
 * @param {Object} msg  type 1 绑定手机
 */
user.reqBindPhoneCode = function (msg) {
    if (this.bindPhoneCodeState) return;
    glGame.gameNet.send_msg('http.ReqPostPhoneCode', msg, (route, msg) => {
        this.bindPhoneCodeState = true;

        this.bindPhoneCD = setInterval(() => {
            if (this.bindPhoneVerifiCD < 0) {
                clearInterval(this.bindPhoneCD);
                this.bindPhoneCD = null;
                this.bindPhoneVerifiCD = 60;
                this.bindPhoneCodeState = false;
            } else {
                glGame.emitter.emit("bindPhoneCodeCD", this.bindPhoneVerifiCD);
                this.bindPhoneVerifiCD--;
            }
        }, 1000)
        if (msg.is_code == 0) {
            glGame.panel.showErrorTip("发送验证码间隔过短");
        }
    });
};
/**
 * 清除绑定手机定时器
 */
user.clearBindPhoneInterval = function () {
    clearInterval(this.bindPhoneCD);
    this.bindPhoneCD = null;
    this.bindPhoneVerifiCD = 60;
    this.bindPhoneCodeState = false;
};
/**
 * 解绑手机发送验证码
 * @param {Object} msg  type 10 解绑手机
 */
user.reqUntiedCode = function (msg) {
    if (this.untiedCodeState) return;
    glGame.gameNet.send_msg('http.ReqPostPhoneCode', msg, (route, msg) => {
        this.untiedCodeState = true;

        this.UpdateCD = setInterval(() => {
            if (this.untiedVerifiCD < 0) {
                clearInterval(this.UpdateCD);
                this.UpdateCD = null;
                this.untiedVerifiCD = 60;
                this.untiedCodeState = false;
            } else {
                glGame.emitter.emit("UntiedCode", this.untiedVerifiCD);
                this.untiedVerifiCD--;
            }
        }, 1000)
        if (msg.is_code == 0) {
            glGame.panel.showErrorTip("发送验证码间隔过短");
        }
    });
};
/**
 * 清除解绑手机定时器
 */
user.clearUntiedInterval = function () {
    clearInterval(this.UpdateCD);
    this.UpdateCD = null;
    this.untiedVerifiCD = 60;
    this.untiedCodeState = false;
};

/**
 * 找回密码
 * @param {Object} msg
 * @param msg.phone 手机号码
 * @param msg.pwd 新密码
 * @param msg.code 验证码
 */
user.ReqRetrievePwd = function (msg) {
    glGame.gameNet.send_msg('http.ReqRetrievePwd', msg, (route, msg) => {
        glGame.panel.showMsgBox("", "修改密码成功！");
        glGame.emitter.emit("changePswSuccess");
    });
}
/**
 * 玩家头像更换
 * @param headID
 * @param next
 */
user.reqEditHead = function (headID, next) {
    glGame.gameNet.send_msg('http.reqEditHead', { head_id: headID }, (route, msg) => {
        if (msg.result) {
            this.reqMyInfo();
            glGame.panel.showTip(glGame.tips.USER.CHANGEHEAD.SUCCESS);
            next()
        }
    });
};
/**
 * 登录后修改密码
 * @param {Object} msg
 */
user.reqEditPwd = function (msg) {
    glGame.gameNet.send_msg('http.reqEditPwd', msg, (route, msg) => {
        if (msg.result) {
            this.reqMyInfo();
            glGame.panel.showTip(glGame.tips.USER.PASSWORD.ACC);
            glGame.emitter.emit("editpswsuccess");
        }
    });
};
/**
 * 获取玩家指定游戏的最近十条牌局记录
 * @param gameID
 */
user.reqUserHandRecords = function (gameID, pageSize = 300, pageIndex = 1) {
    glGame.gameNet.send_msg('http.reqUserHandRecords', { gameid: gameID, page: pageIndex, page_size: pageSize }, (route, msg) => {
        this.userGameRecord[gameID] = msg;
        glGame.emitter.emit("updateGameRecord", msg);
    })
},
    /**
     * 设置玩家属性
     * @param {String} key
     * @param {Object} value
     */
    user.set = function (key, value) {
        this[key] = value;
    };
/**
 * 获取玩家属性
 * @param {String} key
 * @returns {Object}
 */
user.get = function (key) {
    return this[key];
};
/**
 * 清空玩家信息
 */
user.destroy = function () {
    this.resetData();
};
/**
 * 打开银行请求
 */
user.reqGetBankCoin = function () {
    glGame.gameNet.send_msg('http.ReqGetBankCoin', {}, (route, msg) => {
        this.bank_coin = msg.bank_coin;
        glGame.emitter.emit("updateBankCoin");
    })
}
/**
 * 获取玩家返水最近50条牌局记录 和 获取是否开启返水按钮信息
 * 描述: userPumpRecord { 0: 保存返水记录 ,  1: 保存返水提取记录 }
 */
user.ReqRebateRecord = function () {
    glGame.gameNet.send_msg('http.ReqRebateRecord', {}, (route, msg) => {
        this.userPumpRecord[0] = msg;
        this.mode_type = msg.mode_type;
        glGame.emitter.emit("updateReqRebateRecord");
    })
}
/**
 * 获取玩家返水提取最近20条牌局记录
 * 描述: userPumpRecord { 0: 保存返水记录 ,  1: 保存返水提取记录 }
 */
user.ReqRebateFlowRecord = function () {
    glGame.gameNet.send_msg('http.ReqRebateFlowRecord', {}, (route, msg) => {
        this.userPumpRecord[1] = msg;
        glGame.emitter.emit("updateReqRebateFlowRecord");
    })
}
/**
 * 获取用户返水申请
 * @param money
 */
user.ReqRebateApply = function () {
    glGame.gameNet.send_msg('http.ReqRebateApply', {}, (route, msg) => {
        this.reqMyInfo();//更新金额
        this.reqUnread();//更新邮箱
        glGame.emitter.emit("updateReqRebateApply", msg);
    })
}
/**
 * 获取用户返水领取
 */
user.ReqRebateReceive = function () {
    glGame.gameNet.send_msg('http.ReqRebateReceive', {}, (route, msg) => {
        this.userPumpMoney = msg;
        glGame.emitter.emit("updateReqRebateReceive ", msg);
    })
}
/**
* 获取返水比例
*/
user.ReqRebateVipList = function () {
    glGame.gameNet.send_msg('http.ReqRebateVipList', {}, (route, msg) => {
        this.mode_type = msg.mode_type;
        this.RebateVipList = msg.data;
        glGame.emitter.emit("rebateVipList");
    })
}
/**
* 获取签到是否领取
*/
user.reqSigninWeekInfo = function () {
    glGame.gameNet.send_msg('http.reqSigninWeekInfo', {}, (route, msg) => {
        this.userSignin = msg;
    })
}
/**
 * 获取红点
 * mailReq 系统邮件
 * mailcapitalreq 资金邮件
 * discountReq 活动
 * playerRebatReq 返水
 * dialRed 积分夺宝
 * signinReq 签到
 * extensionReq 推广
 * payingReq 余额宝
 * vipReq 个人中心
 */
user.ReqRedDot = function () {
    glGame.gameNet.send_msg('http.ReqRedDot', {}, (route, msg) => {
        this.redDotData = msg.result;
        glGame.emitter.emit("ReqRedDot", msg.result);
    })
}
/**
* 获取玩家是否首冲
*/
user.reqReqCheckOrder = function () {
    glGame.gameNet.send_msg('http.ReqCheckOrder', {}, (route, msg) => {
        this.userRecharge = msg;
        glGame.emitter.emit("gl.sceneUi");
    })
}
user.getRankListData = function () {
    return this.rankData;
}
/**
* 金币显示缩进中文描述
* @param {number}  gold
* @return {String}
*/
user.GoldTemp = function (gold) {
    let strGold = ""
    if (typeof gold == 'number') {
        gold = gold.div(100);
        if (gold >= 10000000000000) {
            strGold = `${this.stringFix(gold.div(100000000).toString(), 0)}亿`;
        } else if (gold >= 1000000000000) {
            strGold = `${this.stringFix(gold.div(100000000).toString(), 1)}亿`;
        } else if (gold >= 100000000000) {
            strGold = `${this.stringFix(gold.div(100000000).toString(), 2)}亿`;
        } else if (gold >= 10000000000) {
            strGold = `${this.stringFix(gold.div(100000000).toString(), 3)}亿`;
        } else if (gold >= 1000000000) {
            strGold = `${this.stringFix(gold.div(100000000).toString(), 4)}亿`;
        } else if (gold >= 100000000) {
            strGold = `${this.stringFix(gold.div(10000).toString(), 1)}万`;
        } else if (gold >= 10000000) {
            strGold = `${this.stringFix(gold.div(10000).toString(), 2)}万`;
        } else if (gold >= 1000000) {
            strGold = `${this.stringFix(gold.div(10000).toString(), 3)}万`;
        } else {
            strGold = this.stringFix(gold.toString(), 2)
        }
    }
    return strGold;
}
user.EnterRoomGoldTemp = function (gold) {
    let strGold = ""
    if (typeof gold == 'number') {
        gold = gold.div(100);
        if (gold >= 10000000000000) {
            strGold = `${this.stringFix(gold.div(100000000).toString(), 0)}亿`;
        } else if (gold >= 1000000000000) {
            strGold = `${this.stringFix(gold.div(100000000).toString(), gold % 100000000 >= 10000000 ? 1 : 0)}亿`;
        } else if (gold >= 100000000000) {
            strGold = `${this.stringFix(gold.div(100000000).toString(), gold % 100000000 >= 1000000 ? 2 : 0)}亿`;
        } else if (gold >= 10000000000) {
            strGold = `${this.stringFix(gold.div(100000000).toString(), gold % 100000000 >= 100000 ? 3 : 0)}亿`;
        } else if (gold >= 1000000000) {
            strGold = `${this.stringFix(gold.div(100000000).toString(), gold % 100000000 >= 10000 ? 4 : 0)}亿`;
        } else if (gold >= 100000000) {
            strGold = `${this.stringFix(gold.div(10000).toString(), gold % 10000 >= 1000 ? 1 : 0)}万`;
        } else if (gold >= 10000000) {
            strGold = `${this.stringFix(gold.div(10000).toString(), gold % 10000 >= 100 ? 2 : 0)}万`;
        } else if (gold >= 1000000) {
            strGold = `${this.stringFix(gold.div(10000).toString(), gold % 10000 >= 10 ? 3 : 0)}万`;
        } else {
            strGold = this.stringFix(gold.toString(), gold % 1 > 0 ? 2 : 0)
        }
    }
    return strGold;
}
user.stringFix = function (str, num) {
    if (str.indexOf('.') == -1) {
        str = str + '.';
        for (let i = 0; i < num; i++) {
            str = str + '0';
        }
    } else {
        if (str.slice(str.indexOf('.') + 1).length < num) {
            for (let i = 0; i < num - str.slice(str.indexOf('.') + 1).length; i++) {
                str = str + '0';
            }
        } else {
            for (let i = 0; i < str.slice(str.indexOf('.') + 1).length - num; i++) {
                str = str.substr(0, str.length - (str.slice(str.indexOf('.') + 1).length - num));
            }
        }
    }
    if (!num && str.indexOf('.') != -1) {
        str = str.substr(0, str.length - 1);
    }
    return str;
}

module.exports = function () {
    if (!g_instance) {
        g_instance = new User();
    }
    return g_instance;
};

module.exports = {
    // 银行
    BANK: {
        SAVE: "成功将%s金币存入银行",
        TAKE: "成功将%s金币从银行取出",
        NONUMBER: "操作金额必须是不多于两位小数的数字",
        SAVELITTLE: "存入金额必须大于0",
        TAKELITTLE: "取出金额必须大于0",
        SAVEMUCH: "存入金额不能超过携带数额",
        TAKEMUCH: "取出金额不能超出金库数额",
    },
    // 兑换
    EXCHANGE: {
        LOCK: "您的当前流水未达到取现条件，如有疑问请联系客服",
        NONUMBER: "操作金额必须是数字",
        EXCLITTLE: "兑换金额必须大于0",
        EXCLIMIT: "兑换金额必须是50的整数倍",
        MINGOLD: "兑换后剩余金币少于10,无法兑换",
        LESSGOLD: "兑换后剩余金币不足以支付手续费，无法兑换",
        CONFIRMEXC: "确认要兑换%s金币?",
        EXCSTATE: ["等待审核", "审核通过", "取消申请", "审核不通过"],
    },
    // 玩家
    USER: {
        PASSWORD: {
            ACC: "修改密码成功！",
            ALP: "修改密码成功！",
            UNCHANGE:"禁止修改密码",
        },
        BIND: {
            PHONE: "手机号码绑定成功",
            UNTIED: "手机号解绑成功",
            ALP: "支付宝绑定成功",
            BANK: "银行卡绑定成功",
            BANKCARDNULL: "请输入银行卡号",
            BANKFORGERY: "银行卡号位数过少",
            BANKCARDTYPEERR: "银行卡号只允许输入数字",
            BANKCARDHOLDERERR: "银行卡持有人姓名填写错误",
            BANKTYPEERR: "请选择银行",
            ALPIDNULL: "请输入支付宝账号",
            ALPIDTYPEERR: "支付宝账号不能包含特殊字符",
            ALPHOLDERERR: "请输入支付宝用户名",
        },
        UNBIND: {
            ALP: "支付宝解绑成功",
            BANK: "银行卡解绑成功"
        },
        CHANGEHEAD: {
            SUCCESS: "更换头像成功",
            FAIL: "没有选择新头像"
        },
        GOLDLACK: {
            TITLE: "金币不足",
            CONTENT: "金币不足,是否前往充值?"
        },
        EDITINFO: {
            ACC: "修改账号成功",
            NICKNAME: "修改昵称成功",
            BASEINFO: "修改个人资料成功",
            UNEDITACC: "不允许修改账号",
            UNCODE: "请输入验证码"
        }
    },
    // 输入框检查
    EDITBOX: {
        VERIFINULL: "请输入验证码！",
        PHONENULL: "请输入手机号码！",
        PHONETYPEERR: "请输入11位数字手机号！",
        BANKPSWPSW: "请输入您要设置的取款密码！",
        ACCNULL: "请输入账号！",
        ACCERROR: "账号值可由数字和英文组成！",
        PSWNULL: "请输入您要设置的密码！",
        PSWWRONGFUL: "密码包含特殊符号, 请重新输入！",
        PSWCOFAIL: "两次输入的密码不一致, 请重新输入！",
        NEWPSWNULL: "请输入新密码！",
        NEWPSWWRONGFUL: "新密码包含特殊符号, 请重新输入！",
        CONFIRMPSWNULL: "两次输入的密码不一致, 请重新输入！",
        CONFIRMPSWWRONGFUL: "两次输入的密码不一致, 请重新输入！",
        OLDNEWPSWEQUALS: "新旧密码一致, 修改失败！",
        BANKPSWNULL: "请输入银行密码！",
        BANKPSWFAIL: "银行密码错误！",
    },
    // 网络错误码
    ERRORCODE: {

    },
    REGISTRATION: {
        BIRTHDAY: "请输入出生日期",
        VERIFICA: '验证码输入有误，请重新输入！',
        WITHDRAWALPSW: "请输入您要设置的取款密码！",
        WITHDRAWALPSWLENGTH: "取款码请输入4~6位数字！",
        PROXY: "请输入代理推荐码！",
        PHONENULL: "请输入手机号码！",
        PHONETYPE: "请输入11位数字手机号！",
        VERIFINULL: "请输入验证码！",
        ACCNULL: "请输入账号！",
        ACCLENGTH: '账号只允许输入2~15个字符！',
        ACCTYPE: '账号只可以由数字和英文组成！',
        QQNULL: "QQ号不能为空！",
        QQTYPE: "请输入正确格式的QQ号码！",
        WECHATNULL: "微信号不能为空！",
        WECHATTYPE: "请输入正确格式的微信号码！",
        NAMENULL: "姓名不能为空！",
        NAMELENGTH: "姓名只允许输入4~12个字符！",
        NAMETYPE: "姓名只能输入中文和英文！",
        NICKNAMENULL: "昵称不能为空！",
        NICKNAMELENGTH: "昵称只允许输入4~12个字符！",
        NICKNAMETYPE: "昵称只能输入中文和英文！",
        EMAILNULL: "邮箱不能为空！",
        EMAILTYPE: "请输入正确的邮箱！",
        LOGPSWNULL:"请输入密码!",
        PSWNULL: "请输入您要设置的密码！",
        PSWWRONGFUL: "密码包含特殊符号, 请重新输入！",
        PSWLENGTH: "密码只允许输入6~15个字符",
        PSWCOFAIL: "两次输入的密码不一致, 请重新输入！",
        PROTOCOL: "请您仔细阅读并同意游戏用户协议!",
    },
};
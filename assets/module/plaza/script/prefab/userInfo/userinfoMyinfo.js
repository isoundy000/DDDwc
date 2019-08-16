glGame.baseclass.extend({
    properties: {
        head: cc.Node,
        sexIcon: cc.Node,
        sexIconSpr: [cc.SpriteFrame],

        //set
        label_music: cc.Label,
        label_eff: cc.Label,
        btn_music: cc.Node,
        btn_eff: cc.Node,

        //baseInfo
        base_acc: cc.Label,
        base_phone: cc.Label,
        base_id: cc.Label,
        base_nickname: cc.Label,
        base_editAccBtn: cc.Node,

        //accInfo
        acc_coin: cc.Label,
        acc_bankCoin: cc.Label,
    },
    onLoad() {
        this.brithMonth = 1;
        this.birthDay = 1;
        this.registerEvent();
    },

    start() {
        this.initUI();
    },
    registerEvent() {
        glGame.emitter.on("updateUserData", this.initUI, this);
        glGame.emitter.on("changeSexIcon", this.changeHeadSexIcon, this);
        glGame.emitter.on("unRegisterEventMyinfo", this.unRegisterEventMyinfo, this)
    },
    unRegisterEvent() {
        glGame.emitter.off("updateUserData", this);
        glGame.emitter.off("changeSexIcon", this);
        glGame.emitter.off("unRegisterEventMyinfo", this)

    },

    unRegisterEventMyinfo() {
        this.unRegisterEvent();
    },

    OnDestroy() {
        this.unRegisterEvent();
    },
    changeHeadSexIcon(sex) {
        cc.log("更改了性别", sex)
        let msg = { "sex": sex };
        glGame.gameNet.send_msg('http.reqEditMyInfo', msg, (route, data) => {
            glGame.user.reqMyInfo();
        })
    },

    initUI() {
        //头像
        glGame.panel.showHeadImage(this.head, glGame.user.get("headURL"));
        //基础信息
        this.base_acc.string = glGame.user.get("userName") || "";
        this.base_phone.string = glGame.user.get("phone") || "";
        this.base_id.string = glGame.user.get("logicID") || "";
        this.base_nickname.string = glGame.user.get("nickname") || "";
        //账户信息
        this.acc_coin.string = this.cutFloat(glGame.user.get("coin"));
        this.acc_bankCoin.string = this.cutFloat(glGame.user.get("bank_coin"));
        //声音
        let BGMSE = glGame.audio.get("BGMSE");
        this.btn_music.getChildByName("Background").active = !BGMSE["BGMPlayState"];
        this.btn_music.getComponent(cc.Toggle).isChecked = BGMSE["BGMPlayState"];
        this.label_music.string = BGMSE["BGMPlayState"] ? "开" : "关";
        this.btn_eff.getChildByName("Background").active = !BGMSE["SoundEffectPlayState"];
        this.btn_eff.getComponent(cc.Toggle).isChecked = BGMSE["SoundEffectPlayState"];
        this.label_eff.string = BGMSE["SoundEffectPlayState"] ? "开" : "关";
        this.base_editAccBtn.active = glGame.user.get("edit_username") == 1
    },

    onClick(name, node) {
        switch (name) {
            case "close": this.remove(); break;
            case "btn_changeHead": this.changeHead_cb(); break;
            case "btn_music": this.music_cb(node); break;
            case "btn_eff": this.eff_cb(node); break;
            case "btn_exit": this.switchacc_cb(); break;
            case "btn_changepsw": this.changepsw_cb(); break;

            case 'btn_accEdit': this.accEdit_cb(); break;
            case 'btn_nicknameEdit': this.nicknameEdit_cb(); break;
            case 'btn_editUser': this.userEdit_cb(); break;
            case 'btn_editPhone': this.phoneEdit_cb(); break;
            default:
                break;
        }
    },

    //修改账号
    accEdit_cb() {
        console.log("显示修改账号")
        if (glGame.user.get("edit_username") == 1) {
            glGame.emitter.emit("user_showEditAcc");
        } else {
            glGame.panel.showTip(glGame.tips.USER.EDITINFO.UNEDITACC);
        }
    },

    //修改昵称
    nicknameEdit_cb() {
        console.log("显示修改昵称")
        glGame.emitter.emit("user_showEditNickName");
    },

    //个人资料
    userEdit_cb() {
        console.log("显示个人资料")
        glGame.emitter.emit("user_showUserInfo");
    },

    //修改手机
    phoneEdit_cb() {
        //允许手机更改密码
        if (glGame.user.get("loginSwitch").self_edit_phone == 1) {
            let phone = glGame.user.get("phone");
            if (phone && phone != "") {
                glGame.emitter.emit("user_showBindPhone", 2);       //解绑
            } else {
                glGame.emitter.emit("user_showBindPhone", 1);       //绑定
            }
        }
        //不允许玩家自己修改手机 
        else {
            glGame.emitter.emit("user_showBindPhone", 3);
        }
    },

    //设置
    switchacc_cb() {
        //退出登录清楚缓存是记录密码
        glGame.emitter.emit("exitAcc");
    },
    //修改密码
    changepsw_cb() {
        if (glGame.user.get("loginSwitch").self_edit_login_pwd == 1) {
            glGame.panel.showPanelByName("modifypsw");
        } else {
            glGame.panel.showErrorTip(glGame.tips.USER.PASSWORD.UNCHANGE);
        }
    },

    music_cb(node) {
        let Background = node.getChildByName("Background");
        let isChecked = node.getComponent(cc.Toggle).isChecked;
        Background.active = !isChecked;
        if (isChecked) glGame.audio.openBGM();
        else glGame.audio.closeBGM();
        this.label_music.string = isChecked ? "开" : "关";
    },

    eff_cb(node) {
        let Background = node.getChildByName("Background");
        let isChecked = node.getComponent(cc.Toggle).isChecked;
        Background.active = !isChecked;
        if (isChecked) glGame.audio.openSE();
        else glGame.audio.closeSE();
        this.label_eff.string = isChecked ? "开" : "关";
    },

    changeHead_cb() {
        glGame.panel.showPanelByName("changehead");
    },

    //浮点型运算取俩位
    cutFloat(num) {
        return (Number(num).div(100)).toString();
    },
});

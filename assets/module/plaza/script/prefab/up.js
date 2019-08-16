glGame.baseclass.extend({
    properties: {
        head: cc.Node,          // 玩家头像
        userid: cc.Label,       // 玩家ID
        acctype: cc.Label,      // 玩家账号类型
        gold: cc.Label,         // 玩家金币
        upgradeacc: cc.Node,     //玩家绑定
        pump: cc.Node,           //返水按钮
        signinbtn: cc.Node,          //签到按钮
        luckDraw: cc.Node,
        vip_lab: cc.Label,
        web_label: cc.Label,
        tourist: cc.Node,
        vipNode: cc.Node,

        backWatertip: cc.Node,   //返水红点
        luckytip: cc.Node,       //积分夺宝红点
        singintip: cc.Node,      //签到红点
        viptip: cc.Node,         //VIP红点
        vipLightNode: cc.Node,
    },

    onLoad() {
        this.registerEvent();
        this.showUserInfo();
        this.userurldata();
    },
    OnDestroy() {
        this.unRegisterEvent();
    },
    // 注册界面监听事件
    registerEvent() {
        glGame.emitter.on("updateReqRebateRecord", this.showPump, this);
        glGame.emitter.on('updateSigninActive', this.showSignin, this);
        glGame.emitter.on("updateUserData", this.showUserInfo, this);
        glGame.emitter.on("showBindPhone", this.click_upgradeacc, this);
        glGame.emitter.on("ReqRedDot", this.reqRedDot, this);
        glGame.emitter.on("userurldata", this.userurldata, this);
        glGame.emitter.on("updatePlazaSwitch", this.updatePlazaSwitch, this);

    },
    // 销毁界面监听事件
    unRegisterEvent() {
        glGame.emitter.off("updateReqRebateRecord", this);
        glGame.emitter.off('updateSigninActive', this);
        glGame.emitter.off("updateUserData", this);
        glGame.emitter.off("showBindPhone", this);
        glGame.emitter.off("ReqRedDot", this);
        glGame.emitter.off("userurldata", this);
        glGame.emitter.off("updatePlazaSwitch", this);
    },
    updatePlazaSwitch() {
        console.log(`refresh up switch rebateswitch:${glGame.user.rebateSwitch} signinwitch:${glGame.user.signinSwitch} dialswitch:${glGame.user.dialSwitch}`)
        this.pump.active = glGame.user.rebateSwitch == 1;
        this.signinbtn.active = glGame.user.signinSwitch == 1;
        this.luckDraw.active = glGame.user.dialSwitch == 1;
    },
    userurldata() {
        if (!glGame.user.get("url")) return;
        this.web_label.string = glGame.user.get("url").official_url ? glGame.user.get("url").official_url : ""
    },
    reqRedDot(data) {
        this.backWatertip.active = data['playerRebatReq'] == 1;
        this.luckytip.active = data['dialRed'] == 1;
        this.singintip.active = data['signinReq'] == 1;
        this.viptip.active = data['vipReq'] == 1;
    },
    showPump() {
        let userPumpRecord = glGame.user.get("userPumpRecord");
        let gameRecord = userPumpRecord[0];
        if (!gameRecord) {
            return glGame.user.ReqRebateRecord();
        }
    },
    showSignin() {
        let isOpenSign = glGame.user.get("isOpenSign");
        this.signinbtn.active = isOpenSign.sign_state == 1;
    },
    cutFloat(num) {
        return (this.getFloat(Number(num).div(100)));
    },
    //浮点型运算取俩位
    getFloat(value, num = 2) {
        value = Number(value);
        if (isNaN(value)) return;
        if (~~value === value) {
            return value.toString();
        } else {
            return (Math.floor(value * 100) / 100).toFixed(num);
        }
    },
    //截取小数点后两位
    cutDownNum(value, num = 2) {
        if (isNaN(value)) return;
        if (~~value === value) {
            return value.div(100).toString();
        } else {
            value = Number(value).div(100);
            return (Math.floor(value * 100) / 100).toFixed(num);
        }
    },
    // updateUserData 事件回调函数, 刷新玩家信息UI
    showUserInfo() {
        let coin = glGame.user.get("coin");
        this.gold.string = glGame.user.GoldTemp(coin);
        if (!glGame.user.isTourist()) {
            glGame.panel.showHeadImage(this.head, glGame.user.get("headURL"));
        }
        if (glGame.user.isTourist()) {
            this.tourist.active = true;
            this.vipNode.active = false;
            return;
        }

        this.tourist.active = false;
        this.vipLightNode.active = true;
        this.userid.string = `ID:${glGame.user.get("logicID")}`;
        // this.userid.node.y = glGame.user.isTourist() ? -56 : -22;
        this.userid.node.active = true;
        this.acctype.string = glGame.user.get("nickname") ? glGame.user.get("nickname") : this.acctype.node.active = false;
        this.vip_lab.node.parent.active = true;
        this.vip_lab.string = glGame.user.get("vip_name")
        // 如果是游客就要显示账号升级按钮
    },
    // 重写父类按钮点击事件
    onClick(name, node) {
        switch (name) {
            case "head": this.click_head(); break;
            case "gold": this.click_addgold(); break;
            case "upgradeacc":
            // case "btn_zhuce":
            //     this.click_upgradeacc();
            //     break;
            // case "btn_denglu":
            //     glGame.panel.showRegistration(false);
            //     break;
            case "btn_dengluzhuce": glGame.panel.showRegistration(false); break;
            case "notice": this.click_notice(); break;
            case "setting": this.click_setting(); break;
            case "btn_pump": this.click_pumpTip(); break;
            case "lucky": this.click_lucky(); break;
            case "welfare": this.click_welfare(); break;
            case "signin": this.click_signin(); break;
            case "btn_fuzhi": this.click_officialweb(); break;
            default: console.error("no find button name -> %s", name);
        }
    },
    click_officialweb() {
        glGame.platform.copyToClip(this.web_label.string, "官网");
    },
    click_head() {
        if (glGame.user.isTourist()) {
            glGame.panel.showRegisteredGift(true);
            return;
        }
        glGame.panel.showPanelByName("userinfo");
    },
    click_addgold() {
        glGame.panel.showShop();
        // if (isAndroid) {
        // 	console.log("切换横竖屏lalalalal")
        // 	glGame.platform.setOrientation(2);
        // }
        // glGame.panel.showPanelByName('chargetest');
    },
    click_upgradeacc() {
        glGame.panel.showRegistration(true);
    },
    click_notice() {
        glGame.panel.showPanelByName("notice");
    },
    click_setting() {
        glGame.panel.showSetting(false);
    },
    click_pumpTip() {

        if (glGame.panel.showSuspicious("receive_rebate")) {
            return;
        }
        glGame.panel.showPanelByName('backWater');
    },

    click_lucky() {
        if (glGame.panel.showSuspicious("point_treasure")) {
            return;
        }
        glGame.panel.showPanelByName("luckDrawPanel");
    },
    click_welfare() {
        if (glGame.user.isTourist()) {
            glGame.panel.showRegisteredGift(true);
            return;
        }
        glGame.panel.showPanelByName("announcement");
    },
    click_signin() {
        if (glGame.panel.showSuspicious("receive_Signin_award")) {
            return;
        }
        glGame.panel.showPanelByName('signin')
    }
});

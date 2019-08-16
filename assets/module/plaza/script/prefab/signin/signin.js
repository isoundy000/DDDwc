/**
 * 礼物label：当天未签到显示白色，其他显示黄色
 * 礼物labelbg:当前未签到显示深色底，其他显示浅色底。
 */
glGame.baseclass.extend({

    properties: {
        everyday: cc.Node,
        receiveed: cc.Node,
        interface: cc.Node,
        close: cc.Node,
        nobutton: cc.Node,
        sp_boom: sp.Skeleton,
        sp_light: sp.Skeleton,
        node_get: cc.Node,
        sprite_get: [cc.SpriteFrame],
        sprite_tipBg: [cc.SpriteFrame],
    },

    onLoad() {
        this.fitFunc();
        this.initData();
        this.reqannounceInfo();

    },

    initData() {
        this.rewardInfo = null;
        this.todayIsSign = false;
        this.signTimes = 0;
    },

    //适配
    fitFunc() {
        let designRate = 720 / 1280;
        let winSize = cc.view.getVisibleSize();
        let curRate = winSize.height / winSize.width;
        let scaleRate = curRate < designRate ? winSize.height / 720 : winSize.width / 1280;
        this.interface.setScale(scaleRate);
    },



    //请求签到的信息
    reqannounceInfo() {
        //拉取七天信息
        glGame.gameNet.send_msg("http.reqSigninWeekInfo", {}, (route, msg) => {
            this.rewardInfo = msg.signinfo;//今日是否领取奖励
            this.todayIsSign = msg.today_is_sign;
            this.updateUi();
            console.log('signinfo', msg)
        })

    },

    initUI() {
        for (let i = 0; i < 7; i++) {
            this.everyday.children[i].getChildByName('receive').active = false;
            this.everyday.children[i].getChildByName('getReceive').active = false;
            this.everyday.children[i].getChildByName('today').active = false;
        }
    },
    updateUi() {
        this.initUI();
        this.signTimes = 0;
        let tiplayout;
        for (let i = 0; i < this.rewardInfo.length; i++) {
            tiplayout = this.everyday.children[i].getChildByName("tiplayout")

            //是否已签到
            if (this.rewardInfo[i].is_sign) {
                this.everyday.children[this.signTimes].getChildByName('receive').active = true;
                this.everyday.children[this.signTimes].getChildByName('today').active = false;
                this.everyday.children[this.signTimes].getChildByName("spr_coinBg").getComponent(cc.Sprite).spriteFrame = this.sprite_tipBg[0];
                tiplayout.children[0].color = new cc.Color(255, 225, 167);
                tiplayout.children[1].color = new cc.Color(255, 225, 167);
                this.everyday.children[this.signTimes].getChildByName('getReceive').active = true;
                this.signTimes++;
            }
            //渲染金币
            if (this.rewardInfo[i].coin) {
                tiplayout.getChildByName("cointip").active = true;
                if (this.rewardInfo[i].coin_range.length == 1) {
                    tiplayout.getChildByName("cointip").getComponent(cc.Label).string = this.getFixNumber(this.rewardInfo[i].coin_range[0]) + "金币";
                } else if (this.rewardInfo[i].coin_range.length == 2) {
                    tiplayout.getChildByName("cointip").getComponent(cc.Label).string = this.getFixNumber(this.rewardInfo[i].coin_range[0]) + "~" + this.getFixNumber(this.rewardInfo[i].coin_range[1]) + "金币";
                }
            }
            //渲染转盘积分
            if (this.rewardInfo[i].integral) {
                tiplayout.getChildByName("turntip").active = true;
                if (this.rewardInfo[i].integral_range.length == 1) {
                    tiplayout.getChildByName("turntip").getComponent(cc.Label).string = this.getFixNumber(this.rewardInfo[i].integral_range[0]) + "转盘积分";
                } else if (this.rewardInfo[i].integral_range.length == 2) {
                    tiplayout.getChildByName("turntip").getComponent(cc.Label).string = this.getFixNumber(this.rewardInfo[i].integral_range[0]) + "~" + this.getFixNumber(this.rewardInfo[i].integral_range[1]) + "转盘积分";
                }
            }
        }

        //今日还没签到
        if (!this.todayIsSign) {
            this.everyday.children[this.signTimes].getChildByName('today').active = true;
            this.everyday.children[this.signTimes].getChildByName('today').getComponent(sp.Skeleton).setAnimation(0, "animation", true);
            this.everyday.children[this.signTimes].getChildByName("spr_coinBg").getComponent(cc.Sprite).spriteFrame = this.sprite_tipBg[1];
            let tiplayout = this.everyday.children[this.signTimes].getChildByName("tiplayout")
            tiplayout.children[0].color = new cc.Color(255, 255, 255);
            tiplayout.children[1].color = new cc.Color(255, 255, 255);
            this.everyday.children[this.signTimes].getChildByName('dayTimeWhite').active = true;
            this.everyday.children[this.signTimes].getChildByName('dayTime').active = false;
            this.receiveed.getComponent(cc.Button).interactable = true
        } else {
            this.everyday.children[this.signTimes].getChildByName('dayTimeWhite').active = false;
            this.everyday.children[this.signTimes].getChildByName('dayTime').active = true;
            this.receiveed.getComponent(cc.Button).interactable = false
        }
    },

    //金币数量或积分
    sevenInfo() {
        glGame.gameNet.send_msg("http.reqSignin", {}, (route, msg) => {
            this.reqannounceInfo();
            this.gold = msg;
            this.gold_recelive();
            glGame.user.reqMyInfo();
            glGame.user.reqDialIntegral();
            glGame.user.ReqRedDot();
        })

    },

    // 重写父类按钮点击事件
    onClick(name, node) {

        switch (name) {
            case "receive": this.click_receive(); break; //领取
            case "close": this.click_close(); break;   //关闭
            case "btn_sure": this.node_get.active = false; break;
            default: console.error("no find button name -> %s", name);
        }
    },

    click_close() {
        this.remove();
    },

    getFixNumber(value) {
        return (Number(value).div(100)).toString();
    },

    //判断今天星期几，领取后显示相关的奖励
    click_receive() {
        if (glGame.user.isTourist()) {
            glGame.panel.showRegisteredGift(true);
            return
        }
        if (!this.todayIsSign) {
            this.sevenInfo();
            this.receiveed.getComponent(cc.Button).interactable = false
        } else {
            glGame.panel.showErrorTip('今日已签到，请明日再来~');
        }
    },

    //领取完
    gold_recelive() {
        glGame.audio.playSoundEffectByPath("modules/public/res/audio/jinbi");
        this.node_get.active = true;
        let layout = this.node_get.getChildByName('layout')
        this.sp_light.node.active = true;
        this.sp_boom.node.active = true;
        this.sp_boom.setAnimation(0, 'animation', false);
        this.sp_light.setAnimation(0, 'animation', true);
        this.sp_boom.setCompleteListener(() => { this.sp_boom.node.active = false; })
        if (this.gold.integral == 0) {
            layout.getChildByName('coin').getComponent(cc.Label).string = `${this.getFixNumber(this.gold.coin)}金币`
            this.node_get.getChildByName('lay_prient').y = 0;
        } else {
            this.node_get.getChildByName('lay_prient').y = -20;
            this.node_get.getChildByName('lay_prient').getChildByName('prisent').active = true;
            this.node_get.getChildByName('lay_prient').getChildByName('truntable').active = true;
            layout.getChildByName('point').active = true;
            layout.getChildByName('coin').getComponent(cc.Label).string = `${this.getFixNumber(this.gold.coin)}金币`
            layout.getChildByName('point').getComponent(cc.Label).string = `${this.getFixNumber(this.gold.integral)}幸运夺宝积分！`
        }
        let signinMoney = this.getFixNumber(this.gold.coin)
        let type = 0;
        if (signinMoney >= 0.01 && signinMoney <= 1) {
            type = 0;
        } else if (signinMoney >= 1.01 && signinMoney <= 6) {
            type = 1;
        } else if (signinMoney >= 6.01 && signinMoney <= 20) {
            type = 2;
        } else if (signinMoney >= 20.01 && signinMoney <= 50) {
            type = 3;
        } else if (signinMoney > 50) {
            type = 4;
        }
        this.node_get.getChildByName('lay_prient').getChildByName('prisent').getComponent(cc.Sprite).spriteFrame = this.sprite_get[type]
        if (type == 4) {
            this.node_get.getChildByName('lay_prient').getChildByName('truntable').scale = 0.6;
            this.node_get.getChildByName('lay_prient').getChildByName('truntable').y = -45;
            this.node_get.getChildByName('lay_prient').getChildByName('truntable').zIndex = 100;
            this.node_get.getChildByName('lay_prient').getChildByName('prisent').zIndex = 1;
            this.node_get.getChildByName('lay_prient').getComponent(cc.Layout).spacingX = -70;
            this.node_get.getChildByName('lay_prient').y = 0
        } else if (type == 3) {
            this.node_get.getChildByName('lay_prient').getChildByName('truntable').scale = 0.6;
            this.node_get.getChildByName('lay_prient').getChildByName('truntable').y = -45;
            this.node_get.getChildByName('lay_prient').y = 0

        } else {
            if (this.gold.integral != 0) {
                this.node_get.getChildByName('lay_prient').y = -20
            }
        }
    },

    //点击任意位置，关闭界面
    position_recelive() {
        this.node.destroy();
    },
    OnDestroy() {

    },

});

glGame.baseclass.extend({
    properties: {
        viplayout: cc.Node,

        lab_viplevel1: cc.Label,        //左边图标的等级 只需要显示1
        lab_viplevel2: cc.Label,        //当前会员等级：需要显示VIP1
        lab_viplevel3: cc.Label,        //curlevel 显示VIP1
        lab_vipNextlevel: cc.Label,     //下一个等级
        lab_vipLevelTip: cc.Label,      //升级提示

        lab_privilege: cc.Label,
        lab_lastLevel: cc.Label,
        lab_nextLevel: cc.Label,
        node_lastRedDot: cc.Node,
        node_nextRedDot: cc.Node,
        node_nextLevel: cc.Node,
        progress: cc.Sprite,

        btn_sprite: [cc.SpriteFrame],

        btn_caijin: cc.Node,
        lab_caijin: cc.Label,
        lab_caijinUnit: cc.Label,
        btnlab_caijin: cc.Label,
        btn_week: cc.Node,
        lab_week: cc.Label,
        lab_weekUnit: cc.Label,
        btnlab_week: cc.Label,
        btn_month: cc.Node,
        lab_month: cc.Label,
        lab_monthUnit: cc.Label,
        btnlab_month: cc.Label,
        btn_deatil: cc.Node,
        lab_deatil: cc.Label,

        audio_coin: {
            type: cc.AudioClip,
            default: null
        },
    },
    onLoad() {
        this.registerEvent();
        this.ReqVipInfo();
    },
    start() {
        this.node.getComponent(cc.Widget).updateAlignment();            //挂载到父节点要立刻刷新widget
        this.adaptation();
    },
    adaptation() {
        let viplayout = this.viplayout.getComponent(cc.Layout);
        let width = this.node.width;
        viplayout.paddingLeft = 20 / 990 * width;        //这个80是在1280*720的屏幕下摆的    //4个children的宽加起来880
        viplayout.spacingX = (width - 880 - (20 / 990 * width) * 2) / 3;
        viplayout.updateLayout();
    },
    registerEvent() {

    },
    unRegisterEvent() {

    },
    OnDestroy() {
        this.unRegisterEvent();
    },

    initUI() {
        this.initLevelInfoUI();
        this.initDownUI();
    },

    initLevelInfoUI() {
        let data = this.userinfo;
        let level, ismaxLevel = false, nextlevel;
        for (let i = 0; i < this.vipList.length; i++) {
            if (this.vipList[i].id == data.vip_id) {
                level = this.vipList[i].vip_name;
                ismaxLevel = i == this.vipList.length - 1;
                nextlevel = i == this.vipList.length - 1 ? "" : this.vipList[i + 1].vip_name;
                break;
            }
        }
        this.lab_viplevel1.string = level
        this.lab_viplevel2.string = `VIP${level}`
        this.lab_viplevel3.string = `VIP${level}`
        this.lab_vipNextlevel.string = `VIP${nextlevel}`
        let exp
        if (Number(this.upgradeType) == 1) {
            exp = (data.recharge - data.recharge_sum) >= 0 ? (data.recharge - data.recharge_sum) : 0;
            this.progress.fillRange = data.recharge_sum / data.recharge == 0 ? 0.001 : data.recharge_sum / data.recharge;
            this.lab_vipLevelTip.string = `升级为VIP${nextlevel}还需充值${this.cutFloat(exp)}`;
        } else {
            exp = (data.betting - data.betting_sum) >= 0 ? (data.betting - data.betting_sum) : 0;
            this.progress.fillRange = data.betting_sum / data.betting == 0 ? 0.001 : data.betting_sum / data.betting
            this.lab_vipLevelTip.string = `升级为VIP${nextlevel}还需投注${this.cutFloat(exp)}`;
        }

        this.lab_vipLevelTip.node.active = !ismaxLevel;
        this.node_nextLevel.active = !ismaxLevel;
        this.lab_vipNextlevel.node.active = !ismaxLevel;
        if (ismaxLevel) this.progress.fillRange = 1;
    },

    initDownUI() {
        let redDot = glGame.user.get("redDotData").vipIdReq;
        this.node_lastRedDot.active = false;
        this.node_nextRedDot.active = false;
        for (let i = 0; i < redDot.length; i++) {
            if (this.node_lastRedDot.active && this.node_nextRedDot.active) break;
            if (this.vipList[this.showInfoLevel - 1] && redDot[i] == this.vipList[this.showInfoLevel - 1].id) {
                this.node_lastRedDot.active = true;
            } else if (this.vipList[this.showInfoLevel + 1] && redDot[i] == this.vipList[this.showInfoLevel + 1].id) {
                this.node_nextRedDot.active = true;
            }
        }
        let STATE = { 1: "已领取", 2: "可领取", 3: "暂不可领取" }
        let maxLevel = this.vipList.length - 1;
        this.lab_privilege.string = `尊敬的VIP${this.vipList[this.showInfoLevel].vip_name}会员，享受以下专属权益`
        this.lab_lastLevel.node.parent.active = this.showInfoLevel != 0;
        this.lab_lastLevel.string = this.showInfoLevel != 0 ? this.vipList[this.showInfoLevel - 1].vip_name : "";
        this.lab_nextLevel.node.parent.active = this.showInfoLevel < maxLevel;
        this.lab_nextLevel.string = this.showInfoLevel < maxLevel ? this.vipList[this.showInfoLevel + 1].vip_name : "";
        for (let i = 0; i < this.vipList.length; i++) {
            if (this.showInfoLevel == i) {
                this.lab_caijin.string = this.cutFloat(this.vipList[i].bonus_upgrade);//升级彩金
                this.lab_week.string = this.cutFloat(this.vipList[i].bonus_week);//周奖励
                this.lab_month.string = this.cutFloat(this.vipList[i].bonus_month);//月奖励
                this.lab_caijinUnit.string = glGame.user.get('register_gold_type') == 1 ? "元" : "金币";
                this.lab_weekUnit.string = glGame.user.get('register_gold_type') == 1 ? "元" : "金币";
                this.lab_monthUnit.string = glGame.user.get('register_gold_type') == 1 ? "元" : "金币";
                this.lab_deatil.string = `${this.cutFloat(Number(this.vipList[i].return_ratio))}`;//反水比例
                this.btn_caijin.getComponent(cc.Sprite).spriteFrame = this.vipList[i].unclaimed == 2 ? this.btn_sprite[0] : this.btn_sprite[1];
                this.btn_caijin.getComponent(cc.Button).interactable = this.vipList[i].unclaimed == 2
                this.btnlab_caijin.string = STATE[this.vipList[i].unclaimed];

                if (Number(this.vipList[i].id) != this.userinfo.vip_month_id) {
                    this.btn_month.getComponent(cc.Sprite).spriteFrame = this.btn_sprite[1];
                    this.btn_month.getComponent(cc.Button).interactable = false
                    this.btnlab_month.string = STATE[3]
                } else {
                    this.btn_month.getComponent(cc.Sprite).spriteFrame = this.userinfo.month_is_receive == 2 ? this.btn_sprite[0] : this.btn_sprite[1];
                    this.btnlab_month.string = STATE[this.userinfo.month_is_receive]
                    this.btn_month.getComponent(cc.Button).interactable = this.userinfo.month_is_receive == 2;
                }

                if (Number(this.vipList[i].id) != this.userinfo.vip_week_id) {
                    this.btn_week.getComponent(cc.Sprite).spriteFrame = this.btn_sprite[1];
                    this.btn_week.getComponent(cc.Button).interactable = false;
                    this.btnlab_week.string = STATE[3]
                } else {
                    this.btn_week.getComponent(cc.Sprite).spriteFrame = this.userinfo.week_is_receive == 2 ? this.btn_sprite[0] : this.btn_sprite[1];
                    this.btnlab_week.string = STATE[this.userinfo.week_is_receive]
                    this.btn_week.getComponent(cc.Button).interactable = this.userinfo.week_is_receive == 2;
                }
            }
        }

        //检查是否开启返水按钮
        this.btn_deatil.getComponent(cc.Button).interactable = glGame.user.get("rebateSwitch") > 0 ? true : false;
        this.btn_deatil.getComponent(cc.Sprite).spriteFrame = glGame.user.get("rebateSwitch") > 0 ? this.btn_sprite[0] : this.btn_sprite[1];
    },

    onClick(name, node) {
        switch (name) {
            case "btn_caijin": this.caijin_cb(); break;
            case "btn_week": this.week_cb(); break;
            case "btn_month": this.month_cb(); break;
            case "btn_detail": this.detail_cb(); break;
            case "btn_lastLevel": this.lastLevel_cb(); break;
            case "btn_nextLevel": this.nextLevel_cb(); break;
            default:
                break
        }
    },
    caijin_cb() {
        this.ReqVipReward(1);
    },
    week_cb() {
        this.ReqVipReward(2);
    },
    month_cb() {
        this.ReqVipReward(3);
    },
    detail_cb() {
        glGame.panel.showPanelByName('backWater');
    },

    lastLevel_cb() {
        this.showInfoLevel--;           //showInfoLevel 指的是viplist数据的索引
        this.initDownUI();
    },
    nextLevel_cb() {
        this.showInfoLevel++;
        this.initDownUI();
    },

    ReqVipInfo() {
        glGame.gameNet.send_msg('http.ReqVipInfo', null, (route, data) => {
            cc.log("会员特权数据", data)
            let result = data.result;
            this.vipList = result.vipList;
            this.userinfo = result.userInfo;
            this.upgradeType = result.upgradeType;
            for (let i = 0; i < this.vipList.length; i++) {
                if (this.vipList[i].id == this.userinfo.vip_id) {
                    if (this.showInfoLevel == null) this.showInfoLevel = i;
                    this.showData = this.vipList[i];
                    break;
                }
            }
            this.initUI();
        })
    },
    //领取 1彩金，2周礼金，3月礼金
    ReqVipReward(type) {
        let msg = { "type": type, "vip_id": this.vipList[this.showInfoLevel].id }
        glGame.gameNet.send_msg('http.ReqVipReward', msg, (route, data) => {
            cc.log("领取结果", data)
            if (data.result) {
                glGame.user.ReqRedDot();
                glGame.user.reqMyInfo();
                this.ReqVipInfo();
                glGame.emitter.emit("showTipPanel", data.coin);
                glGame.audio.playSoundEffect(this.audio_coin);
            }
        })
    },
    //截取小数点后2位
    cutFloat(value) {
        if (typeof value !== 'string' && typeof value !== 'number') return;
        return (Math.floor(parseFloat(value)) / 100).toFixed(2);
    },
});

let screenshot = require('ScreenShot');
glGame.baseclass.extend({
    properties: {
        audio: {
            type: cc.AudioClip,
            default: null
        },

        node_mid: cc.Node,
        node_myshareContent: cc.Node,            //我的分享content
        fitLayer: cc.Node,
        itemBg: [cc.SpriteFrame],
        node_BigQR: cc.Node,
        node_QRcode: cc.Node,
        bigQRcodeNode: cc.Node,
        node_left: cc.Node,
        item_bg: cc.SpriteFrame,

        share_left: cc.Node,
        share_right: cc.Node,
        share_bg: cc.Node,

        share_head: cc.Node,            //share_1
        share_nickname: cc.Label,
        share_id: cc.Label,
        share_level: cc.Label,
        share_teamCount: cc.Label,     //share_2
        share_toadyAddTeamCount: cc.Label,
        share_subordinateCount: cc.Label,
        share_todayAddsubordinateCount: cc.Label,
        share_todayTeamResult: cc.Label,             //share_3
        share_todayMyselfResule: cc.Label,
        share_todaySubResult: cc.Label,
        share_historyAll: cc.Label,              //share_4
        share_yestodayCoin: cc.Label,
        share_todayCoin: cc.Label,
        share_auto: cc.Node,                 //share_5
        share_autoLabel: cc.Label,
        share_unauto: cc.Node,
        share_unautoCoin: cc.Label,
        share_unautoButton: cc.Button,
        share_weblink: cc.Label,
        share_up: cc.Node,

        mycommision_head: cc.Node,
        mycommision_nickNamde: cc.Label,
        mycommision_canReceive: cc.Label,
        mycommision_item: cc.Node,
        mycommision_content: cc.Node,
        mycommision_noData: cc.Node,
        mycommision_drawBtn: cc.Button,
        mycommisionScrollView: cc.ScrollView,

        commisionRecord_out: cc.Label,
        commisionRecord_item: cc.Node,
        commisionRecord_content: cc.Node,
        commisionRecord_noData: cc.Node,
        commisionScrollView: cc.ScrollView,
        commisionTitleNode: cc.Node,

        teammember_count: cc.Label,
        teammember_searchBox: cc.EditBox,
        teammember_item: cc.Node,
        teammember_content: cc.Node,
        teammember_noData: cc.Node,
        teammember_title: cc.Node,
        teammateScrollView: cc.ScrollView,

        ruledetail_item: cc.Node,
        ruledetail_itemParent: cc.Node,
        node_ruleDetail: cc.Node,
        prefab_commisionDetail: cc.Prefab,

        node_mask: cc.Node,
    },
    onLoad() {
        glGame.audio.closeCurEffect();
        glGame.audio.playSoundEffect(this.audio, true);
        this.fitFunc();
        this.fitIphoneX();
        this.ruleIsSuit = false;
        this.isRemoveItem = true;                       //是否移除领取记录的item
        this.recordStarTime = "";
        this.recordEndTime = "";

        this.recordlist = {};
        this.drawRecordPageIndex = 1;
        this.teammatePageIndex = 1;
        this.mycommisionPageIndex = 1;
        //初始化第一个界面
        this.registerEvent();
        this.registerScrollEvent();
    },
    //适配
    fitFunc() {
        let designRate = 720 / 1280;
        let winSize = cc.view.getVisibleSize();
        let curRate = winSize.height / winSize.width;
        if (curRate >= designRate) {
            this.fitLayer.setScale(winSize.width / 1280);
        }

        this.share_bg.getComponent(cc.Widget).updateAlignment();
        this.share_left.getComponent(cc.Widget).left = (this.share_bg.width - 700) >= 0 ? (this.share_bg.width - 700) / 4 : 5;
        this.share_left.getComponent(cc.Widget).updateAlignment();
        this.share_right.getComponent(cc.Widget).right = (this.share_bg.width - 700) >= 0 ? (this.share_bg.width - 700) / 4 : 5;
        this.share_right.getComponent(cc.Widget).updateAlignment();
    },
    fitIphoneX() {
        if (isiPhoneX) {
            let midWidgetCom = this.node_mid.getComponent(cc.Widget),
                leftWidgetCom = this.node_left.getComponent(cc.Widget);
            midWidgetCom.left += 35;
            leftWidgetCom.left += 35;
            midWidgetCom.updateAlignment();
            leftWidgetCom.updateAlignment();
        }
    },

    start() {
        this.subPanelFit();
    },

    subPanelFit() {
        this.share_up.getComponent(cc.Widget).updateAlignment();
        if (this.share_up.width > 726) {
            this.share_up.children[0].width += (this.share_up.width - 726) / 1.5;
        }
    },
    //注册滑动到底部的监听事件，node.on监听，节点销毁就注销了
    registerScrollEvent() {
        this.commisionScrollView.node.on("scroll-to-bottom", this.scrollToBottom, this);
        this.teammateScrollView.node.on("scroll-to-bottom", this.teammateScrollToBottom, this);
        this.mycommisionScrollView.node.on("scroll-to-bottom", this.mycommisionScrollToBottom, this);
    },

    unRegisterScrollEvent() {
    },

    registerEvent() {
        glGame.emitter.on("updateUserData", this.resetupdateUserData, this);
        glGame.emitter.on("popularizeActionEnd", this.openEffectCallback, this);
    },

    unRegisterEvent() {
        glGame.emitter.off("updateUserData", this);
        glGame.emitter.off("popularizeActionEnd", this);

    },
    OnDestroy() {
        this.unRegisterEvent();
        this.unRegisterScrollEvent();
    },
    resetupdateUserData() {
        this.reqInit();//刷新列表
    },

    openEffectCallback() {
        this.reqInit();
    },

    //请求基础数据
    reqInit() {
        /*
        ** 请求推广等级相关数据
        ** msg  type:Array
        ** level 等级 type:string
        ** exp 业绩标准 type:number
        ** reward 奖励 type:number
        */
        glGame.gameNet.send_msg('http.ReqPlayerExtensionCountlessLevel', {}, (route, msg) => {
            this.levelData = msg;
            /* msg
            ** can_receive_extension: 0
            ** extension_limit: "0"
            ** history_commission: 112000
            ** promo_url: "http://www.baidu.com"
            ** sub_number: 4
            */
            glGame.gameNet.send_msg('http.reqPlayerExtensionCountless', {}, (route, msg) => {
                this.countlessData = msg;
                this.canReceiveExtension = msg.can_receive_extension;
                this.extensionLimit = msg.extension_limit;
                this.url = msg.promo_url;
                this.qr_code_url = msg.qr_code_url;
                this.teammateCount = msg.sub_number;
                this.initShare();
                this.setQRCode();
                this.setMidActive(0);
                this.setbigQRcode();
                this.node_mask.active = false;
            });
        });

    },
    /*
    ** reqMyCommision 请求奖励结算记录
    ** startTime 开始时间
    ** endTime 结束时间
    ** page 页码
    ** 每页显示条目数量
    */
    reqMyCommision(startTime, endTime, page, page_size) {
        let reqParams = {
        }
        reqParams.start = startTime ? startTime : "";
        reqParams.end = endTime ? endTime : "";
        reqParams.page = this.mycommisionPageIndex;
        reqParams.page_size = 10;
        glGame.gameNet.send_msg('http.ReqPlayerExtensionCountlessRecord', {}, (route, msg) => {
            this.drawRecordData = msg;
            if (msg.length == 0 && this.mycommisionPageIndex != 1) {
                this.mycommisionPageIndex--;
                return;
            }
            this.initMycommision();
        });
    },
    /*
    **  滑动到底部的事件回调
    */
    mycommisionScrollToBottom(event) {
        console.log("mycommisionScrollToBottom")
        this.mycommisionPageIndex++;
        this.reqMyCommision(this.mycommisionPageIndex);
    },

    /*
    ** reqTeammate 请求团队成员
    ** logicid：玩家logicid 624303
    ** page：页数
    ** page_size：每页几条
    **
    ** 回包
    ** logicid：玩家logicid
    ** nickname：玩家昵称
    ** last_login_time：最后登录时间
    ** create_time：注册时间
    */
    reqTeammate() {
        let reqParams = {};
        reqParams.page = this.teammatePageIndex;
        reqParams.page_size = 10;
        reqParams.logicid = this.teammember_searchBox.string ? this.teammember_searchBox.string : "";


        glGame.gameNet.send_msg('http.ReqPlayerExtensionCountlessMember', reqParams, (route, msg) => {
            this.teammateData = msg;
            if (msg.length == 0 && this.teammatePageIndex != 1) {
                this.teammatePageIndex--;
                return;
            }
            this.initTeammember();
        });
    },

    //teammateScrollToBottom scrollview滑动到底部的时间回调
    teammateScrollToBottom(event) {
        console.log("teammateScrollToBottom")
        this.teammatePageIndex++;
        this.reqTeammate()
    },

    /*
    ** reqDrawRecord 请求领取记录
    ** start：开始时间，如2019-02-20
    ** end：结束时间，如2019-02-20
    ** page: 请求的页码
    ** page_size：每页几条
    **
    ** 回包
    ** extension_id：代理ID
    ** parent_extension_id：上级代理id
    ** uid：玩家ID
    ** date：日期
    ** sub_number：贡献人数
    ** daily_commission：日结佣金
    ** contribute_commission：佣金贡献
    ** bet：有效投注
    ** achievement：总业绩
    ** direct_achievement：直推业绩
    ** sub_achievement：下级代理业绩
    */
    reqDrawRecord(page, page_size) {
        let reqParams = {}
        reqParams.start = this.recordStarTime;
        reqParams.end = this.recordEndTime;
        reqParams.page = this.drawRecordPageIndex;
        reqParams.page_size = 10;

        glGame.gameNet.send_msg('http.ReqPlayerExtensionCountlessFlow', reqParams, (route, msg) => {
            this.extensionData = msg;
            if (msg.list.length == 0 && this.drawRecordPageIndex != 1) {
                this.drawRecordPageIndex--;
                return;
            }
            this.initCommisionRecord();
        });
    },
    //scrollToBottom 领取记录界面scrollview滑动到底部的事件回调
    scrollToBottom(event) {
        console.log("scrollToBottom")
        this.isRemoveItem = false;
        this.drawRecordPageIndex++;
        this.reqDrawRecord()
    },

    // resetAllPageIndex 重新设置页码数据
    resetAllPageIndex() {
        this.mycommisionPageIndex = 1;
        this.teammatePageIndex = 1;
        this.drawRecordPageIndex = 1;
    },
    onClick(name, node) {
        if (glGame.user.isTourist()) {
            if (name != 'myShare' && name != 'myCommision' && name != 'teammate'
                && name != 'rule' && name != 'close' && name != 'btn_saveQRcode' && name != 'btn_copywebLink') {
                glGame.panel.showRegisteredGift(true);
                return;
            }
        }
        switch (name) {
            case 'myShare':
                this.resetAllPageIndex();
                this.initShare()
                this.setMidActive(0);
                break;
            case 'myCommision':
                this.resetAllPageIndex();
                this.setMidActive(1);
                this.reqMyCommision();
                break;
            case 'record':
                this.setMidActive(3)
                this.reqDrawRecord();
                break;
            case 'teammate':
                this.resetAllPageIndex();
                this.setMidActive(2)
                this.reqTeammate();
                break;
            case 'rule':
                this.setMidActive(4);
                break;
            case 'close':
                glGame.panel.revertOpenNodeEffect(this.node, 2).then(() => { this.remove() });
                glGame.emitter.emit("plazaOpen")
                break;
            case 'btn_save': this.saveBigQRcodeSprite(); break;
            case 'btn_copywebLink': this.copyWebLink_cb(); break;
            case 'btn_shareReveive':
            case 'btn_myComreceive':
                this.reveiveCommision(node); break;
            case 'btn_saveQRcode': this.saveQRcode_cb(); break;
            case 'searchBtn': this.searchTeammateByID(); break;
            case 'btn_closeRuleDetail':
                this.node_ruleDetail.active = false;
                break;
            case 'btn_getProportion':
                this.initCommisionDetail();
                break;
            case 'btn_weixinhaoyou':
                if (cc.sys.isNative && glGame.isLoginSelect) {
                    let data = this.countlessData.share_config;
                    if (data.WX_SHARE_TYPE == 1) {
                        glGame.platform.shareTotWX(data.WX_SHARE_TITLE, data.WX_SHARE_INFO, data.WX_SHARE_JUMP_URL, 1, data.WX_SHARE_IMG_URL);
                    } else {
                        glGame.platform.shareImage(data.WX_SHARE_IMG_URL, 0);
                    }
                } else {
                    glGame.servercfg.turnOtherApp(2);
                }
                break;
            case 'btn_fenxianghaoyou':
                glGame.servercfg.turnOtherApp(1);
                break;
            case 'btn_fenxiangpengyouquan':
                if (cc.sys.isNative && glGame.isLoginSelect) {
                    let data = this.countlessData.share_config;
                    if (data.WX_SHARE_TYPE == 1) {
                        glGame.platform.shareTotWX(data.WX_SHARE_TITLE, data.WX_SHARE_INFO, data.WX_SHARE_JUMP_URL, 2, data.WX_SHARE_IMG_URL);
                    } else {
                        glGame.platform.shareImage(data.WX_SHARE_IMG_URL, 1);
                    }
                } else {
                    glGame.servercfg.turnOtherApp(2);
                }
                break;
            default:
                if (name.indexOf("commisionitem") > -1) {
                    let commisionDetail = cc.instantiate(this.prefab_commisionDetail);
                    let index = name.split("_")[1]
                    commisionDetail.getComponent("commisionDetail").initData(this.drawRecordData[index].date);
                    commisionDetail.parent = this.node;
                }
                break;
        }
    },

    //searchMyCommisionByTime() 按照选中的时间段进行时间换算
    searchMyCommisionByTime(timeStr) {
        this.selectTimeScrollView.active = false;
        this.outTimeNode.active = false;
        let valueDirt = {
            '全部': { value: 0, type: "all" },
            '三天': { value: 3 * 24 * 60 * 60 * 1000, type: "day" },
            '五天': { value: 5 * 24 * 60 * 60 * 1000, type: "day" },
            '一周': { value: 7 * 24 * 60 * 60 * 1000, type: "day" },
            '十天': { value: 10 * 24 * 60 * 60 * 1000, type: "day" },
            '一个月': { value: 30 * 24 * 60 * 60 * 1000, type: "day" },
            '三个月': { value: 90 * 24 * 60 * 60 * 1000, type: "day" }
        }
        let startTime = new Date();
        let endTime = new Date();
        console.log("time time", startTime, valueDirt[timeStr], timeStr)
        if (valueDirt[timeStr].type == "day") {
            startTime = new Date(startTime.getTime() - valueDirt[timeStr].value);
            this.recordStarTime = this.getTimeStr(startTime);
            this.recordEndTime = this.getTimeStr(endTime);
            this.reqDrawRecord();
        } else {
            this.drawRecordPageIndex = 1;
            this.reqDrawRecord();
        }
    },

    getTimeStr(date) {
        let y = date.getFullYear();
        let m = "0" + (date.getMonth() + 1);
        let d = "0" + (date.getDate());
        return y + "-" + m.substring(m.length - 2, m.length) + "-" + d.substring(d.length - 2, d.length);
    },
    //selectMyCommisionTime() 刷新时间筛选界面的时间可选项
    selectMyCommisionTime() {
        this.selectTimeScrollView.active = true;
        this.outTimeNode.active = true;
        this.selectTimeContent.removeAllChildren();
        let data = ["全部", "三天", "五天", "一周", "十天", "一个月", "三个月"]
        for (let i = 0; i < data.length; i++) {
            let selectItem = cc.instantiate(this.selectTimeItem);
            selectItem.parent = this.selectTimeContent;
            selectItem.getChildByName("label").getComponent(cc.Label).string = data[i];
            selectItem.active = true;
        }
    },
    //searchTeammateByID() 输入id是否正确的判断
    searchTeammateByID() {
        let logicid = this.teammember_searchBox.string
        console.log("ID", logicid)
        if (logicid.match(/^[0-9]{6}$/) || logicid.length == 0) {
            this.reqTeammate();
        } else {
            glGame.panel.showTip("ID输入错误，请重新输入")
        }
    },

    saveBigQRcodeSprite() {
        if (cc.sys.isNative) {
            glGame.platform.saveToLocal(this.qr_code_url);
        } else {
            this.setBigQRcodeActive();
            screenshot.captureScreenshot('shareCode', this.node_BigQR);
        }
    },
    //显示mid下的界面
    setMidActive(index) {
        for (let i = 0; i < this.node_mid.childrenCount; i++) {
            this.node_mid.children[i].active = i == index;
        }
    },
    //getLevelStr() return:string 根据玩家的贡献获取等级
    getLevelStr() {
        for (let i = 0; i < this.levelData.length; i++) {
            if (i + 1 < this.levelData.length) {
                if (this.canReceiveExtension <= this.levelData[i + 1].exp) {
                    return this.levelData[i].level;
                }
            } else {
                return this.levelData[this.levelData.length - 1].level;
            }
        }
    },

    //=========================我的分享
    initShare() {
        let data = this.countlessData;
        if (!glGame.user.isTourist()) {
            glGame.panel.showHeadImage(this.share_head, glGame.user.get("headURL"));
        }

        this.share_id.string = glGame.user.get("logicID");
        this.share_nickname.string = glGame.user.get("nickname");
        this.share_level.string = data.yesterday_level;
        this.share_teamCount.string = data.direct_number;
        this.share_toadyAddTeamCount.string = data.new_direct_number;
        this.share_subordinateCount.string = data.sub_number;
        this.share_todayAddsubordinateCount.string = data.new_sub_number;
        this.share_todayTeamResult.string = this.cutFloat(data.sub_achievement)
        this.share_todayMyselfResule.string = this.cutFloat(data.self_achievement)
        this.share_todaySubResult.string = this.cutFloat(data.sub_member_achievement)
        this.share_historyAll.string = this.cutFloat(data.history_commission)
        this.share_yestodayCoin.string = this.cutFloat(data.yesterday_commission)
        this.share_todayCoin.string = this.cutFloat(data.daily_commission)
        this.share_weblink.string = data.promo_url

        if (Number(data.release_mode) == 3) {   //自动发放
            this.share_auto.active = true;
            this.share_unauto.active = false;
            this.share_autoLabel.string = `佣金将在每天 ${data.settlement_time} 自动发放到邮箱中`
        } else {
            this.share_auto.active = false;
            this.share_unauto.active = true;
            this.share_unautoCoin.string = this.cutFloat(data.can_receive_extension);
            this.share_unautoButton.interactable = data.can_receive_extension > 0;
        }
    },
    //======================我的佣金
    initMycommision() {
        if (!glGame.user.isTourist()) {
            glGame.panel.showHeadImage(this.mycommision_head, glGame.user.get("headURL"));
        }

        this.mycommision_nickNamde.string = glGame.user.get("nickname");
        this.mycommision_canReceive.string = this.cutFloat(this.canReceiveExtension);
        this.mycommision_drawBtn.interactable = Number(this.extensionLimit) <= this.canReceiveExtension && this.canReceiveExtension != 0;

        if (this.mycommisionPageIndex == 1) {
            this.mycommision_content.removeAllChildren();
        }

        for (let i = 0; i < this.drawRecordData.length; i++) {
            let item = cc.instantiate(this.mycommision_item);
            item.parent = this.mycommision_content;
            item.name = `commisionitem_${i}`
            item.getChildByName("timeLab").getComponent(cc.Label).string = this.drawRecordData[i].date;
            item.getChildByName("commisionLab").getComponent(cc.Label).string = this.cutFloat(this.drawRecordData[i].daily_commission);
            item.getChildByName("countLab").getComponent(cc.Label).string = this.drawRecordData[i].sub_number;
            item.getChildByName("stateLab").getComponent(cc.Label).string = this.drawRecordData[i].state;
            item.getComponent(cc.Sprite).spriteFrame = (i + 1) % 2 == 0 ? this.itemBg[1] : this.itemBg[0];
            item.active = true;
        }
        this.mycommision_noData.active = this.drawRecordData.length == 0;
    },
    //======================佣金记录
    initCommisionRecord() {
        let settleRecord = this.extensionData.list;
        let number = this.extensionData.number;
        if (this.isRemoveItem) this.commisionRecord_content.removeAllChildren();

        this.commisionTitleNode.getComponent(cc.Widget).updateAlignment();
        let nodeWidth = this.commisionTitleNode.width;
        this.commisionTitleNode.children[0].x = -nodeWidth / 3;
        this.commisionTitleNode.children[1].x = 0;
        this.commisionTitleNode.children[2].x = nodeWidth / 3;

        for (let i = 0; i < settleRecord.length; i++) {
            let item = cc.instantiate(this.commisionRecord_item);
            item.parent = this.commisionRecord_content;
            item.getChildByName("time").getComponent(cc.Label).string = settleRecord[i].create_time;
            item.getChildByName("out").getComponent(cc.Label).string = this.cutFloat(settleRecord[i].number);
            item.getChildByName("state").getComponent(cc.Label).string = settleRecord[i].state;
            this.setStateColor(settleRecord[i].state, item.getChildByName("state"));
            item.getComponent(cc.Sprite).spriteFrame = i % 2 == 0 ? this.itemBg[1] : this.itemBg[0];
            item.active = true;

            item.getComponent(cc.Widget).updateAlignment();
            item.getChildByName("time").x = -item.width / 3
            item.getChildByName("out").x = 0;
            item.getChildByName("state").x = item.width / 3;
        }
        this.commisionRecord_out.string = this.cutFloat(number);
        this.commisionRecord_noData.active = this.commisionRecord_content.childrenCount == 0;
    },
    setStateColor(type, node) {
        switch (type) {
            case "申请中":
                node.color = new cc.Color(255, 144, 0);
                break;
            case "已发放":
                node.color = new cc.Color(0, 255, 0);
                break;
            case "已拒绝":
                node.color = new cc.Color(255, 0, 0);
                break;
        }
    },
    //======================团队成员
    initTeammember() {
        if (this.teammatePageIndex == 1) {
            this.teammember_content.removeAllChildren();
        }

        this.teammember_count.string = this.teammateCount;
        this.teammember_title.getComponent(cc.Widget).updateAlignment();
        let nodeWidth = this.teammember_title.width;
        this.teammember_title.children[0].x = -nodeWidth / 3;
        this.teammember_title.children[1].x = 0;
        this.teammember_title.children[2].x = nodeWidth / 3;
        for (let i = 0; i < this.teammateData.length; i++) {
            let item = cc.instantiate(this.teammember_item);
            item.parent = this.teammember_content;
            item.getChildByName("timeLab").getComponent(cc.Label).string = this.teammateData[i].last_login_time;
            item.getChildByName("registerLab").getComponent(cc.Label).string = this.teammateData[i].create_time;
            item.getChildByName("idLab").getComponent(cc.Label).string = this.teammateData[i].logicid;
            item.getComponent(cc.Sprite).spriteFrame = i % 2 == 0 ? this.itemBg[1] : this.itemBg[0];
            item.active = true;
            item.getComponent(cc.Widget).updateAlignment();
            console.log("item width", item.width)
            item.getChildByName("timeLab").x = -item.width / 3
            item.getChildByName("registerLab").x = 0;
            item.getChildByName("idLab").x = item.width / 3;
        }
        this.teammember_noData.active = this.teammateData.length == 0
    },
    //返佣详情
    initCommisionDetail() {
        this.node_ruleDetail.active = true;
        this.ruledetail_itemParent.removeAllChildren();
        for (let i = 0; i < this.levelData.length; i++) {
            let item = cc.instantiate(this.ruledetail_item);
            item.parent = this.ruledetail_itemParent;
            item.getChildByName("level").getComponent(cc.Label).string = this.levelData[i].level;
            if (i < 3) {
                item.getChildByName("level").color = new cc.Color().fromHEX('#87d708');
            } else if (i < 6) {
                item.getChildByName("level").color = new cc.Color().fromHEX('#ffcc00');
            } else if (i < 9) {
                item.getChildByName("level").color = new cc.Color().fromHEX('#ff9c00');
            } else {
                item.getChildByName("level").color = new cc.Color().fromHEX('#ff5400');
            }
            item.getChildByName("day").getComponent(cc.Label).string = i + 1 == this.levelData.length ? `${this.GoldTemp(this.levelData[i].exp)}以上` : `${this.GoldTemp(this.levelData[i].exp)}-${this.GoldTemp(this.levelData[i + 1].exp)}`;
            item.getChildByName("return").getComponent(cc.Label).string = "每万返佣" + this.GoldTemp(this.levelData[i].reward) + "元";
            item.getComponent(cc.Sprite).spriteFrame = i % 2 == 0 ? this.itemBg[1] : this.itemBg[0];
            item.active = true;
        }
    },
    GoldTemp(gold) {
        let strGold = "";
        if (typeof gold == 'number') {
            gold = gold.div(100);
            if (gold >= 10000 && gold < 100000000) {
                strGold = gold.div(10000) + "万";
            } else if (gold >= 100000000) {
                strGold = gold.div(100000000) + "亿";
            } else {
                strGold = gold;
            }
        }
        return strGold;
    },

    //======================二维码
    setBigQRcodeActive() {
        this.node_BigQR.active = !this.node_BigQR.active;
    },
    //====================小二维码生成
    setQRCode: function () {
        this.initCode();
    },
    //====================大二维码生成
    setbigQRcode: function () {
        this.initBigCode();
    },

    initCode() {
        var qrcode = new QRCode(-1, QRErrorCorrectLevel.H);
        qrcode.addData(this.url);
        qrcode.make();

        var ctx = this.node_QRcode.getComponent(cc.Graphics);

        var tileW = this.node_QRcode.width / qrcode.getModuleCount();
        var tileH = this.node_QRcode.height / qrcode.getModuleCount();

        // draw in the Graphics
        for (var row = 0; row < qrcode.getModuleCount(); row++) {
            for (var col = 0; col < qrcode.getModuleCount(); col++) {
                if (qrcode.isDark(row, col)) {
                    ctx.fillColor = cc.Color.BLACK;
                } else {
                    ctx.fillColor = cc.Color.WHITE;
                }
                var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
                var h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
                ctx.rect(Math.round(col * tileW), Math.round(row * tileH), w, h);
                ctx.fill();
            }
        }
    },
    initBigCode() {
        var qrcode = new QRCode(-1, QRErrorCorrectLevel.H);
        qrcode.addData(this.url);
        qrcode.make();

        var ctx = this.bigQRcodeNode.getComponent(cc.Graphics);

        var tileW = this.bigQRcodeNode.width / qrcode.getModuleCount();
        var tileH = this.bigQRcodeNode.height / qrcode.getModuleCount();

        // draw in the Graphics
        for (var row = 0; row < qrcode.getModuleCount(); row++) {
            for (var col = 0; col < qrcode.getModuleCount(); col++) {
                if (qrcode.isDark(row, col)) {
                    ctx.fillColor = cc.Color.BLACK;
                } else {
                    ctx.fillColor = cc.Color.WHITE;
                }
                var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
                var h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
                ctx.rect(Math.round(col * tileW), Math.round(row * tileH), w, h);
                ctx.fill();
            }
        }
    },

    //==========cb
    //复制链接
    copyWebLink_cb() {
        glGame.platform.copyToClip(this.share_weblink.string, "专属网址");
    },

    //领取佣金
    reveiveCommision(node) {
        glGame.gameNet.send_msg('http.ReqPlayerExtensionCountlessApply', {}, (route, msg) => {
            this.drawResult = msg;
            if (this.drawResult) {
                glGame.panel.showTip("领取成功");
                node.getComponent(cc.Button).interactable = false;
                if (node.name == "btn_shareReveive") {
                    this.resetAllPageIndex();
                    this.reqInit();
                } else {
                    glGame.gameNet.send_msg('http.reqPlayerExtensionCountless', {}, (route, msg) => {
                        this.canReceiveExtension = msg.can_receive_extension;
                        this.extensionLimit = msg.extension_limit;
                        this.mycommision_canReceive.string = this.cutFloat(this.canReceiveExtension);
                        this.mycommision_drawBtn.interactable = Number(this.extensionLimit) <= this.canReceiveExtension && this.canReceiveExtension != 0;
                    });
                }
            }
        });
    },

    //保存二维码
    saveQRcode_cb() {
        this.saveBigQRcodeSprite();
    },

    //浮点型运算取俩位
    cutFloat(value, num = 2) {
        if (isNaN(value)) return;
        if (~~value === value) {
            return value.div(100).toString();
        } else {
            value = Number(value).div(100);
            return (Math.floor(value * 100) / 100).toFixed(num);
        }
    },
    // update (dt) {},
});

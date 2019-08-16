/**
 * 邮件面板
 */
glGame.baseclass.extend({
    properties: {
        emailListView: cc.Node,     // 邮件item列表

        emailItem: cc.Node,
        emailDetail: cc.Node,       //正常邮件详细内容
        emailAttch: cc.Node,         //附件详细内容
        emailstatus: [cc.SpriteFrame],      //邮件图片状态
        emailAttchStatus: [cc.SpriteFrame], //是否领取/查看
        attachGet: cc.Node,             //领取附件界面
        openDelet: cc.Node,             //删除邮件界面

        otherScorll: cc.ScrollView,      //其他的scorll
        announItem: cc.Node,             //公告消息Item
        announContent: cc.Node,          //公告消息Item父节点
        announScrollView: cc.Node,       //公告scroll
        btn_alldelete: cc.Button,
        btn_allGet: cc.Button,
        content: cc.Node,
        node_noInfo: cc.Node,

        sysRedDot: cc.Node,
        coinRedDot: cc.Node,
        node_titleList: cc.Node,
        node_left: cc.Node,
        audio_coin: {
            type: cc.AudioClip,
            default: null
        },
        tip_lab: cc.Node,
    },
    onLoad() {
       

        this.registerEvent();
        this.isReceive = false;
        this.page = 1;
        this.contenHeight = 0;
        this.emailUpdate = false;
        this.announUpdate = false;
        this.allAttachCoin = 0;
        this.getIsAllGet = false;
        this.getIsAllDelete = false;
        this.index = 0;
        this.allEmail = [];
        this.tipTimeOut = null;
        this.textIndex = 1 //控制是否能提示飘字未查看还可领取，
        
    },
    // 初始化邮件数据
    resetData() {
        // this.emailData = glGame.user.get("emails");
        //console.log('======查看邮件item',this.emailData)
    },
    initFace() {
        if (isiPhoneX) {
            let midWidgetCom = this.node_titleList.getComponent(cc.Widget),
                leftWidgetCom = this.node_left.getComponent(cc.Widget),
                emailItemCom = this.content.getComponent(cc.Widget),
                scroll1 = this.otherScorll.node.getComponent(cc.Widget),
                scroll2 = this.announContent.getComponent(cc.Widget);

            midWidgetCom.left += 35;
            leftWidgetCom.left += 35;
            emailItemCom.left += 15;
            scroll1.left += 35;
            scroll2.left += 35;

            emailItemCom.updateAlignment();
            midWidgetCom.updateAlignment();
            leftWidgetCom.updateAlignment();
            scroll1.updateAlignment();
            scroll2.updateAlignment();
        }

    },
    initReddot() {
        this.sysRedDot.active = glGame.user.get("redDotData").mailReq == 1;
        this.coinRedDot.active = glGame.user.get("redDotData").mailCapitalReq == 1;
    },

    // UI显示
    showUI() {
        let setOne = true;
        for (let i = 0; i < this.emailListView.childrenCount; i++) {
            this.emailListView.children[i].active = true;
            if (setOne) {
                this.btnfirst = this.emailListView.children[i];
                setOne = false;
            }
        }
        this.btnfirst.getComponent(cc.Toggle).isChecked = true;
        this.onClick(this.btnfirst.name, this.btnfirst);
    },
    onClick(name, node) {
        console.log('nnnnname', name)
        for (let i = 0; i < this.content.childrenCount; i++) {
            if (this.content.children[i].name == name) {
                this.CuremailId = name;
                console.log('邮件ID', this.CuremailId)
                glGame.user.reqMailInfo(name)
                return;
            }
        }
        switch (name) {
            case "AnnouncementEmail":
                this.type = 99;
                this.allAttachCoin = 0;
                this.otherScorll.scrollToTop(0.1)
                this.content.destroyAllChildren();
                this.content.removeAllChildren();
                this.btn_alldelete.node.active = false;
                this.btn_allGet.node.active = false;
                this.announScrollView.active = true;
                this.page = 1
                this.otherScorll.node.active = false
                let annEmails = glGame.user.get("announceMent").notices;
                this.node_noInfo.active = this.announContent.childrenCount== 0;
                for (let i = 0; i < this.announContent.childrenCount; i++) {
                    this.announContent.children[i].active = true;
                }

                break;
            case "systemEmail":
                for (let i = 0; i < this.announContent.childrenCount; i++) {
                    this.announContent.children[i].active = false;
                }
                this.reqSystemEmail();

                break;
            case "moneyEmail":
                for (let i = 0; i < this.announContent.childrenCount; i++) {
                    this.announContent.children[i].active = false;
                }
                this.reqMoneyEmail();
                break;
            case "close":
                glGame.panel.revertOpenNodeEffect(this.node, 2).then(() => { this.remove() });
                glGame.emitter.emit("plazaOpen");
                break;
            case "btn_closeDetail": this.CuremailDetail.destroy(); break;           //关闭邮件详情
            case "btn_alldelete": this.openDeleteFace(true); break;
            case "btn_delete": this.openDeleteFace(false); break;
            case "btn_realDelet": this.click_delete(); break;                         //确定删除
            case "btn_oppenGet": this.openGetAttach(false); break;               //打开领取附件界面
            case "btn_allget": this.openGetAttach(true); break;                     //打开领取所有附件界面
            case "btn_getAttach": this.sureGetAttach(); break;  //确定领取附件
            case "btn_closeGet": this.sureGetAttach();/*this.getCoinAttach.destroy();*/ break;                //关闭领取附件
            case 'btn_canel': case 'btn_closeDelet':
                this.getDeleteFace.destroy();
                break;
            default: console.error("no find button name -> %s", name);
        }
    },
    reqAnnouncement() {
        this.allAttachCoin = 0;
        this.otherScorll.scrollToTop(0.1)
        this.content.destroyAllChildren();
        this.content.removeAllChildren();
        this.btn_alldelete.node.active = false;
        this.btn_allGet.node.active = false;
        this.announScrollView.active = true;
        this.page = 1;
        this.annPage = 1;
        this.otherScorll.node.active = false
        glGame.user.ReqNotice(this.page,5);
        this.type = 99;
    },
    reqSystemEmail() {
        this.otherScorll.scrollToTop(0.1)
        this.content.destroyAllChildren();
        this.content.removeAllChildren();
        this.btn_alldelete.node.active = false;
        this.btn_allGet.node.active = false;
        this.announScrollView.active = false;
        this.page = 1
        this.type = 1;
        this.allEmail = [];
        this.allAttachCoin = 0;
        this.textIndex = 1;
        this.otherScorll.node.active = true;
        glGame.user.reqMailList(1, 10, 1);


    },
    reqMoneyEmail() {
        this.otherScorll.scrollToTop(0.1)
        this.content.destroyAllChildren();
        this.content.removeAllChildren();
        this.allEmail = [];
        this.allAttachCoin = 0;
        this.page = 1;
        this.type = 2;
        this.textIndex = 1;
        this.btn_allGet.node.active = false;
        this.btn_alldelete.node.active = false;
        this.announScrollView.active = false;
        this.otherScorll.node.active = true
        glGame.user.reqMailList(1, 10, 2);

    },
    /**
     *
     * @param {*} bool true: 全部领取 false: 指定领取
     */
    openGetAttach(bool) {
        this.getCoinAttach = cc.instantiate(this.attachGet);
        this.getCoinAttach.parent = this.node;
        if (bool) {
            this.getCoinAttach.getChildByName('coinLayout').getChildByName('coin').getComponent(cc.Label).string = this.cutDownNum(Number(this.allAttachCoin));
        } else {
            console.log("这是打开领取界面附件的内容", this.getEmailInfo);
            this.getCoinAttach.getChildByName('coinLayout').getChildByName('coin').getComponent(cc.Label).string = this.cutDownNum(Number(this.getEmailInfo.attachment[0].value));
        }
        this.textIndex = 1;
        this.getIsAllGet = bool;
        this.click_getAttach();
    },
    /**
     *
     * @param {*} bool true: 全部删除 false: 指定删除
     */
    openDeleteFace(bool) {
        this.getDeleteFace = cc.instantiate(this.openDelet);
        this.getDeleteFace.parent = this.node;
        this.getDeleteFace.active = true;
        if (bool) {
            this.getDeleteFace.getChildByName('tip').getComponent(cc.Label).string = '是否删除所有已读邮件？'
        } else {
            this.getDeleteFace.getChildByName('tip').getComponent(cc.Label).string = '是否删除该邮件？'
        }
        this.getIsAllDelete = bool;
    },
    //点击删除邮件
    click_delete() {

        if (this.getIsAllDelete) {
            this.btn_allGet.node.active = false;
            this.btn_alldelete.node.active = false;
            glGame.user.ReqDeleMail(this.type);
        } else {
            this.textIndex = 1;
            glGame.user.ReqDeleOneMail(this.CuremailId)
        }

        this.getDeleteFace.destroy();
    },
    //点击获取附件
    click_getAttach() {
        if (this.getIsAllGet) {
            glGame.user.ReqMailAllGet();
            this.btn_allGet.node.active = false;
        } else {
            console.log('当前邮件ID', this.CuremailId)
            glGame.user.ReqMailGet(this.CuremailId);
        }

    },
    // 注册界面监听事件
    registerEvent() {
        glGame.emitter.on("updateEmailContent", this.updateEmailContent, this);
        glGame.emitter.on("updateEmail", this.updateEmail, this);
        glGame.emitter.on("updateDeleOneMail", this.updateDeleOneMail, this);
        glGame.emitter.on("updateDeleMail", this.updateDeleMail, this);
        glGame.emitter.on("updateGetAttach", this.updateGetAttach, this);
        glGame.emitter.on("updateGetAllAttach", this.updateGetAllAttach, this);
        glGame.emitter.on("ReqRedDot", this.initReddot, this);
        glGame.emitter.on("updateAnnounceMent", this.updateAnnouncemetEmail, this);
        glGame.emitter.on("emailActionEnd", this.emailActionEnd, this);
    },
    // 销毁界面监听事件
    unRegisterEvent() {
        glGame.emitter.off("updateEmailContent", this);
        glGame.emitter.off("updateEmail", this);
        glGame.emitter.off("updateDeleOneMail", this);
        glGame.emitter.off("updateDeleMail", this);
        glGame.emitter.off("updateGetAttach", this);
        glGame.emitter.off("updateGetAllAttach", this);
        glGame.emitter.off("ReqRedDot", this);
        glGame.emitter.off("updateAnnounceMent", this);
        glGame.emitter.off("emailActionEnd", this);
    },
    emailActionEnd() {
        console.log("这是当前移动完成之后的消息")
        this.reqAnnouncement();
        glGame.user.ReqRedDot();
    },
    // 界面销毁的时候, 注销事件, 刷新一下看看有没最新邮件
    OnDestroy() {
        this.unRegisterEvent();
        glGame.user.reqUnread();
    },
    //邮件列表
    updateEmail() {
        let haveCoin;
        this.emails = glGame.user.get("emails");
        this.msg = glGame.user.get("allEmailMsg");
        if (this.content.childrenCount == 0) {
            this.node_noInfo.active = true;
            this.btn_alldelete.node.active = false;
        }
        this.emailUpdate = false;
        if (this.msg.coin) {
            this.allAttachCoin = this.msg.coin
        }
        if (this.emails.length == 0) { return; }
        console.log('邮箱信息', this.emails)
        //系统信息与资金信息
        for (let i = 0; i < this.emails.length; i++) {
            let emailItem = cc.instantiate(this.emailItem);
            emailItem.parent = this.content;
            emailItem.active = true;
            emailItem.getChildByName("email_time").getComponent(cc.Label).string = this.emails[i].send_time;
            emailItem.getChildByName("email_title").getComponent(cc.Label).string = this.emails[i].mail_title;
            emailItem.getChildByName("sys_tip").getComponent(cc.Label).string = this.type == 2 ? '【资金消息】' : '【系统消息】'
            //是否有附件
            if (this.emails[i].attachment.length != 0) {

                emailItem.getChildByName("img_jinbi").active = true
                emailItem.getChildByName("img_jinbi").getChildByName('value').getComponent(cc.Label).string = glGame.user.GoldTemp(Number(this.emails[i].attachment[0].value));
                emailItem.getChildByName("email_pic").getComponent(cc.Sprite).spriteFrame = this.emails[i].status == 1 ? this.emailstatus[1] : this.emailstatus[0];
                emailItem.getChildByName("email_pic").getChildByName("dian").active = this.emails[i].status != 1;
                emailItem.getChildByName("detailTip").active = false
                emailItem.getChildByName("already").getComponent(cc.Sprite).spriteFrame = this.emailAttchStatus[0];
                emailItem.getChildByName("already").active = this.emails[i].attachment_status == 1;
                if (this.emails[i].attachment_status == 1) {
                    emailItem.getChildByName("email_pic").getComponent(cc.Sprite).spriteFrame = this.emailstatus[1];
                    emailItem.getChildByName("email_pic").getChildByName("dian").active = false;
                    emailItem.getChildByName("img_jinbi").active = false;
                }
            } else {
                //emailItem.getChildByName("sys_tip").getComponent(cc.Label).string  = '【系统消息】'
                emailItem.getChildByName("img_jinbi").active = false
                emailItem.getChildByName("email_pic").getComponent(cc.Sprite).spriteFrame = this.emails[i].status == 1 ? this.emailstatus[1] : this.emailstatus[0];
                emailItem.getChildByName("email_pic").getChildByName("dian").active = this.emails[i].status != 1;
                emailItem.getChildByName("already").getComponent(cc.Sprite).spriteFrame = this.emailAttchStatus[0];
                emailItem.getChildByName("detailTip").active = this.emails[i].status != 1;
                emailItem.getChildByName("already").active = this.emails[i].status == 1;
            }
            // this.email[i].attachment?true:false;
            emailItem.name = `${this.emails[i].id}`
        }
        let isallNoGet = false;
        //if(this.type == 2){
        // for(let i = 0;i<this.content.childrenCount;i++){
        //     if(this.content.children[i].getChildByName("img_jinbi").active  == false){
        //         isallNoGet =false;
        //     }
        // }
        if (this.content.childrenCount > 0 && this.textIndex == 0) {
            isallNoGet = true;
        }
        //}
        if (this.type == 2 || this.type == 1) {
            if (isallNoGet) {
                this.showTip()
            }
        }
        if (this.emails.length > 0) {
            this.emailUpdate = true;

        }
        this.node_noInfo.active = this.emails.length == 0;
        this.btn_alldelete.node.active = this.emailUpdate;
        console.log('可领取的金币', this.allAttachCoin)

        this.btn_allGet.node.active = this.allAttachCoin > 0 ? true : false;;

    },
    //公告消息
    updateAnnouncemetEmail() {
        let annEmails = glGame.user.get("announceMent").notices;
        console.log('eeeeeeeaaaaaaaaa',annEmails)
        
        this.announUpdate = false;
        for (let i = 0; i < annEmails.length; i++) {
            let announItem = cc.instantiate(this.announItem);
            announItem.parent = this.announContent;
            announItem.getChildByName('bg').getChildByName('node_top').children[0].getComponent(cc.Label).string = '【' + annEmails[i].title + '】'
            announItem.getChildByName('bg').getChildByName('node_top').children[1].getComponent(cc.Label).string = annEmails[i].start_time
            announItem.getChildByName('bg').getChildByName('lab_info').getComponent(cc.Label).string = annEmails[i].content
            announItem.active = true;
        }
        if(annEmails.length>0){
            this.announUpdate = true;
        }
        if(annEmails.length <5){
            this.announUpdate = false;
        }
        this.node_noInfo.active = this.announContent.childrenCount>0 ?false:true;
        this.showUI();
        this.initFace();
    },

    // updateEmailContent 事件回调函数, 刷新邮件显示内容
    updateEmailContent(email) {
        console.log("这是当前邮件的内容", email);
        this.getEmailInfo = email;
        let detail = email.attachment ? this.emailAttch : this.emailDetail
        if (email.attachment) {
            detail = email.attachment.length > 0 ? this.emailAttch : this.emailDetail
        }
        this.CuremailDetail = cc.instantiate(detail);
        this.CuremailDetail.parent = this.node;
        this.CuremailDetail.active = true;
        this.CuremailDetail.getChildByName("title").getComponent(cc.Label).string = email.mail_title;
        this.CuremailDetail.getChildByName("scrollview").children[1].children[0].getComponent(cc.RichText).string = `       ${email.mail_content}`;
        if (email.attachment) {
            if (email.attachment.length > 0) {
                this.CuremailDetail.getChildByName('coinLayout').getChildByName("lab_value").getComponent(cc.Label).string = this.cutDownNum(Number(email.attachment[0].value));
                this.CuremailDetail.getChildByName('btn_oppenGet').active = email.attachment_status == 1 ? false : true;
                this.CuremailDetail.getChildByName('btn_delete').active = email.attachment_status == 1
                this.CuremailDetail.getChildByName('coinLayout').getChildByName('spr_isGet').active = email.attachment_status == 1
            }
        }
        this.alreadyLook(email);
    },

    //时间戳获取年月日时间
    timestampToTime(timestamp) {
        var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear() + '/';
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/';
        var D = date.getDate() + ' ';
        var h = date.getHours() + ':';
        var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        return Y + M + D + h + m;
    },
    //删除全部邮件
    updateDeleMail() {

        this.content.destroyAllChildren();
        this.content.removeAllChildren();
        this.btn_alldelete.node.active = false;
        this.page = 1;
        this.allEmail = []
        this.allAttachCoin = 0;
        if (this.type == 2 || this.type == 1) {
            this.textIndex = 0;
        }

        glGame.user.reqMailList(1, 10, this.type);


    },
    updateGetAllAttach() {
        this.getCoinAttach.active = true;
        this.btn_allGet.node.active = false;
        glGame.audio.playSoundEffect(this.audio_coin);
        //是否有附件
        for (let i = 0; i < this.content.childrenCount; i++) {
            this.content.children[i].getChildByName("email_pic").getComponent(cc.Sprite).spriteFrame = this.emailstatus[1]
            this.content.children[i].getChildByName("email_pic").getChildByName("dian").active = false;
            this.content.children[i].getChildByName("detailTip").active = false
            this.content.children[i].getChildByName("already").getComponent(cc.Sprite).spriteFrame = this.emailAttchStatus[0];
            this.content.children[i].getChildByName("already").active = true;
            this.content.children[i].getChildByName("img_jinbi").active = false;
        }
        //glGame.user.reqMailList(1,10,2);
    },
    //删除选中的邮件
    updateDeleOneMail() {
        this.content.destroyAllChildren();
        this.allEmail = []
        this.allAttachCoin = 0;
        this.page = 1;
        glGame.user.reqMailList(1, 10, this.type);
        this.CuremailDetail.destroy();
        // this.deleteEmail();

    },
    //删除指定邮件
    deleteEmail() {
        for (let i = 0; i < this.content.childrenCount; i++) {
            if (this.content.children[i].name == this.CuremailId) {
                this.content.children[i].destroy();
                break;
            }
        }
        if (this.content.childrenCount == 1) {
            this.btn_alldelete.node.active = false;
        }
    },
    //设置当前邮件已读
    alreadyLook(email) {
        if (email.attachment_status == 0) {
            //已领取
            if (email.status == 1) {
                for (let i = 0; i < this.content.childrenCount; i++) {
                    if (this.content.children[i].name == this.CuremailId) {
                        this.content.children[i].getChildByName("email_pic").getComponent(cc.Sprite).spriteFrame = this.emailstatus[1];
                        this.content.children[i].getChildByName("email_pic").getChildByName("dian").active = false
                    }
                }
                return;
            };
        }
        //已读
        for (let i = 0; i < this.content.childrenCount; i++) {
            if (this.content.children[i].name == this.CuremailId) {
                this.content.children[i].getChildByName("email_pic").getComponent(cc.Sprite).spriteFrame = this.emailstatus[1];
                this.content.children[i].getChildByName("email_pic").getChildByName("dian").active = false
                this.content.children[i].getChildByName("detailTip").active = false;
                this.content.children[i].getChildByName("already").active = true;
                break;
            }
        }

    },
    //附件领取成功
    updateGetAttach() {
        this.getCoinAttach.active = true;
    },
    sureGetAttach() {
        if (!this.getIsAllGet) {
            this.CuremailDetail.destroy();
            console.log('this.getEmailInfo', this.getEmailInfo)
            //this.getEmailInfo.attachment_status = 1;
            this.alreadyLook(this.getEmailInfo)
        }
        this.getCoinAttach.destroy();
        glGame.panel.showTip('领取成功');
        glGame.audio.playSoundEffect(this.audio_coin);


        this.content.destroyAllChildren();
        this.page = 1;
        this.allEmail = []
        this.allAttachCoin = 0;
        glGame.user.reqMailList(1, 10, 2);
    },
    click_close() {
        this.page = 1;
        glGame.panel.revertOpenNodeEffect(this.node, 2).then(() => { this.remove() });
        glGame.emitter.emit("plazaOpen")
    },



    //滚动到底部请求数据
    onScrollEvent(scroll, event) {
        if (this.content.y >= this.content.height && this.emailUpdate) {
            this.page++;
            this.emailUpdate = false;
            console.log("请求邮件列表")
            glGame.user.reqMailList(this.page, 10, this.type);
        }
    },

    onAnnounScrollEven(scorll,event) {
        if (this.announContent.y >= this.announContent.height && this.announUpdate) {
            this.annPage++;
            this.announUpdate = false;
            console.log("请求公告列表",this.annPage)
            glGame.user.ReqNotice(this.annPage, 5);
        }
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
    //显示提示
    showTip() {
        if (this.tipTimeOut) this.clearTipTime();
        this.tip_lab.active = true;
        this.tipTimeOut = setInterval(() => {
            this.tip_lab.active = false;
            this.clearTipTime();
        }, 2000);
    },

    //清理提示倒计时
    clearTipTime() {
        if (this.tipTimeOut) {
            clearTimeout(this.tipTimeOut);
        }
        this.tip_lab.active = false;
        this.tipTimeOut = null;
    },
});

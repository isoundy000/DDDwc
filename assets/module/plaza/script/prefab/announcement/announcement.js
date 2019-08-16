glGame.baseclass.extend({

    properties: {
        RowItem: cc.Node,
        CowItem: cc.Node,
        CowtitleItem: cc.Node,
        RowtitleItem: cc.Node,
        detailItem: cc.Node,
        contentItem: cc.Node,
        Btn_rewardItem: cc.Node,
        conditionItem: cc.Node,
        formItem: cc.Node,
        form: cc.Node,
        Item_string: cc.Node,
        conditioncontent: cc.Node,
        CowViewcontent: cc.Node,
        conditioncontent: cc.Node,
        contentView: cc.Node,
        titlePic: cc.Node,
        ann_confirmbox: cc.Prefab,
        reward_state: [cc.SpriteFrame],
        icon: [cc.SpriteFrame],

        audio_coin:{
            type:cc.AudioClip,
            default: null
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        glGame.emitter.on("ReqRedDot", this.initReddot, this);
        glGame.emitter.on("announcementActionEnd", this.announcementActionEnd, this);
    },
    announcementActionEnd(){
        this.reqRowtitle();
        this.CurbigTitle = null;
        this.iSallreward = true;
        if (isiPhoneX) {
            let Cowwidth = this.node.getChildByName("CowtitleView").getComponent(cc.Widget),
            contentwidth = this.node.getChildByName("contentView").getComponent(cc.Widget),
            contentViewwidth = this.contentView.getComponent(cc.Widget);
            Cowwidth.left += 35;
            contentwidth.left += 35;
            contentViewwidth.updateAlignment();
            Cowwidth.updateAlignment();
            contentwidth.updateAlignment();
        }
    },
    initReddot() {
        console.log("这是当前的数据",this.RowtitleData)
        let redDotData = glGame.user.get("redDotData")
        let data = redDotData.discountReq ? redDotData.discountReq : {}
        for (let j = 0; j < this.CowViewcontent.childrenCount; j++) {
            this.CowViewcontent.children[j].getChildByName("dian").active = false;
        }
        for (let key in data) {
            for (let j = 0; j < this.CowViewcontent.childrenCount; j++) {
                let id = this.CowViewcontent.children[j].name.substring(3);
                if (data[key].category_id == this.RowtitleData[Number(id)].id) {
                    this.CowViewcontent.children[j].getChildByName("dian").active = true;
                    break;
                }
            }
        }
    },
    onClick(name, node) {
        if (glGame.user.isTourist()) {
            if (name == `btn_reward` || name == `btn_goreward` || name == `allreward`) {
                glGame.panel.showRegisteredGift(true);
                return;
            }
        }

        for (let i = 0; i < this.CowViewcontent.childrenCount; i++) {
            let btnname = this.CowViewcontent.children[i].name
            if (btnname == name) {
                this.CurCowinfo = null;
                this.Curid = this.RowtitleData[i].id
                return this.reqCowtitle(this.RowtitleData[i].id);
            }
        }
        for (let i = 0; i < this.contentView.childrenCount; i++) {
            let btnname = this.contentView.children[i].children[0].children[0].children[0].name;
            if (btnname == name) {
                if (this.CurCowinfo && this.CurCowData[i].discount_activity_title == this.CurCowinfo.title) {
                    this.detail.destroy();
                    this.CurCowinfo = null;
                    return;
                };
                this.CurCowinfo = { type: this.CurCowData[i].type, id: this.CurCowData[i].id, title: this.CurCowData[i].discount_activity_title, index: i };
                return this.reqActivitydetail(this.CurCowData[i].id, this.CurCowData[i].type);
            }
        }
        switch (name) {
            case "close": return this.close();
            case "btn_reward": return this.btn_reward(node);
            case "btn_goreward": return this.btn_goreward();
            case "allreward": return this.btn_allreward(node);
            case "service": return glGame.panel.showService();
        }
    },
    btn_reward(node) {
        node.getComponent(cc.Button).interactable = false
        let reqid = node.parent.name == "registerbonus" ? this.CurcontentData.rewardItem.id : this.CurcontentData.rewardItem[node.parent.name].id;
        this.Curreward = node.parent.name == "registerbonus" ? this.CurcontentData.rewardItem.reward : this.CurcontentData.rewardItem[node.parent.name].reward;
        console.log("这是当前的reward", this.CurCowinfo.type, this.CurCowinfo.id)
        if (this.schedule == 1) {
            this.reqreward(this.CurCowinfo.type, this.CurCowinfo.id, -1)
        } else {
            this.reqreward(this.CurCowinfo.type, this.CurCowinfo.id, reqid)
        }
        console.log("获取当前的奖励", this.CurCowinfo.type, this.CurCowinfo.id, reqid)
    },
    //领取所有的奖励
    btn_allreward(node) {
        node.getComponent(cc.Button).interactable = false
        for (let i = 0; i < this.contentView.childrenCount; i++) {
            let btnname = this.contentView.children[i].children[0].children[0].children[0].name;
            if (btnname == node.parent.children[0].children[0].name) {
                this.Curreward = this.CurCowData[i].coin
                console.log("获取当前奖励", this.CurCowData[i].type, this.CurCowData[i].id, btnname, this.CurCowData[i])
                return this.reqreward(this.CurCowData[i].type, this.CurCowData[i].id, -1)
            }
        }
    },
    //去完成
    btn_goreward() {
        glGame.panel.revertOpenNodeEffect(this.node, 2).then(() => { this.remove() });
        if (this.CurCowinfo.type == 2 || this.CurCowinfo.type == 3 || this.CurCowinfo.type == 6) {
            glGame.panel.showShop();
        } else if (this.CurCowinfo.type == 7) {
            glGame.user.isTourist()?glGame.panel.showRegistration(true):glGame.panel.showPanelByName("userinfo");
        } else {
            glGame.emitter.emit("plazaOpen")
        }
        this.onClick("close")
    },
    //请求当前的大标题
    reqRowtitle() {
        glGame.gameNet.send_msg("http.reqDiscountsType", {}, (route, msg) => {
            console.log("这是当前标题111", msg)
            this.RowtitleData = msg;
            this.updateRowTitle();
            this.Curid = this.RowtitleData[0].id
            this.reqCowtitle(this.RowtitleData[0].id)
        })
    },
    //请求当前的小标题
    reqCowtitle(id) {
        glGame.gameNet.send_msg("http.reqDiscountsList", { category_id: id }, (route, msg) => {
            console.log("这是当前标题222", msg)
            this.CurCowData = msg
            this.UpdateCurCowtitle();
        })
    },
    //请求活动的具体内容
    reqActivitydetail(titleid, titletype) {
        glGame.gameNet.send_msg("http.reqDiscountsInfo", { id: titleid, type: titletype }, (route, msg) => {
            console.log("这是活动的具体内容的消息", msg)
            this.CurcontentData = msg
            this.UpdatecontentView();
            this.UPdateReward();
        })
    },
    //领取奖励的协议
    reqreward(rewardtype, rewardid, rewardgrade = 0) {
        glGame.gameNet.send_msg("http.ReqDiscountsReceive", { type: rewardtype, id: rewardid, grade: rewardgrade }, (route, msg) => {
            this.Btn_updateCow();
            this.Btn_updatedetail();
            let ann_confirmbox = cc.instantiate(this.ann_confirmbox);
            if (msg.data.type == 1) {
                ann_confirmbox.getChildByName("reward").active = true;
                ann_confirmbox.parent = this.node.parent;
                ann_confirmbox.getChildByName("reward").getChildByName("Tiplayout").getChildByName("coin").getComponent(cc.Label).string = this.getFloat(this.Curreward);
                glGame.audio.playSoundEffect(this.audio_coin);
            } else if (msg.data.type == 2) {
                ann_confirmbox.getChildByName("Auditing").active = true;
                ann_confirmbox.parent = this.node.parent;
                ann_confirmbox.getChildByName("Auditing").getChildByName("Tip_string").getComponent(cc.RichText).string =
                    `您申请的<color=#00ff00>${this.getFloat(this.Curreward)}</c>奖励已提交审核，请耐心等待，审核通过后，奖励将直接发放到您的保险柜中`
            }
            glGame.user.ReqRedDot();
            glGame.user.reqMyInfo();
        })
    },
    //刷新横标题的按钮状态
    Btn_updateCow() {
        glGame.gameNet.send_msg("http.reqDiscountsList", { category_id: this.Curid }, (route, msg) => {
            console.log("这是当前标题222", msg)
            this.CurCowData = msg
            let string_type = {
                0: "您暂未达到要求，达到后即可领取",
                1: "可领取金额:",
                2: "恭喜您！已完成所有任务！",
                3: "该活动不支持在线领取"
            }
            for (let i = 0; i < this.contentView.childrenCount; i++) {
                this.contentView.children[i].getChildByName("content").getChildByName("depict").getComponent(cc.RichText).string =
                this.CurCowData[i].received_status == 1 ? `${string_type[this.CurCowData[i].received_status]}\n<color=#ffdf5e><size=32>${this.getFloat(this.CurCowData[i].coin)}</size></c>` : string_type[this.CurCowData[i].received_status]
                this.contentView.children[i].children[0].getChildByName("service").active = this.CurCowData[i].received_status == 3;
                this.contentView.children[i].children[0].getChildByName("allreward").active = this.CurCowData[i].received_status == 1 || this.CurCowData[i].received_status == 0
                this.contentView.children[i].getChildByName("content").getChildByName("allreward").getChildByName("title").active = this.CurCowData[i].received_status == 0
                this.contentView.children[i].getChildByName("content").getChildByName("allreward").getComponent(cc.Button).interactable = this.CurCowData[i].received_status == 1;
                this.contentView.children[i].getChildByName("content").getChildByName("isrewardPic").active = this.CurCowData[i].received_status == 2
                this.contentView.children[i].getChildByName("content").getChildByName("allreward").getChildByName("Label").active = this.CurCowData[i].received_status == 1
            }
        })
    },
    Btn_updatedetail() {
        if (!this.detail || !this.CurCowinfo) return;
        glGame.gameNet.send_msg("http.reqDiscountsInfo", { id: this.CurCowinfo.id, type: this.CurCowinfo.type }, (route, msg) => {
            this.CurcontentData = msg
            let rewardItem = this.CurcontentData.rewardItem
            if (rewardItem.length) {
                for (let i = 0; i < rewardItem.length; i++) {
                    this.detail.getChildByName(`${i}`).getChildByName("btn_reward").active = rewardItem[i].state == 0;
                    this.detail.getChildByName(`${i}`).getChildByName("btn_goreward").active = rewardItem[i].state == 2;
                    this.detail.getChildByName(`${i}`).getChildByName("oldreward").active = rewardItem[i].state == 1;
                    this.detail.getChildByName(`${i}`).getChildByName("schedule").active = rewardItem[i].state == 2;
                    if (rewardItem[i].schedule[1] == 1 && rewardItem[i].state == 0) {
                        this.detail.getChildByName(`${i}`).getChildByName("schedule").active = true;
                    } else if ((rewardItem[i].schedule[1] == 2 || rewardItem[i].schedule[1] == 3) && rewardItem[i].state == 2) {
                        this.detail.getChildByName(`${i}`).getChildByName("schedule").active = true;
                    } else {
                        this.detail.getChildByName(`${i}`).getChildByName("schedule").active = false;
                    }
                }
            } else {
                this.detail.getChildByName("registerbonus").getChildByName("btn_reward").active = rewardItem.state == 0;
                this.detail.getChildByName("registerbonus").getChildByName("btn_goreward").active = rewardItem.state == 2;
                if (rewardItem.state == 1 || rewardItem.state == 4 || rewardItem.state == 5) {
                    this.detail.getChildByName("registerbonus").getChildByName("oldreward").active = true
                } else {
                    this.detail.getChildByName("registerbonus").getChildByName("oldreward").active = false;
                }
            }
        })
    },
    //详情领取更新大标题内容
    updatebigBtn(){
        let count = 0;
        for(let i=0;i<this.detail.childrenCount;i++){
            let item = this.detail.children[i].getChildByName("btn_reward");
            if(item&&item.active){
                count++
            }
        }
        if(count!=0){
            this.detail.parent.getChildByName("content").getChildByName("allreward").getComponent(cc.Button).interactable = true;
            this.detail.parent.getChildByName("content").getChildByName("allreward").children[0].active = true;
            this.detail.parent.getChildByName("content").getChildByName("allreward").children[1].active = false;
        }
    },
    //更新大标题按钮
    updateRowTitle() {
        for (let i = 0; i < this.RowtitleData.length; i++) {
            let RowItem = cc.instantiate(this.RowtitleItem);
            RowItem.getChildByName("Background").getChildByName("titlename").getComponent(cc.Label).string = this.RowtitleData[i].title;
            RowItem.getChildByName("checkmark").getChildByName("titlename").getComponent(cc.Label).string = this.RowtitleData[i].title;
            //RowItem.getChildByName("dian").active = this.RowtitleData[i].is_red == 0;
            RowItem.name = `Row${i}`
            RowItem.parent = this.CowViewcontent;
            RowItem.active = true;
        }
        this.initReddot();
    },
    //更新小标题按钮
    UpdateCurCowtitle() {
        this.contentView.destroyAllChildren();
        this.contentView.removeAllChildren();
        let string_type = {
            0: "您暂未达到要求，达到后即可领取",
            1: "可领取金额:",
            2: "恭喜您！已完成所有任务！",
            3: "该活动不支持在线领取"
        }
        for (let i = 0; i < this.CurCowData.length; i++) {
            let CowItem = cc.instantiate(this.CowtitleItem);
            if(this.CurCowData[i].front_img){
                glGame.panel.showRemoteImage(CowItem.getChildByName("content").getChildByName("mask").getChildByName("pic"), this.CurCowData[i].front_img);
            }
            CowItem.getChildByName("content").getChildByName("depict").getComponent(cc.RichText).string =
                this.CurCowData[i].received_status == 1 ? `${string_type[this.CurCowData[i].received_status]}\n<color=#ffdf5e><size=32>${this.getFloat(this.CurCowData[i].coin)}</size></c>` : string_type[this.CurCowData[i].received_status]
            CowItem.getChildByName("content").getChildByName("service").active = this.CurCowData[i].received_status == 3;
            CowItem.getChildByName("content").getChildByName("allreward").active = this.CurCowData[i].received_status == 1 || this.CurCowData[i].received_status == 0;
            CowItem.getChildByName("content").getChildByName("allreward").getChildByName("title").active = this.CurCowData[i].received_status == 0
            CowItem.getChildByName("content").getChildByName("allreward").getComponent(cc.Button).interactable = this.CurCowData[i].received_status == 1;
            CowItem.getChildByName("content").getChildByName("isrewardPic").active = this.CurCowData[i].received_status == 2
            CowItem.getChildByName("content").getChildByName("allreward").getChildByName("Label").active = this.CurCowData[i].received_status == 1
            CowItem.getChildByName("content").getChildByName("mask").getChildByName("pic").name = `Cow${i}`
            CowItem.parent = this.contentView;
            CowItem.active = true;
        }
    },
    //更新具体详情的内容
    UpdatecontentView() {
        if (this.detail) {
            this.detail.destroy();
            this.detail.removeFromParent();
        }
        this.detail = cc.instantiate(this.detailItem);
        this.detail.active = true;
        this.detail.getChildByName("title_bg").getChildByName("title_string").getComponent(cc.Label).string = this.CurCowinfo.title;
        this.detail.parent = this.contentView.children[this.CurCowinfo.index]
        let titledetail = this.CurcontentData.titledetail
        console.log("这是当前的详情信息", titledetail)
        if (!titledetail) return;
        let itemwidth = this.detail.width - 50
        for (let i = 0; i < titledetail.length; i++) {
            if (titledetail[i].title === "活动表格") {
                if (titledetail[i].type == 3) {
                    let titlePic = cc.instantiate(this.titlePic);
                    titlePic.parent = this.detail;
                    titlePic.name = "newpic";
                    titlePic.active = true;
                    glGame.panel.showRemoteImage(titlePic, titledetail[i].content)
                    if (this.detail.width < 923) {
                        titlePic.width = this.detail.width - 10;
                        titlePic.height = 220 * ((this.detail.width - 10) / 923);
                    }
                } else {
                    this.addform(titledetail[i].content)
                }
                continue;
            }
            let content = cc.instantiate(this.contentItem);
            content.getChildByName("title").getComponent(cc.Label).string = titledetail[i].title;
            content.getChildByName("title").getChildByName("pic").getComponent(cc.Sprite).spriteFrame = this.icon[titledetail[i].icon]
            content.getChildByName("content").getComponent(cc.RichText).string = titledetail[i].content;
            content.getChildByName("content").getComponent(cc.RichText).maxWidth = itemwidth;
            content.active = true;
            content.parent = this.detail;
        }
    },
    //增加表格
    addform(introduceform) {
        let arr = [];
        for (let i = 0; i < introduceform.length; i++) {
            let lengthCount = 0;
            for (let j = 0; j < introduceform[i].length; j++) {
                lengthCount = lengthCount + introduceform[i][j].length;
            }
            arr.push(lengthCount);
        }
        let index = arr.indexOf(Math.max.apply(null, arr));
        if (!introduceform.length) return;
        let distance = [0];
        let form = cc.instantiate(this.form);
        let Cowdistance = [];
        form.parent = this.detail;
        form.width = 20;
        for (let i = 0; i < introduceform[index].length; i++) {
            let Item_string = cc.instantiate(this.Item_string);
            Item_string.getComponent(cc.RichText).string = introduceform[index][i]
            if (introduceform[index][i + 1]) {
                distance.push(Item_string.width + 20)
                Cowdistance.push(Item_string.width + 10)
            }
            form.width += Item_string.width + 20;
        }
        for (let i = 0; i < introduceform.length; i++) {
            let formItem = cc.instantiate(this.formItem);
            formItem.parent = form;
            if (introduceform[i + 1]) {
                let RowItem = cc.instantiate(this.RowItem);
                RowItem.y = -20;
                RowItem.parent = formItem;
                RowItem.height = form.width;
                RowItem.active = true;
            }
            formItem.active = true;
            for (let j = 0; j < introduceform[i].length; j++) {
                let Item_string = cc.instantiate(this.Item_string);
                Item_string.getComponent(cc.RichText).string = introduceform[i][j];
                Item_string.parent = formItem;
                for (let k = j; k >= 0; k--) {
                    Item_string.x += distance[k];
                }
                Item_string.x += 20
                if (introduceform[i][j + 1]) {
                    let CowItem = cc.instantiate(this.CowItem);
                    CowItem.parent = Item_string;
                    CowItem.x = Cowdistance[j];
                    CowItem.height = 42
                    CowItem.active = true;
                }
                Item_string.active = true;
            }
        }
        form.active = true;
        if (form.width > this.detail.width) {
            form.setScale((this.detail.width - 10) / form.width)
        }
    },
    //刷新奖励领取内容
    UPdateReward() {
        let rewardItem = this.CurcontentData.rewardItem
        console.log("这是当前的领取内容", this.CurcontentData)
        if (!rewardItem) return;
        let state = {
            1: this.reward_state[0],
            4: this.reward_state[1],
            5: this.reward_state[2],
        }
        if (rewardItem.length) {
            for (let i = 0; i < rewardItem.length; i++) {
                let Item = cc.instantiate(this.Btn_rewardItem)
                Item.parent = this.detail;
                Item.active = true;
                Item.getChildByName("getStr").getComponent(cc.Label).string = rewardItem[i].getStr;
                Item.name = `${i}`;
                if (rewardItem[i].reward_des == 1) {
                    let Count = 0;
                    for (let j = i; j >= 0; j--) {
                        Count += rewardItem[j].reward
                    }
                    if (i == 0) {
                        Item.getChildByName("Layout").getChildByName("reward_string").getComponent(cc.Label).string = this.getFloat(rewardItem[i].reward);
                    } else {
                        Item.getChildByName("Layout").getChildByName("reward_string").getComponent(cc.Label).string = `${this.getFloat(rewardItem[i].reward)}`;
                        Item.getChildByName("Layout").getChildByName("accumulate").active = true;
                        Item.getChildByName("Layout").getChildByName("accumulate").getComponent(cc.Label).string = `(累积奖励${this.getFloat(Count)})`
                    }
                } else {
                    Item.getChildByName("Layout").getChildByName("reward_string").getComponent(cc.Label).string = this.getFloat(rewardItem[i].reward);
                }
                Item.getChildByName("btn_reward").active = rewardItem[i].state == 0;
                Item.getChildByName("btn_goreward").active = rewardItem[i].state == 2;
                Item.getChildByName("oldreward").active = rewardItem[i].state == 1;
                if (rewardItem[i].schedule[1] == 1 && rewardItem[i].state == 0) {
                    Item.getChildByName("schedule").active = true;
                    Item.getChildByName("btn_reward").y -= 20
                }
                if ((rewardItem[i].schedule[1] == 2 || rewardItem[i].schedule[1] == 3) && rewardItem[i].state == 2) {
                    Item.getChildByName("schedule").active = true;
                    Item.getChildByName("btn_goreward").y -= 20
                } else {

                }
                this.schedule = Number(rewardItem[i].schedule[1]);
                switch (this.schedule) {
                    case 1:
                        //Item.getChildByName("oldreward").getComponent(cc.Sprite).spriteFrame = this.reward_state[1]
                        Item.getChildByName("schedule").getComponent(cc.RichText).string =
                            rewardItem[i].schedule[4] + `  <color=#ffd488>${this.getFloat(rewardItem[i].schedule[2])}</c>/${this.getFloat(rewardItem[i].schedule[3])}`
                        break;
                    case 2:
                        //Item.getChildByName("oldreward").getComponent(cc.Sprite).spriteFrame = this.reward_state[2]
                        Item.getChildByName("schedule").getComponent(cc.RichText).string =
                            rewardItem[i].schedule[4];
                        console.log("这是当前还需要的投注量", rewardItem[i].schedule[4])
                        break;
                    case 3:
                        //Item.getChildByName("oldreward").getComponent(cc.Sprite).spriteFrame = this.reward_state[2]
                        Item.getChildByName("schedule").getComponent(cc.RichText).string =
                            rewardItem[i].schedule[4] + `  ${rewardItem[i].schedule[2]}/${rewardItem[i].schedule[3]}`
                        break;
                }
            }
        } else { //以下情况是存在注册彩金的情况时
            let contentItem = cc.instantiate(this.conditioncontent);
            contentItem.getChildByName("getStr").getComponent(cc.Label).string = rewardItem.getStr;
            contentItem.getChildByName("reward_string").getComponent(cc.Label).string = this.getFloat(rewardItem.reward);
            contentItem.getChildByName("btn_reward").active = rewardItem.state == 0;
            contentItem.getChildByName("btn_goreward").active = rewardItem.state == 2;
            if (rewardItem.state == 1 || rewardItem.state == 4 || rewardItem.state == 5) {
                contentItem.getChildByName("oldreward").active = true
            } else {
                contentItem.getChildByName("oldreward").active = false;
            }
            contentItem.parent = this.detail;
            contentItem.active = true;
            contentItem.name = "registerbonus"
            let conditional = this.CurcontentData.conditional
            for (let i = 0; i < conditional.length; i++) {
                let conditionItem = cc.instantiate(this.conditionItem);
                conditionItem.getChildByName("condition_string").getComponent(cc.Label).string = conditional[i].content;
                conditionItem.getChildByName("gou").active = conditional[i].state == 1;
                conditionItem.getChildByName("condition_string").color = conditional[i].state == 1 ? cc.color(0, 255, 0) : cc.color(255, 84, 0)
                conditionItem.parent = contentItem.getChildByName("content");
                conditionItem.active = true;
            }
        }
        this.updatebigBtn();
        setTimeout(() => {
            this.contentView.y = this.CurCowinfo.index * 235 + 307;
            console.log("这是当前的y的坐标位置", this.contentView.y)
        }, 50)
    },
    initposition() {
        for (let i = 0; i < this.contentView.childrenCount; i++) {
            let count = 0;
            for (let j = 0; j < i; j++) {
                count += this.contentView.children[j].height;
                count += 10;
            }
            this.contentView.children[i].y = count;
        }
    },
    //桌面数据的显示
    getFloat(value) {
        return (Number(value).div(100)).toString();
    },
    close() {
        glGame.panel.revertOpenNodeEffect(this.node, 2).then(() => { this.remove() });
        glGame.emitter.emit("plazaOpen")
    },
    // update (dt) {},
    OnDestroy() {
        glGame.emitter.off("ReqRedDot", this);
        glGame.emitter.off("announcementActionEnd",this);
    },
});

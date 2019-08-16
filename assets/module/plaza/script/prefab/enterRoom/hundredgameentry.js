const Game = {
    15: "扎金花",
    18: "抢庄牛牛",
    22: "百人牛牛",
    27: "三公",
    28: "红黑",
    29: "水果机",
    30: "龙虎斗",
    31: "拉霸",
    32: "百家乐",
    33: "牌九",
    34: "幸运大转盘",
    35: "德州扑克",
    36: "斗地主",
    37: "急速扎金花",
    39: "二八杠",
    38: "21点",
    40:"捕鱼",
    41: '抢红包接龙',
    42: "十三水",
    43: "豪车漂移",
    44: "森林舞会"
}
const CONFIGS = {
    1: "体验场",
    2: "普通场",
    3: "贵宾场",
    4: "豪华场"
}
glGame.baseclass.extend({

    properties: {
        goldCount: cc.Label,
        username:cc.Label,
        announcement: cc.Node,
        content: cc.Node,
        node_Top:[cc.Node],
        hcpy_newUI:[cc.SpriteFrame],
        slwh_newUI:[cc.SpriteFrame],
        girl_spine: sp.Skeleton,

        zhajinhuaUI: [cc.SpriteFrame],
        qznnUI: [cc.SpriteFrame],
        brnnUI: [cc.SpriteFrame],
        sangongUI: [cc.SpriteFrame],
        hongheiUI: [cc.SpriteFrame],
        shuiguojiUI: [cc.SpriteFrame],
        longhudouUI: [cc.SpriteFrame],
        baijialeUI: [cc.SpriteFrame],
        paijiuUI: [cc.SpriteFrame],
        luckturntableUI: [cc.SpriteFrame],
        dzpkUI: [cc.SpriteFrame],
        ddzUI: [cc.SpriteFrame],
        jszjhUI:[cc.SpriteFrame],
        ebgUI:[cc.SpriteFrame],
        esydUI:[cc.SpriteFrame],
        fishUI:[cc.SpriteFrame],
        qhbjlUI:[cc.SpriteFrame],
        sssUI:[cc.SpriteFrame],
        hcpyUI:[cc.SpriteFrame],
        slwhUI:[cc.SpriteFrame],
        gameSettingPanel: [cc.Sprite],


        zhajinhuaspine: sp.SkeletonData,
        qznnspine: sp.SkeletonData,
        sangongspine: sp.SkeletonData,
        paijiuspine: sp.SkeletonData,
        dzpkspine: sp.SkeletonData,
        ddzspine: sp.SkeletonData,
        jszjhspine: sp.SkeletonData,
        ebgspine: sp.SkeletonData,
        esydspine: sp.SkeletonData,
        fishspine: sp.SkeletonData,
        sssspine: sp.SkeletonData,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.gameid = 0;
        glGame.emitter.on("horseRaceLamp_area", this.onBroadcast, this);
        glGame.emitter.on("nodeRemove", this.click_back, this);
        this.updateuserInfo();
    },
    onClick(name, node) {
        switch (name) {
            case "btn_back": this.click_back(); break;
            case "btn_help": this.click_help(); break;
            case "btn_record": this.click_record(); break;
            case "mycoinInfo": this.click_addgold(); break;
            case "headbg": this.click_userinfo(); break;
            case "btn_chongzhi":this.click_addgold();break;
            default: console.error("no find button name -> %s", name);
        }
    },
    cutFloat(value) {
        return (Number(value).div(100)).toString();
    },
    showUserInfo() {
        glGame.panel.showRemoteImage(this.Playerhead, glGame.user.get("headURL"));
    },
    updateuserInfo() {
        let coin = glGame.user.get("coin")
        this.goldCount.string = glGame.user.GoldTemp(coin);
        this.username.string = glGame.user.get("nickname")
    },

    setGameId(gameid){
        this.gameid = gameid;
    },

    updateBgInfo() {
        let gameName = glGame.scene.getSceneNameByID(this.gameid);
        let count = this.gameSettingPanel.length;
        for (let i = 0; i < count; i++) {
            this.gameSettingPanel[i].spriteFrame = this[`${gameName}UI`][i];
        }
        switch (this.gameid) {
            case glGame.scenetag.ZHAJINHUA:
            case glGame.scenetag.QZNN:
            case glGame.scenetag.SANGONG:
            case glGame.scenetag.PAIJIU:
            case glGame.scenetag.DZPK:
            case glGame.scenetag.DDZ:
            case glGame.scenetag.JSZJH:
            case glGame.scenetag.EBG:
            case glGame.scenetag.ESYD:
            case glGame.scenetag.FISH:
            case glGame.scenetag.SSS:
                this.username.node.color = new cc.Color(255, 212, 136);
                this.goldCount.node.color = new cc.Color(255, 212, 136);
                glGame.panel.showChildPanelByName(`${gameName}select`, this.node)
                let AnimationName = "idle_0";
                if(this.gameid == glGame.scenetag.FISH || this.gameid ==glGame.scenetag.QZNN || this.gameid ==glGame.scenetag.DDZ
                ||this.gameid ==glGame.scenetag.ZHAJINHUA || this.gameid ==glGame.scenetag.JSZJH || this.gameid ==glGame.scenetag.PAIJIU
                ||this.gameid == glGame.scenetag.SSS){
                    AnimationName="animation" 
                }
                if(this.gameid ==glGame.scenetag.QZNN || this.gameid ==glGame.scenetag.DDZ
                ||this.gameid ==glGame.scenetag.ZHAJINHUA || this.gameid ==glGame.scenetag.JSZJH){
                    this.girl_spine.node.x +=50
                }
                if(this.gameid ==glGame.scenetag.PAIJIU){
                    this.girl_spine.node.position = cc.v2(0,0);
                }
                this.girl_spine.node.active = true;
                this.girl_spine.skeletonData = this[`${gameName}spine`];
                this.girl_spine.setAnimation(0, AnimationName, true);
                break;
            case glGame.scenetag.HCPY:
                this.username.node.color = new cc.Color(229, 248, 255);
                this.goldCount.node.color = new cc.Color(229, 248, 255);
                this.girl_spine.node.active = false;
                this.initUI(this.hcpy_newUI, 20, 0);
                glGame.panel.showChildPanelByName(`${gameName}select`, this.node)
                break;
            case glGame.scenetag.SLWH:
                this.username.node.color = new cc.Color(229, 248, 253);
                this.goldCount.node.color = new cc.Color(229, 248, 253);
                this.girl_spine.node.active = false;
                this.node_Top[0].scaleX = -1;
                this.node_Top[1].scaleX = 1;
                this.initUI(this.slwh_newUI, 0, -8);
                glGame.panel.showChildPanelByName(`${gameName}select`, this.node)
                break;
            default:
                this.username.node.color = new cc.Color(255, 212, 136);
                this.goldCount.node.color = new cc.Color(255, 212, 136);
                this.girl_spine.node.active = false;
                glGame.panel.showChildPanelByName(`${gameName}select`, this.node)
                break;
        }
    },
    initUI(newUI, x, y){
        this.node_Top[0].getComponent(cc.Sprite).spriteFrame = newUI[0];
        this.node_Top[1].getComponent(cc.Sprite).spriteFrame = newUI[0];
        this.node_Top[2].getComponent(cc.Sprite).spriteFrame = newUI[1];
        this.node_Top[3].getComponent(cc.Sprite).spriteFrame = newUI[2];
        this.node_Top[4].getComponent(cc.Sprite).spriteFrame = newUI[3];
        this.node_Top[5].getComponent(cc.Sprite).spriteFrame = newUI[4];
        this.node_Top[6].getComponent(cc.Sprite).spriteFrame = newUI[5];
        this.node_Top[7].getComponent(cc.Sprite).spriteFrame = newUI[6];
        this.node_Top[8].getComponent(cc.Sprite).spriteFrame = newUI[7];
        this.node_Top[9].getComponent(cc.Sprite).spriteFrame = newUI[7];
        this.node_Top[3].x =this.node_Top[3].x +x;
        this.node_Top[4].x =this.node_Top[4].x +x;
        this.node_Top[5].x =this.node_Top[5].x +x;
        this.node_Top[6].x =this.node_Top[6].x +x;
        this.node_Top[7].x =this.node_Top[7].x +x;
        this.node_Top[3].y =this.node_Top[3].y +y;
        this.node_Top[4].y =this.node_Top[4].y +y;
        this.node_Top[5].y =this.node_Top[5].y +y;
        this.node_Top[6].y =this.node_Top[6].y +y;
        this.node_Top[7].y =this.node_Top[7].y +y;
    },
  
    click_userinfo() {
        glGame.panel.showPanelByName("userinfo");
    },
    click_addgold() {
        glGame.panel.showShop();
    },
    click_back() {
        glGame.readyroom.reqExitArea();
        this.remove();
    },
    click_help() {
        // let gameName = glGame.scene.getSceneNameByID(this.gameid);
        // if (gameName == "ddz" || gameName == "dzpk") {
        glGame.panel.showNewGameRule(this.gameid);
        // } else {
        // glGame.panel.showGameRule(gameName);
        // }
    },
    click_record() {
        // console.log("gameid", this.gameid)
        // if (this.gameid == 36 || this.gameid == 35 || this.gameid == 30) {
        glGame.panel.showNewGameRecord(this.gameid);
        // } else {
        //     glGame.panel.showGameRecord(this.gameid);
        // }
    },

    set(key, value) {
        this[key] = value;
    },
    get(key) {
        return this[key];
    },
    OnDestroy() {
        glGame.emitter.off("horseRaceLamp_area", this);
        glGame.emitter.off("nodeRemove", this);
    },
    //公告
    onBroadcast(msg) {
        for (let i = 0; i < this.content.childrenCount; i++) {
            if (this.content.children[i].y > -40) {
                this.content.children[i].removeFromParent();
                this.content.children[i].destroy();
            }
        }
        let announce = msg,
            lastnode_posy = this.content.childrenCount == 0 ? 0 : this.content.children[this.content.childrenCount - 1].y,
            childrenCount = this.content.childrenCount;
        for (let i = 0; i < announce.length; i++) {
            let Item = cc.instantiate(this.announcement);
            Item.parent = this.content;
            Item.active = true;
            Item.y = childrenCount == 0 ? (-40 - i * 114) : lastnode_posy - (i + 1) * 114;
            let winCoin = this.cutFloat(announce[i].winCoin)
            let betType = announce[i].betType
            let gameName = Game[this.gameid];
            Item.getComponent(cc.RichText).string = `               恭喜玩家 <color=#27d9ff>(ID:${announce[i].logicId})</c>在<color=#ffdd20>${gameName}-${CONFIGS[betType]}</c>内大赢特赢，获得<color=#00ff42>${winCoin}</c>金币。`
        }
        if (childrenCount == 0) return;
        let destance = Math.abs(this.content.children[this.content.childrenCount - 1].y - (-496));
        for (let i = 0; i < this.content.childrenCount; i++) {
            this.content.children[i].stopAllActions();
            this.content.children[i].runAction(cc.moveBy(2, 0, destance))
        }
    },
    // update (dt) {},
});

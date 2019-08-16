

glGame.baseclass.extend({

    properties: {
        label_momey: cc.Label,
        label_nowScore: cc.Label,
        label_myCoin: cc.Label,
        node_option: cc.Node,
        img_option: cc.Node,
        node_hero: cc.Node,
        sp_kuang: sp.Skeleton,
        sp_kuangData: sp.SkeletonData,
        // spine.setAnimation(0, this.getSpineName(result), false);
    },

    onLoad() {
        this.lbmgr = require("labalogic").getInstance();
        this.startbool = false;
        this.awardCount = 0;
        this.myCoin = 0;

        this.cishu = 50;    //变化的次数
        this.time = 2;      //变化的时间

        glGame.emitter.on("updateUserData", this.updateUserData, this);
        glGame.emitter.on("lb.startstrip", this.startstrip, this);
        glGame.emitter.on("lb.awardshow", this.awardshow, this);
        glGame.emitter.on("lb.stopstrip", this.stopstrip, this);
        glGame.emitter.on("lb.myCoinshow", this.myCoinshow, this);
        glGame.emitter.on("lb_initRoom", this.setMomey, this);
    },
    start() {
    },
    onDestroy() {
        glGame.emitter.off("updateUserData", this);
        glGame.emitter.off("lb.startstrip", this);
        glGame.emitter.off("lb.awardshow", this);
        glGame.emitter.off("lb.stopstrip", this);
        glGame.emitter.off("lb.myCoinshow", this);
        glGame.emitter.off("lb_initRoom", this);
    },
    onClick(name, node) {
        switch (name) {
            case "btnOption": return this.btnOption();
            case "option": return this.btnOption();
            case "btnClose": return this.btnClose();
            case "btnSet": return this.btnSet();
            case "btnhelp": return this.btnhelp();
            case "btnRecord": return this.btnRecord();
            default: console.error("no find button name -> %s", name);
        }
    },
    btnClose() {
        console.log("btnClose");
        if (this.startbool) {
            glGame.panel.showExitRoomPanel('hundred',99)
            return
        }
        glGame.room.exitRoom();
    },
    //帮助界面
    btnhelp() {
        glGame.panel.showGameRule(glGame.scenetag.LABA);
        this.btnOption();
    },
    //设置界面开启通知
    btnSet() {
        glGame.emitter.emit("lb.setting");
        this.btnOption();
    },
    //开启战绩界面
    btnRecord() {
        glGame.panel.showNewGameRecord(glGame.scenetag.LABA);
        this.btnOption();
    },
    //开关选项界面
    btnOption() {
        this.node_option.active = !this.node_option.active;
        if (this.node_option.active) this.img_option.angle = -90;
        else this.img_option.angle = 0;
    },
    initHero() {
        let headImg = this.node_hero.getChildByName("hero_icon");
        glGame.panel.showHeadImage(headImg, glGame.user.get("headURL"));

        let hero_name = this.node_hero.getChildByName("hero_name");
        hero_name.getComponent(cc.Label).string = glGame.user.get("nickname")
    },
    //金币显示
    setMomey() {
        this.label_nowScore.string = "0.00";
        this.label_myCoin.string = this.lbmgr.getFixNumber(this.lbmgr.myCoin);
    },

    myCoinshow() {
        if (!this.awardCount) {
            this.setMomey();
            glGame.emitter.emit("lb.stopstrip");
            return;
        }


        this.number1 = Number(this.label_myCoin.string);
        this.number2 = Number(this.label_nowScore.string);
        this.number3 = this.number2;

        let dty, cb, action = [];
        for (let i = 0; i < this.cishu; i++) {
            dty = cc.delayTime(this.time / this.cishu);
            cb = cc.callFunc(() => {
                this.number1 = (Number(this.number1).add(this.number3.div(this.cishu))).toFixed(2).toString();
                this.label_myCoin.string = this.number1;
                this.number2 = (Number(this.number2).sub(this.number3.div(this.cishu))).toFixed(2).toString();
                this.label_nowScore.string = this.number2 == 0 ? "0.00" : this.number2;
            })
            action.push(dty, cb);
        }
        cb = cc.callFunc(() => {
            glGame.emitter.emit("lb.stopstrip");
            this.sp_kuang.node.active = false;
        })
        action.push(cb)
        this.node.runAction(cc.sequence(action));
    },
    //回合开始清理
    startstrip() {
        this.label_myCoin.string = this.lbmgr.getFixNumber(this.lbmgr.myCoin - this.lbmgr.award_count);
        this.startbool = true;
    },
    stopstrip() {
        this.startbool = false;
    },
    //获取注码数量
    getStripCount() {
        let count = 0;
        for (let key in this.lbmgr.betData) {
            let data = this.lbmgr.betData[key];
            if (data != 0) {
                count++;
            }
        }
        return count;
    },
    //刷新当前分值
    awardshow() {
        this.awardCount = this.lbmgr.award_count;
        this.label_nowScore.string = this.lbmgr.getFixNumber(this.lbmgr.award_count);
        //显示龙骨
        this.sp_kuang.node.active = true;
        this.sp_kuang.setAnimation(0, "animation", true);
    },
    //刷新玩家金币
    updateUserData() {
        // this.setMomey();
    },
});

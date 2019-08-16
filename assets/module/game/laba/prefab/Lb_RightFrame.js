
let lbconfig = require("lbconfig");
glGame.baseclass.extend({

    properties: {
        label_stripScore: cc.Label,
        label_pourScore: cc.Label,
        tz_audio:{
            type: cc.AudioClip,
            default: null
        },
        pic_quxiao:cc.Node,
    },

    onLoad() {
        this.lbmgr = require("labalogic").getInstance();
        this.blStart = true;
        this.blautomatic = false; //是否为自动模式
        this.index = this.lbmgr.coin_index;
        this.refreshstrip();
        glGame.emitter.on("lb.stopstrip", this.stopstrip, this);
        glGame.emitter.on("lb.refreshstrip", this.refreshstrip, this);
        glGame.emitter.on("updateUserData", this.updateUserData, this);
        glGame.emitter.on("lb.startbashou", this.startbashou, this);
        glGame.emitter.on("lb.refreshScore", this.refreshScore, this);
    },
    start() {
    },

    OnDestroy() {
        glGame.emitter.off("lb.stopstrip", this);
        glGame.emitter.off("lb.refreshstrip", this);
        glGame.emitter.off("updateUserData", this);
        glGame.emitter.off("lb.startbashou", this);
        glGame.emitter.off("lb.refreshScore", this);
    },
    onClick(name, node) {
        if ((name == "btnStart" || name == "btnSelectStrip") && this.blautomatic) glGame.panel.showErrorTip('自动进行中，请先取消自动！');
        if (!this.blStart && name != "btncancel") return;
        switch (name) {
            case "btnSelectStrip": return this.btnSelectStrip();
            case "btnMinus": return this.btnAward();
            case "btnPlus": return this.btnPlus();
            case "btnStart": return this.btnStart();
            case "btnautomatic": return this.btnautomatic();
            case "btncancel": return this.btncancel();
            default: console.error("no find button name -> %s", name);
        }
    },
    //点击开始
    startbashou() {
        this.onClick("btnStart", null);
    },
    //获取线条数量
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
    //开启选线按钮
    btnSelectStrip() {
        console.log("btnSelectStrip");
        glGame.emitter.emit("lb.openselect");
    },
    //点击筹码删减
    btnAward() {
        console.log("btnAward");
        glGame.audio.playSoundEffect(this.tz_audio);
        this.setScero(-1);
    },
    //点击筹码添加
    btnPlus() {
        console.log("btnPlus");
        glGame.audio.playSoundEffect(this.tz_audio);
        this.setScero(1);
    },
    //点击开始
    btnStart() {
        console.log("btnStart");
        if (this.lbmgr.myCoin < this.lbmgr.pour_score) {
            glGame.panel.showMsgBox("温馨提示", "      当前游戏币不足开始游戏，请前往商城充值！", () => { });
            return;
        }
        if (this.lbmgr.strip_score == 0) {
            glGame.panel.showDialog("温馨提示", "请您下注的注码！", () => {

            });
            return;
        }
        if (this.lbmgr.pour_score == 0) {
            glGame.panel.showDialog("温馨提示", "至少需要选择一条线才可开始！", () => {
                glGame.emitter.emit("lb.openselect");
            });
            return;
        }
        this.blStart = false;

        //清除上局的表现    上局中奖
        let lb_middleFrame = cc.director.getScene().getChildByName('Lb_MiddleFrame')
        if (lb_middleFrame.getChildByName('Lb_StripAction')) {
            glGame.emitter.emit("removeResultSp");
        }
        glGame.emitter.emit("lb.hideWinSp");
        this.lbmgr.repeatInit();

        this.lbmgr.setStripPour();
        this.lbmgr.reqStartLaba();
    },
    //点击自动按钮
    btnautomatic() {
        if (this.lbmgr.myCoin < this.lbmgr.pour_score) {
            glGame.panel.showMsgBox("温馨提示", "      当前游戏币不足开始游戏，请前往商城充值！", () => { });
            return;
        }
        if (this.lbmgr.strip_score == 0) {
            glGame.panel.showDialog("温馨提示", "请您下注的注码！", () => {

            });
            return;
        }
        if (this.lbmgr.pour_score == 0) {
            glGame.panel.showDialog("温馨提示", "至少需要选择一条线才可开始！", () => {
                glGame.emitter.emit("lb.openselect");
            });
            return;
        }

        if (this.blautomatic) {
            return
        }
        this.node.getChildByName("btnautomatic").active = false
        this.node.getChildByName("btncancel").active = true
        this.blautomatic = true;
        this.blStart = false;

        let lb_middleFrame = cc.director.getScene().getChildByName('Lb_MiddleFrame')
        if (lb_middleFrame.getChildByName('Lb_StripAction')) {
            glGame.emitter.emit("removeResultSp");
        }
        glGame.emitter.emit("lb.hideWinSp");
        this.lbmgr.repeatInit();

        this.lbmgr.setStripPour();
        this.lbmgr.reqStartLaba();
        this.btncancel_ani();
    },

    btncancel_ani(){
        let fadeTo1 = cc.fadeTo(1,0);
        let fadeTo2 = cc.fadeTo(1,255);
        let sequence = cc.sequence(fadeTo1,fadeTo2);
        this.pic_quxiao.runAction(cc.repeatForever(sequence))
    },
    //点击取消按钮
    btncancel() {
        this.pic_quxiao.stopAllActions();
        this.blautomatic = false;
        this.node.getChildByName("btnautomatic").active = true
        this.node.getChildByName("btncancel").active = false
    },
    //停止后开启按钮点击
    stopstrip() {
        if (!this.blautomatic) {
            this.blStart = true;
        } else {
            if (this.lbmgr.myCoin < this.lbmgr.pour_score) {
                this.blStart = true;
                this.btncancel();
                return
            }
            this.node.runAction(cc.sequence(
                cc.delayTime(1.5),
                cc.callFunc(() => {
                    let lb_middleFrame = cc.director.getScene().getChildByName('Lb_MiddleFrame')
                    if (lb_middleFrame.getChildByName('Lb_StripAction')) {
                        glGame.emitter.emit("removeResultSp");
                    }
                    glGame.emitter.emit("lb.hideWinSp");
                    this.lbmgr.repeatInit();
                    
                    this.lbmgr.setStripPour();
                    this.lbmgr.reqStartLaba();
                })
            ))
        }

    },
    //刷新积分
    refreshstrip() {
        this.lbmgr.strip_score = lbconfig.get(`v_Chips${this.index}`);
        this.lbmgr.pour_score = this.getStripCount() * this.lbmgr.strip_score;
        this.label_stripScore.string = "" + this.lbmgr.getFloat(this.lbmgr.strip_score);
        glGame.emitter.emit("lb.refreshScore");
    },
    //设置注码，刷新积分
    setScero(score) {
        let num = 0;
        if (score > 0) {
            this.index = Math.min(this.index + score, 10);
            if (this.index > 7) {
                this.index = 1
            }
            num = lbconfig.get(`v_Chips${this.index}`);
        } else {
            this.index = this.index == 1 ? this.index = 7 : Math.max(this.index + score, 1);
            num = lbconfig.get(`v_Chips${this.index}`);
        }
        console.log("这是调整下注的消息", num)
        this.lbmgr.setCoinIndex(this.index);
        this.lbmgr.strip_score = num;
        this.lbmgr.pour_score = (num * this.getStripCount());
        this.label_stripScore.string = "" + this.lbmgr.getFloat(this.lbmgr.strip_score);
        glGame.emitter.emit("lb.refreshScore");
    },
    //刷新下注分值
    refreshScore() {
        this.label_pourScore.string = "" + this.lbmgr.getFloat(this.lbmgr.pour_score);
    },
    updateUserData() {

    },
});

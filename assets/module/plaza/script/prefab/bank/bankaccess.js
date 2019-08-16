/**
 * 银行入口面板: 存入,取出共用
 */
glGame.baseclass.extend({
    properties: {
        usergold: cc.Label,         // 玩家金币
        userbankgold: cc.Label,     // 玩家金库财产
        savegold: cc.EditBox,       // 要提交的金币数额
        tip: cc.Node,
        takeout: cc.Node,
        takemoney: cc.Label,        // 取出提示文字
        statelab: cc.Label,
        statePic: cc.Node,
        confirmSp: [cc.SpriteFrame],

        pro: cc.ProgressBar,
        nlayout: cc.Node,
    },
    onLoad() {
        this.node.getComponent(cc.Widget).updateAlignment();            //挂载到父节点要立刻刷新widget
        this.adaptation();
        this.resetData();
        this.registerEvent();
        glGame.user.reqGetBankCoin();
    },

    start() {
       
    },
    //适配   980*625 left = 40  spacingX = 37.5
    adaptation() {
        let width = this.node.width;

        this.nlayout.width = 760 / 980 * width;
        this.nlayout.getComponent(cc.Widget).left = 70 / 980 * width;
        this.nlayout.getComponent(cc.Layout).spacingX = 310 / 980 * width

        this.pro.node.width = 680 / 980 * width;
        this.pro.node.getComponent(cc.Widget).left = 68 / 980 * width;
        this.pro.totalLength = 680 / 980 * width;
    },

    // 初始化界面数据
    resetData() {
        this.gold = this.getFixNumber(glGame.user.get("coin"));
        this.bankgold = this.getFixNumber(glGame.user.get("bank_coin"));
    },
    // 显示界面信息
    showPanelInfo() {
        this.usergold.string = glGame.user.GoldTemp(glGame.user.get("coin"));
        console.log('银行界面的携带金币', glGame.user.get("coin"));
        this.userbankgold.string = glGame.user.GoldTemp(glGame.user.get("bank_coin"));
        this.savegold.string = "";

        this.pro.progress = 0.01;
        this.pro.node.getChildByName("slider").getComponent(cc.Slider).progress = 0.01;
    },
    // 注册界面监听事件
    registerEvent() {
        glGame.emitter.on("updateUserData", this.updateUserData, this);
        glGame.emitter.on("updateBankCoin", this.showPanelInfo, this);
    },
    // 销毁界面监听事件
    unRegisterEvent() {
        glGame.emitter.off("updateUserData", this);
        glGame.emitter.off("updateBankCoin", this);
    },
    OnDestroy() {
        this.unRegisterEvent();
    },
    // 刷新界面数据、UI
    updateUserData() {
        this.resetData();
        this.showPanelInfo();
    },
    // 取出
    showTip() {
        this.tip.active = true;
        this.takeout.children[0].getComponent(cc.Sprite).spriteFrame = this.confirmSp[1]
        this.takemoney.string = "取出的金额"
        this.statePic.scale = -1;
        this.statelab.string = "转出";
        this.savegold.string = "";
        this.pro.progress = 0.01;
        this.pro.node.getChildByName("slider").getComponent(cc.Slider).progress = 0.01;
    },
    // 存入
    closeTip() {
        this.tip.active = false;
        this.takeout.children[0].getComponent(cc.Sprite).spriteFrame = this.confirmSp[0]
        this.takemoney.string = "存入的金额"
        this.statePic.scale = 1;
        this.statelab.string = "转入"
        this.savegold.string = "";
        this.pro.progress = 0.01;
        this.pro.node.getChildByName("slider").getComponent(cc.Slider).progress = 0.01;
    },


    /**
     * 金币检查 
     * 取款模式: 取出金额大于金库金额时返回true, 否则返回false
     * 存款模式: 存入金额大于玩家实际金额时返回true, 否则返回false
     * @return {boolean}
     */
    checkGold(gold) {
        return Number(this.savegold.string) + gold > Number((this.isDeposit() ? this.gold : this.bankgold));
    },
    // 存款模式
    isDeposit() {
        return this.get("curBankPattern") === glGame.bank.DEPOSIT;
    },
    // 取出模式
    isWithdraw() {
        return this.get("curBankPattern") === glGame.bank.WITHDRAW;
    },
    onClick(name, node) {
        switch (name) {
            case "clear": this.click_clear(); break;
            case "addmax": this.click_addmax(); break;
            case "confirm": this.click_confirm(); break;
            default: console.error("no find button name -> %s", name);
        }
    },

    onSliderProcess(node, process) {
        cc.log("银行的process", process, this.pro)
        let name = node.name;
        switch (name) {
            case "slider":
                node.parent.getComponent(cc.ProgressBar).progress = process == 0 ? 0.01 : process;
                if (this.isDeposit()) {
                    this.savegold.string = this.getFixNumber(process * glGame.user.get("coin"))
                } else {
                    this.savegold.string = this.getFixNumber(process * glGame.user.get("bank_coin"))
                }
                break;
            default: console.error("no find button name -> %s", name);
        }
    },

    click_clear() {
        this.savegold.string = 0;

        this.pro.progress = 0.01;
        this.pro.node.getChildByName("slider").getComponent(cc.Slider).progress = 0.01;
    },
    click_addmax() {
        this.savegold.string = this.isDeposit() ? this.gold : this.bankgold;
        this.pro.progress = 1;
        this.pro.node.getChildByName("slider").getComponent(cc.Slider).progress = 1;
    },

    getFixNumber(value) {
        let value1 = Number(value).div(10);
        value = Number(value).div(100);
        if (isNaN(value)) return;
        if (~~value === value) {
            return value.toString();
        } else if (~~value1 === value1) {
            return value.toFixed(1);
        } else {
            return value.toFixed(2);
        }
    },

    // 提交银行操作到服务器
    click_confirm() {
        if (!/^\d+(\.\d{0,2})?$/.test(this.savegold.string)) {
            return glGame.panel.showErrorTip(glGame.tips.BANK.NONUMBER);
        }
        let savegold = Number(this.savegold.string)
        console.log('adsasd', savegold.mul(100))
        if (savegold <= 0) return glGame.panel.showErrorTip(this.isDeposit() ? glGame.tips.BANK.SAVELITTLE : glGame.tips.BANK.TAKELITTLE);
        if (savegold > (this.isDeposit() ? this.gold : this.bankgold)) {
            return glGame.panel.showErrorTip(this.isDeposit() ? glGame.tips.BANK.SAVEMUCH : glGame.tips.BANK.TAKEMUCH);
        }
        if (this.isDeposit()) {
            glGame.user.reqBankSave(savegold.mul(100));
        } else if (this.isWithdraw()) {
            glGame.panel.showPanelByName("bankpassword").then(panel => {
                let script = panel.getComponent(panel.name);
                script.setConfirmNext((password) => {
                    glGame.user.reqBankTakeOut(savegold.mul(100), password);
                });
            });
        }
    },
    set(key, value) {
        this[key] = value;
    },
    get(key) {
        return this[key];
    }
});

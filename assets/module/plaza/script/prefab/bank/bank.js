glGame.baseclass.extend({
    properties: {
        audio:{
            type:cc.AudioClip,
            default: null
        },
        right: cc.Node,

        prefab_bankaccess: cc.Prefab,
        prefab_bankmodifypsw: cc.Prefab,
        prefab_bankRecord: cc.Prefab,
    },
    onLoad() {
        if(isiPhoneX){
            let panel = this.node.getChildByName("panel").getComponent(cc.Widget);
            panel.left += 35;
            panel.updateAlignment();
        }
        this.takeoutPanel = null;
        this.depositinPanel = null;
        this.modifypswPanel = null;
        this.bankrecordPanel = null;
        glGame.audio.closeCurEffect();
        glGame.audio.playSoundEffect(this.audio, true);
        glGame.user.reqMyInfo();
    },

    start() {
        this.click_takeout();
    },
    // 注册界面监听事件
    registerEvent() {

    },
    // 销毁界面监听事件
    unRegisterEvent() {
        
    },

    updateBankCoin() {
        this.click_takeout();
    },

    onClick(name, node) {
        switch (name) {
            case "close": this.click_close(); break;
            case "takeout": this.click_takeout(); break;
            case "depositin": this.click_depositin(); break;
            case "modifypsw": this.click_modifypsw(); break;
            case "bankrecord": this.click_bankrecord(); break;
            default: console.error("no find button name -> %s", name);
        }
    },
    click_bankrecord() {
        this.hideRightPanel();
        if (!this.bankrecordPanel) {
            this.bankrecordPanel = cc.instantiate(this.prefab_bankRecord);
            this.bankrecordPanel.parent = this.right;
        } else {
            let script = this.bankrecordPanel.getComponent(this.bankrecordPanel.name);
            script.initUI();
            this.bankrecordPanel.active = true;
        }
    },
    click_takeout() {
        this.hideRightPanel();
        if (!this.takeoutPanel) {
            this.takeoutPanel = cc.instantiate(this.prefab_bankaccess);
            this.takeoutPanel.parent = this.right;
            let script = this.takeoutPanel.getComponent(this.takeoutPanel.name);
            script.set("curBankPattern", glGame.bank.DEPOSIT);
            script.closeTip();
        } else {
            this.takeoutPanel.active = true
            let script = this.takeoutPanel.getComponent(this.takeoutPanel.name);
            script.set("curBankPattern", glGame.bank.DEPOSIT);
            script.closeTip();
        }
    },
    click_depositin() {
        this.hideRightPanel();
        if (!this.takeoutPanel) {
            this.takeoutPanel = cc.instantiate(this.prefab_bankaccess);
            this.takeoutPanel.parent = this.right;
            let script = this.takeoutPanel.getComponent(this.takeoutPanel.name);
            script.set("curBankPattern", glGame.bank.WITHDRAW);
            script.showTip();
        } else {
            this.takeoutPanel.active = true;
            let script = this.takeoutPanel.getComponent(this.takeoutPanel.name);
            script.set("curBankPattern", glGame.bank.WITHDRAW);
            script.showTip();
        }
    },
    click_modifypsw() {
        this.hideRightPanel();
        if (!this.modifypswPanel) {
            this.modifypswPanel = cc.instantiate(this.prefab_bankmodifypsw);
            this.modifypswPanel.parent = this.right;
        } else {
            this.modifypswPanel.active = true;
        }
    },

    hideRightPanel() {
        if (this.takeoutPanel) this.takeoutPanel.active = false;
        if (this.depositinPanel) this.depositinPanel.active = false;
        if (this.modifypswPanel) this.modifypswPanel.active = false;
        if (this.bankrecordPanel) this.bankrecordPanel.active = false;
    },
    click_close() {
        glGame.panel.revertOpenNodeEffect(this.node, 2).then(() => { this.remove() });
        glGame.emitter.emit("plazaOpen")
    },

    OnDestroy() {
        this.unRegisterEvent();
    },
});

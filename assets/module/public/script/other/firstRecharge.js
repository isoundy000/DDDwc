glGame.baseclass.extend({
    properties: {
        audio:{
            type:cc.AudioClip,
            default: null
        },
        lblRebate: cc.Label,
        lblCoin: cc.Label,
    },
    onLoad() {
        glGame.audio.closeCurEffect();
        glGame.audio.playSoundEffect(this.audio,true);
        let userRecharge = glGame.user.get("userRecharge");
        this.lblRebate.string = (userRecharge.discount / 100) + '%';
        this.lblCoin.string = (userRecharge.discount_max / 100);
    },

    onClick(name, node) {
        switch (name) {
            case "close_eff": this.click_close(); break;
            case "btn_querenxiugai": this.click_showShop(); break;
            default: console.error("no find button name -> %s", name);
        }
    },
    click_showShop() {
        glGame.panel.firstShowShop(this.node.zIndex);
        this.click_close();
    },
    click_close() {
        this.remove();
    },

});

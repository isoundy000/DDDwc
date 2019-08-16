glGame.baseclass.extend({
    properties: {
        audio:{
            type:cc.AudioClip,
            default: null
        },
        sendCoin:cc.Label,
        coinType:[cc.SpriteFrame],
        img_title:cc.Sprite,
        node_confirm:cc.Node,
    },
    onLoad () {
        this.node.zIndex = 1000;
        glGame.storage.removeItemByKey("showTourist");
        this.sendCoin.string = glGame.user.get('register_gold')
        let type = glGame.user.get('register_gold_type');
        this.img_title.spriteFrame = this.coinType[type==1?0:1]
        this.node_confirm.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(0.2,0.95),
            cc.delayTime(0.2),
            cc.scaleTo(0.2,1),
            cc.scaleTo(0.2,1.05),
            cc.scaleTo(0.2,1),
        )))
    },

    start(){
        if(this.isPlay){
            glGame.audio.closeCurEffect(); 
            glGame.audio.playSoundEffect(this.audio,true)
        }
    },
    onClick (name, node) {
        switch (name) {
            case "close": this.click_cancel(); break;
            case "confirm": this.click_confirm(); break;
            default: console.error("no find button name -> %s", name);
        }
    },
    click_confirm () {
        glGame.panel.showRegistration(true);
        this.remove();
    },
    click_cancel(){
        glGame.panel.showFirstEnterPanel();
        if(this.isPlay)glGame.audio.closeCurEffect();
        this.remove();
    },
    set (key, value) {
        this[key] = value;
    },
    get (key) {
        return this[key];
    },
    OnDestroy(){
        this.node_confirm.stopAllActions();
    },
});

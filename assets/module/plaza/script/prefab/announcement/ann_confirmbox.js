
glGame.baseclass.extend({

    properties: {
        tipSprite:[cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },
    onClick(name, node) {
        switch (name) {
            case "btn_queding": return this.close();
        }
    },
    close(){
        this.remove();
    }
    // update (dt) {},
});

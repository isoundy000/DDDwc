glGame.baseclass.extend({

    properties: {
        node_frame: cc.Node,
        explain_score: cc.Node
    },

    onLoad () {
        this.lbmgr = require("labalogic").getInstance();

        this.refreshNoteScore();
	},
    start () {
    },
    onClick (name, node) {
        switch(name){
            case "btnClose": return this.btnClose();
            default: console.error("no find button name -> %s", name);
        }
    },
    //关闭
    btnClose(){
        console.log("btnClose");
        let animCtrl = this.node_frame.getComponent(cc.Animation);
        animCtrl.play("lb_ended");
        animCtrl.on('stop', this.remove, this);
    },
    //刷新奖励说明对应的分值
    refreshNoteScore(){
        let show_multiple= this.lbmgr.show_multiple,
            count = show_multiple.length;
        for (let i=0;i<count;i++){
            let data = show_multiple[i];
            let explain_label = this.explain_score.getChildByName(`Note_${data.id}`);
            if (explain_label){
                let node_label = explain_label.getChildByName("label"),
                    label_score = node_label.getComponent(cc.Label);
                label_score.string = data.score;
            }
        }
    },
});

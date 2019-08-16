

glGame.baseclass.extend({

    properties: {
        node_downFrame:cc.Node,
        node_line:cc.Node,
        strip_count:9,
    },

    onLoad () {
        this.lbmgr = require("labalogic").getInstance();

        this.setStripCheck();
	},
    start () {
    },

    OnDestroy () {
    },
    onClick (name, node) {
        switch(name){
            case "btnClose": return this.btnClose();
            case "btnConfirm": return this.btnConfirm();
            default:
                if(node.parent.name.split('_')[0] == 'Strip'){
                    let strip_node = this.node_downFrame.children[Number(node.parent.name.split('_')[1]) - 1];
                    let strip_toggle = strip_node.getComponent(cc.Toggle);
                    this.node_line.children[Number(node.parent.name.split('_')[1]) - 1].active = strip_toggle.isChecked;
                }
            break;//console.error("no find button name -> %s", name);
        }
    },
    //设置当前已选择的线条
    setStripCheck(){
        let betdata = this.lbmgr.getStripBet();
        for (let key in this.node_downFrame.children){
            let strip_node = this.node_downFrame.children[key];
            let strip_toggle = strip_node.getComponent(cc.Toggle);
            this.node_line.children[key].active = betdata[Number(key)+1];
            if (betdata[Number(key)+1] != 0){
                strip_toggle.check();
            }
        }
    },
    btnClose(){
        console.log("btnClose");
        this.remove();
    },
    //点击线条相关按钮设置
    btnConfirm(){
        console.log("btnConfirm");
        let betdata = {}
        for (let key in this.node_downFrame.children){
            let strip_node = this.node_downFrame.children[key];
            let strip_toggle = strip_node.getComponent(cc.Toggle);
            if (strip_toggle.isChecked){
                betdata[Number(key)+1] = 1;
            }else{
                betdata[Number(key)+1] = 0;
            }
        }
        this.lbmgr.setStripBet(betdata);
        console.log("btnConfirm", this.lbmgr.betData);
        glGame.emitter.emit("lb.refreshstrip");
        this.remove();
    },
});

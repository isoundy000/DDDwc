glGame.baseclass.extend({
    properties: {
    },
    onLoad() {
        this.node.zIndex = 1000;
    },
    OnDestroy() {
    },

    onClick(name, node) {
        switch (name) {
            case "close": this.close(); break;
            case "confirm": this.confirm(); break;
            case "btn_remind": this.btn_remind(node); break;
            default: console.error("no find button name -> %s", name);
        }
    },

    close(){
        glGame.panel.showFirstEnterPanel();
        this.remove();
    },

    confirm(){
        cc.sys.openURL(glGame.user.get("url").repair);
        console.log("click 马上安装")
        let isShowSetupPanel = glGame.storage.getItem('isShowSetupPanel');
        isShowSetupPanel.isSetup = true;
        glGame.storage.setItem('isShowSetupPanel', isShowSetupPanel);
    },

    btn_remind(node){
        if(node.children[0].active){
            node.children[0].active = false;
        }else{
            node.children[0].active = true;
        }
        let isShowSetupPanel = glGame.storage.getItem('isShowSetupPanel');
        isShowSetupPanel.isSetup = !node.children[0].active;
        glGame.storage.setItem('isShowSetupPanel', isShowSetupPanel);
    }
});

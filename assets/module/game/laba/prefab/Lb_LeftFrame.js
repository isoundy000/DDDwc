glGame.baseclass.extend({

    properties: {
    },

    onLoad () {
	},
    start () {
    },
    onClick (name, node) {
        switch(name){
            case "btnAward": return this.btnAward();
            default: console.error("no find button name -> %s", name);
        }
    },
    //开启奖励界面
    btnAward(){
        console.log("btnAward");
        glGame.emitter.emit("lb.openawardexplain");
    },
});

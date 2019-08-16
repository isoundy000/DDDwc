
glGame.baseclass.extend({

    properties: {
        item :cc.Node,
        content:cc.Node,
    },

    onLoad () {
        this.node.zIndex = 1001;
        this.page = 1;
        this.isReceive = false;
        this.customList =[];
        this.registerEvent()
        //glGame.user.reqCustomServer(1,10,true);
        this.node.active = false;
    },

    refPayData () {
        this.node.active = true;
        glGame.user.reqCustomServer(1,10,true);
    },
    registerEvent() {
        glGame.emitter.on("updateCustomServer", this.customData, this);
    },
    unRegisterEvent() {
        glGame.emitter.off("updateCustomServer", this);
    },
 
    onClick (name, node) {
        switch (name) {
            case '':;break;
            case '':;break;
          
        }
    },

    customData(){
        this.severice = glGame.user.get("customSever").result;
        console.log('客服信息111question',this.severice)
        this.initQuestion();
    },
    initQuestion() {
        this.isReceive = true;
        this.contenHeight = 0;
        for(let i = 0 ;i <this.severice.list.length;i++){
            let cowItem = cc.instantiate(this.item);
            cowItem.active = true;
            cowItem.parent = this.content;
            cowItem.children[0].getComponent(cc.Label).string ='Q：'+ this.severice.list[i].title,
            cowItem.children[1].getComponent(cc.RichText).string = 'A：'+this.severice.list[i].content,
            this.customList.push(this.severice.list[i])
            this.contenHeight+=cowItem.height
        }
    },

    start () {

    },
    onScrollEvent(scroll,event){
        for(let i = 0 ; i< 10;i++){
            if(this.severice.list[i] == null){
                this.isReceive  = false;
            }
        }
        if(event === cc.ScrollView.EventType.SCROLL_TO_BOTTOM && this.isReceive == true ){              
            if(this.contenHeight >=400 ){
                this.page++;
                if(this.page >this.severice.total_page)return;
                this.isReceive == false;
                glGame.user.reqCustomServer(this.page,10,false)   
            }                            
        } 

     },
    set (key, value) {
        this[key] = value;
    },

    get (key) {
        return this[key];
    },
    OnDestroy(){
        this.unRegisterEvent();
    }
    // update (dt) {},
});

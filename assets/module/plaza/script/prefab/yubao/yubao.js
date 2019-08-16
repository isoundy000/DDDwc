const Status = {
    0:'审核中',
    1:'发放成功',
    2:'发放失败',
}
glGame.baseclass.extend({
    properties: {
        node_detail:cc.Node,
        lab_Info:[cc.Label],
        node_record:cc.Node,
        node_help:cc.Node,
        node_item:cc.Node,
        node_content:cc.Node,
        btn_apply:cc.Button,
        tip_lab:cc.Node,
        node_noInfo:cc.Node,
        node_audit:cc.Node,
        node_limit:cc.Node,
    },
    onLoad () {
        this.registerEvent();
        this.page = 1; //当前的页数
        this.tipTimeOut = null;
        glGame.user.reqDiscountCoinBalanceSummary();
    },

    // 注册界面监听事件
    registerEvent() {
        glGame.emitter.on("updateYuBaoServer",this.balanceSummary,this);
        glGame.emitter.on("updateYuBaoRecord",this.recordInfo,this);
        glGame.emitter.on('updateYuBaoApply',this.updateYuBaoApply,this)
    },
     // 销毁界面监听事件
    unRegisterEvent() {
        glGame.emitter.off("updateYuBaoServer",this);
        glGame.emitter.off("updateYuBaoRecord",this);
        glGame.emitter.off('updateYuBaoApply',this)
    },

    // 界面销毁
    OnDestroy() {
        this.clearTipTime();
        this.unRegisterEvent();
    },
    // start(){

    // },
    onClick (name, node) {
        if (glGame.user.isTourist()) {
            if(name == "close"||name =='btn_help'||name =='btn_closeHelp'){               
            }else{
                glGame.panel.showRegisteredGift(true);
                return;
            }
        }
        switch (name) {
            case "close": this.click_cancel(); break;
            case "confirm": this.click_confirm(); break;
            case "btn_tiqu" :this.isTourist();this.showRecord();break;
            case "btn_closeReocrd":this.closeRecord();break;
            case "btn_closeHelp":this.isShowHelp(false);break;
            case "btn_help":this.isShowHelp(true);break;
            case "btn_lingqu":this.blanceApply();break;
        }
        
        
    },
    isTourist(){
        
    },
    //余额宝概况
    balanceSummary(){
        this.yubaoOverView = glGame.user.get('yubaoOverView').result;
        console.log('余额宝概况',this.yubaoOverView)
        this.lab_Info[0].string = this.cutFloat(this.yubaoOverView.coin) ;//总金额
        this.lab_Info[1].string = this.cutFloat1000(this.yubaoOverView.profit_percent?this.yubaoOverView.profit_percent:0) +'%' ;//收益比
        this.lab_Info[2].string = this.cutFloat(this.yubaoOverView.tomorrow_profit);//明日可得收益
        this.lab_Info[3].string =this.cutFloat(this.yubaoOverView.today_profit) ;//今日收益
        this.lab_Info[4].string =this.cutFloat(this.yubaoOverView.week_profit) ;//本周收益
        this.lab_Info[5].string =this.cutFloat(this.yubaoOverView.month_profit) ;//本月收益
        this.lab_Info[6].string =this.cutFloat(this.yubaoOverView.total_profit)+'元' ;//历史总奖励
        this.lab_Info[7].string =this.cutFloat(this.yubaoOverView.can_receive_profit)+'元';//可提取奖励
        this.lab_Info[8].string =`*需金币达到${this.cutFloat(this.yubaoOverView.min_profit)}才可生产收益哦*`  ;//收益限制
        this.lab_Info[9].string = `*累积收益仅需${this.cutFloat(this.yubaoOverView.limit)}即可领取哦*`;//最低领取限额
        if(this.yubaoOverView.min_profit ==0 ||this.yubaoOverView.min_profit ==null){
            this.node_limit.active = false;
        }        
        if(this.yubaoOverView.audit == null||this.yubaoOverView.limit ==0 ||this.yubaoOverView.total_profit ==0){
            this.node_audit.active = false;
        }
        this.btn_apply.interactable = this.yubaoOverView.can_receive_profit>this.yubaoOverView.limit?true:false;
        
        if(this.yubaoOverView.mod_auto == 1){
            this.btn_apply.node.active = false;
            this.node_audit.active = false;
        }
    },
    //余额宝提取记录
    recordInfo(){
        let result =glGame.user.get('yubaoRecord').result
        this.recordList =glGame.user.get('yubaoRecord').result.list;
        this.total_page = glGame.user.get('yubaoRecord').result.total_page
        this.contenHeight = 0;
        this.isReceive = true
        this.node_noInfo.active = this.recordList.length==0;
        console.log('提取记录列表',result)
        for(let i =0;i<this.recordList.length;i++){
            let item = cc.instantiate(this.node_item);
            item.active = true;
            item.parent = this.node_content;
            item.children[0].active = i%2 == 0? true:false;
            item.children[1].getComponent(cc.Label).string = this.recordList[i].create_time;
            item.children[2].getComponent(cc.Label).string = this.cutFloat(this.recordList[i].discount_money);
            item.children[3].getComponent(cc.Label).string = Status[this.recordList[i].status];
            if(this.recordList[i].status == 0){
                item.children[3].color = cc.color(255,144,0)
            }else if(this.recordList[i].status == 1){
                item.children[3].color = cc.color(0,255,0)
            }else if(this.recordList[i].status == 2){
                item.children[3].color = cc.color(167,229,255)
            }
            this.contenHeight += item.height;
        }

    },
    //余额宝申领
    blanceApply(){
        glGame.user.reqDiscountCoinBalanceApply();
        ;
    },
    //显示提取记录列表
    showRecord(){
        glGame.user.reqDiscountCoinBalance(1,10);
        this.node_record.active = true;
    },
    //关闭提取记录列表
    closeRecord(){
        this.node_content.removeAllChildren();
        this.node_content.destroyAllChildren();
        this.node_record.active =false;
    },
    //关闭规则帮助
    isShowHelp(bool){
        this.node_help.active = bool;
    },
    //领取返回值 true为领取成功/false为领取失败
    updateYuBaoApply(){
        let isSuccess = glGame.user.get('yubaoApply').result;
        let sucInfo = glGame.user.get('yubaoApply')
        if(isSuccess){
            glGame.user.reqDiscountCoinBalanceSummary();        //刷新余额宝概况数据
            if(sucInfo.coin){
                glGame.panel.showMsgBox('提示', '恭喜您！领取成功！',()=>{})
            }else{
                this.showTip();
            }           
        }else{
            this.btn_apply.instantiate = true;
        }
    },
    click_confirm () {

    },
    click_cancel(){
        glGame.panel.revertOpenNodeEffect(this.node, 2).then(()=>{this.remove()});
        glGame.emitter.emit("plazaOpen")
    },
     //浮点型运算取俩位
    cutFloat(num) {
        return (this.getFloat(Number(num).div(100))).toString();
    },
    
    //浮点型运算取俩位
    getFloat(value, num = 2) {
        value = Number(value);
        if (isNaN(value)) return;
        if (~~value === value) {
            return value.toString();
        } else {
            return (Math.floor(value * 100) / 100).toFixed(num);
        }
    },
     //浮点型运算取3位
     cutFloat1000(num) {
        return (this.getFloat1000(Number(num).div(10))).toString();
    },
     //浮点型运算取3位
     getFloat1000(value, num = 2) {
        value = Number(value);
        value = value*365;
        if (isNaN(value)) return;
        if (~~value === value) {
            return value.toString();
        } else {
            return (Math.floor(value * 100000) / 100000).toFixed(num);
        }
    },
    set (key, value) {
        this[key] = value;
    },
    get (key) {
        return this[key];
    },
    //滚动到底部请求数据
    onScrollEvent(scroll,event){
        for(let i = 0 ; i< 10;i++){
            if(this.recordList[i] == null){
                this.isReceive  = false;
            }
        }
        if(event === cc.ScrollView.EventType.SCROLL_TO_BOTTOM && this.isReceive == true ){
            if(this.contenHeight >=630 ){
                this.page++;
                if(this.page >this.total_page)return;
                this.count = 0;
                this.isReceive == false;
                glGame.user.reqDiscountCoinBalance(this.page,10,false)
            }
        }

     },
     //显示提示
    showTip() {
        if (this.tipTimeOut) this.clearTipTime();
        this.tip_lab.active = true;
        this.tipTimeOut = setInterval(() => {
            this.tip_lab.active = false;
            this.clearTipTime();
        }, 2000);
    },
   
    //清理提示倒计时
    clearTipTime() {
        if (this.tipTimeOut) {
            clearTimeout(this.tipTimeOut);
        }
        this.tip_lab.active = false;
        this.tipTimeOut = null;
    },
});

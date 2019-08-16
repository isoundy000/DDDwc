/**
 * 客服面板, 直接webView连接到 php 指定网址, 具体功能由 php 完成
 */
let screenshot = require('ScreenShot');
glGame.baseclass.extend({
    properties: {
        audio:{
            type:cc.AudioClip,
            default: null
        },
        leftContent:cc.Node,
        node_detail:cc.Node,
        prefab_Question:cc.Prefab,
        prefab_QQ:cc.Prefab,
        prefab_weChat:cc.Prefab,
        node_QRcode:cc.Node,
        code_bg:cc.Node,
        node_webOnline:cc.Node,
        node_head:cc.Node,
        node_left:cc.Node,
        node_title:cc.Node,
        node_di:cc.Node,
        btn_onlineService:cc.Node,
    },
    onLoad() {
        
        this.registerEvent();
       
    },
    initFace(){
        if(isiPhoneX){
            let midWidgetCom = this.node_title.getComponent(cc.Widget),
            leftWidgetCom = this.node_left.getComponent(cc.Widget),
            detail = this.node_detail.getComponent(cc.Widget),
            diCom = this.node_di.getComponent(cc.Widget);
            midWidgetCom.left +=35;
            leftWidgetCom.left +=35;
            detail.left+=35;
            diCom.left+=35;
            diCom.updateAlignment();
            midWidgetCom.updateAlignment();
            leftWidgetCom.updateAlignment();
            detail.updateAlignment();
        }
        
    },
    serviceActionEnd () {
        this.initFace();
        glGame.user.reqCustomServer(1,1,true);
    },

    registerEvent() {
        glGame.emitter.on("showWechatCode", this.initCode, this);
        glGame.emitter.on("updateCustomServer", this.customServer, this);
        glGame.emitter.on("serviceActionEnd", this.serviceActionEnd, this);
    },
    unRegisterEvent() {
        glGame.emitter.off("showWechatCode", this);
        glGame.emitter.off("updateCustomServer", this);
        glGame.emitter.off("serviceActionEnd", this);
    },
    userUrlData() {
        //this.KFWebView.url = glGame.user.get("url").help;
    },
    showUI() {

        let setOne = true;
        for(let i=0 ;i<this.leftContent.childrenCount; i++){
            if(setOne){
                this.btnfirst = this.leftContent.children[i];
                setOne = false;
            }
        }
        this.btnfirst.getComponent(cc.Toggle).isChecked = true;
        this.onClick(this.btnfirst.name, this.btnfirst);
    },
    onClick(name, node) {
        switch (name) {
            case "close_eff": this.click_close(); break;
            case "question":this.click_question();break;
            case "qqService":this.click_qqService();break;
            case "weChatService":this.click_weChatService();break;
            case "onlineSevrice":this.click_onLineSevrice();break;
            case "btn_saveCode":this.saveBigQRcodeSprite();break;
            case "code_bg":this.code_bg.active = false;break;
            //default: console.error("no find button name -> %s", name);
        }
    },
    click_close() {
        glGame.panel.revertOpenNodeEffect(this.node, 2).then(()=>{this.remove()});
        glGame.emitter.emit("plazaOpen")
    },
    click_question(){
        this.showPanel('Question')
        // this.QusetionPanel = glGame.panel.showChildPanel(this.prefab_Question, this.node_detail, 1);
        // let script = panel.getComponent(this.qusetionPanel.name);
        // script.refPayData();
    },
    click_qqService(){
        this.showPanel('QQ')
        // this.qqPanel = glGame.panel.showChildPanel(this.prefab_QQ, this.node_detail, 1);
        // let script = panel.getComponent(this.qqPanel.name);
        // script.refPayData();
    },
    click_weChatService(){
        this.showPanel('weChat')
        // this.weChatPanel = glGame.panel.showChildPanel(this.prefab_weChat, this.node_detail, 1);
        // let script = panel.getComponent(this.wechatPanel.name);
        // script.refPayData();

    },
    click_onLineSevrice(){
        this.showPanel('web')
        //cc.sys.openURL(this.thirdUrl);
        // this.webPanel = cc.instantiate(this.node_webOnline);
        // node_webview.parent = this.node_detail;
        // node_webview.active = true;
        // node_webview.getComponent("cc.WebView").url = this.thirdUrl;
    },
    hideOtherPanel(){
        if(this.weChatPanel){this.weChatPanel.active = false}
        if(this.QQPanel){this.QQPanel.active = false}
        if(this.QuestionPanel){this.QuestionPanel.active = false}
        if(this.webPanel){this.webPanel.active = false}
    },
    showPanel(panelName){
        this.hideOtherPanel()
        if (this[panelName + "Panel"]) {
            this[panelName + "Panel"].active = true;
            return;
        }
        if(panelName == 'web'){
            this.webPanel = cc.instantiate(this.node_webOnline);
            this.webPanel.parent = this.node_detail;
            this.webPanel.active = true;
            this.webPanel.getComponent("cc.WebView").url = this.thirdUrl;
        }else{
            console.log('wwwwwwwwwwwwqqqqqqqq')
            
            this[panelName + "Panel"] = glGame.panel.showChildPanel(this[`prefab_${panelName}`], this.node_detail, 1);
            this[panelName + "Panel"].active = true
            let script = this[panelName + "Panel"].getComponent(this[panelName + "Panel"].name);
            script.customData();
        }
        
        // this[panelName + "Panel"] = cc.instantiate(this["prefab_" + panelName]);
        // cc.log("this[panelName+", this[panelName + "Panel"].width)
        // this[panelName + "Panel"].parent = this.mainPanel;
        // cc.log("this[panelName+////////////", this[panelName + "Panel"].width)
    },
    customServer(){
        this.showUI();
        this.severice = glGame.user.get("customSever").result;
        console.log('客服信息aaa',this.severice)
        if(this.severice.page >1) return
        if(!this.severice.server.third) return;
        this.btn_onlineService.active = true;
        this.thirdUrl = this.severice.server.third[0].url


    },
    //保持二维码
    saveBigQRcodeSprite() {
        screenshot.captureScreenshot('shareCode',this.node_QRcode);
    },


    initCode(msg){
        this.code_bg.active= true;
        this.node_head.active = true;
        console.log('dddddd',msg)
        glGame.panel.showRemoteImage(this.node_head,msg.url)
        
         
        // this.url = msg.url;
        // let url = msg.url;
        // var qrcode = new QRCode(-1, QRErrorCorrectLevel.H);
        // qrcode.addData(url);
        // qrcode.make();

        // var ctx = this.node_QRcode.getComponent(cc.Graphics);

        // // compute tileW/tileH based on node width and height
        // var tileW = this.node_QRcode.width / qrcode.getModuleCount();
        // var tileH = this.node_QRcode.height / qrcode.getModuleCount();

        // // draw in the Graphics
        // for (var row = 0; row < qrcode.getModuleCount(); row++) {
        //     for (var col = 0; col < qrcode.getModuleCount(); col++) {
        //         if (qrcode.isDark(row, col)) {
        //             ctx.fillColor = cc.Color.BLACK;
        //         } else {
        //             ctx.fillColor = cc.Color.WHITE;
        //         }
        //         var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
        //         var h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
        //         ctx.rect(Math.round(col * tileW), Math.round(row * tileH), w, h);
        //         ctx.fill();
        //     }
        // }
    },
    OnDestroy() {
        this.unRegisterEvent();
    },
});

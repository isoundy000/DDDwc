/**
 * 邮件item
 */
glGame.baseclass.extend({
    properties: {
        xuanzhongtitle: cc.Label,    // 选中邮件标题
        weisuantitle: cc.Label,    // 未选邮件标题
        yidu:cc.Node,
        weidu:cc.Node,

    },
    onLoad () {
        this.registerEvent();
    },

    showUI (emailInfo) {
        this.emailInfo = emailInfo;
        
        let titleStr = this.emailInfo["mail_title"];
        if(titleStr.length>=6){
            titleStr = titleStr.substring(0, 5);
            titleStr = titleStr+'..';
        }
        this.xuanzhongtitle.string = titleStr;
        this.weisuantitle.string = titleStr;
        // this.status.string = this.emailInfo["status"] ? "已读" : "未读";
        this.yidu.active = this.emailInfo["status"]
        this.weidu.active = !this.yidu.active;
    },
    onClick (name, node) {
        console.log("阅读邮件", this.emailId);
        glGame.user.reqMailInfo(this.emailId);
    },
   
    set (key, value) {
        this[key] = value;
    },
     // updateEmailContent 事件回调函数, 刷新邮件显示内容
     updateEmailContent (email) {
         if(email.id == this.emailId){
            if(email.status == 0){
                this.yidu.active = false;
                this.weidu.active = true;
            }else if(email.status == 1){
                this.yidu.active = true;
                this.weidu.active = false;
            }
         }
        
    },
    // 注册界面监听事件
    registerEvent() {
        glGame.emitter.on("updateEmailContent", this.updateEmailContent, this);
    },
    // 销毁界面监听事件
    unRegisterEvent() {
        glGame.emitter.off("updateEmailContent", this);
    },
    OnDestroy() {
        this.unRegisterEvent();
    },
});

const NOTICE_PUBLIC = 0     //普通跑马
const NOTICE_PLAZA = 1      //大厅跑马
const NOTICE_SPECIAL = 2    //特殊跑马

glGame.baseclass.extend({

    properties: {
        node_bottom: cc.Node,
        content: cc.Node,
        node_icon: cc.Node,
    },

    onLoad() {
        this.bactive = false;
        this.node.active = false;
        this.speed = 60;
        this.noticeType = NOTICE_PUBLIC;
        this.registerEvent();
        this.actionStart();
    },

    registerEvent() {
        glGame.emitter.on("rnotice.basestart", this.basestart, this);
        glGame.emitter.on("rnotice.specialstart", this.specialstart, this);
        glGame.emitter.on("rnotice.plazastart", this.plazastart, this);
    },
    unregisterEvent() {
        glGame.emitter.off("rnotice.basestart", this);
        glGame.emitter.off("rnotice.specialstart", this);
        glGame.emitter.off("rnotice.plazastart", this);
    },
    basestart() {
        this.actionStart();
    },
    specialstart() {
        this.actionStart();
    },
    plazastart() {
        this.actionStart();
    },

    /**
     * 设置结束的速率
     * @param speed number 长度/秒速  每秒位移像素
     */
    setSpeed(speed) {
        this.speed = speed;
    },

    /**
     * 设置跑马大小
     * @param size cc.size 长宽
     */
    setContentSize(size) {
        let new_pos = this.node.getContentSize(),
            pos_h = size.height / new_pos.height;
        this.node.setContentSize(size);
        this.node_icon.setScale(pos_h);
    },
    /**
     * 设置跑马位置
     * @param pos cc.v2 x,y
     */
    setPosition(pos) {
        this.node.setPosition(pos);
    },
    /**
     * 设置是否自动做显示隐藏
     * @param bol bool 开关
     */
    setActive(bol) {
        this.bactive = bol;
        if (!this.node.active && this.bactive) this.node.active = bol;
    },
    /**
     * 设置底图的开关
     * @param bol bool 开关
     */
    setBottom(bol) {
        this.node_bottom.active = bol;
    },

    /**
     * 获取数据层里面的数据
     */
    getContent() {
        let contentData = "",
            specialData = glGame.notice.getSpecial(),
            taskData = glGame.notice.getPlazaContent();
        this.noticeType = NOTICE_PUBLIC;
        if (specialData.content !== "") {               //特殊公告，目前没有，速率也不用设置
            this.noticeType = NOTICE_SPECIAL;
            contentData = specialData.content;
        } else if (taskData) {
            this.noticeType = NOTICE_PLAZA;
            contentData = taskData.content;
            if(taskData.speed)this.setSpeed(taskData.speed);
        } else {
            contentData = glGame.notice.getContent();
        }
        return contentData;
    },

    /**
     * 动画启动
     */
    actionStart() {
        if (this.content.getNumberOfRunningActions()) return;
        if (!this.bactive) this.node.active = true;
        this._action();
    },
    /**
     * 动画流程
     */
    _action() {
        this.content_data = this.getContent();
        if (!this.content_data) {
            if (!this.bactive) this.node.active = false
            return;
        }
        let label_content = this.content.getComponent(cc.RichText);
        label_content.string = this.content_data;
        let movex = this.node.width / 2 + this.content.width / 2 + 20;
        this.content.x = movex;
        let move_act = cc.moveTo(movex/this.speed, -movex, 0);
        let call = cc.callFunc(() => {
            if (this.noticeType === NOTICE_PUBLIC) glGame.notice.removeContent();
            else if (this.noticeType === NOTICE_PLAZA) glGame.notice.removePlazaContent();
            this._action();
        })
        this.content.runAction(cc.sequence(move_act, call))
    },

    OnDestroy() {
        this.unregisterEvent();
        glGame.notice.resetData();
    },
});
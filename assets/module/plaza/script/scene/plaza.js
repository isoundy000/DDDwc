/**
 * 三个弹出的顺序：紧急公告，游客注册，七日签到;
 */
glGame.baseclass.extend({
    properties: {
        plaza_hall: cc.Prefab,
    },
    onLoad() {
        glGame.emitter.on("updatePlazaSwitch", this.updatePlazaSwitch, this)
        glGame.panel.showPanel(this.plaza_hall);
        glGame.user.reqHomeView();
        this.showHriseRaceLamp();
        //this.entryRoom();
    },

    start() {
        glGame.panel.showJuHua();
    },
    updatePlazaSwitch() {
        this.checkShowPanel();
    },
    showHriseRaceLamp() {
        let scale = 1280 - 900;   //900为跑马长度，1280为基础设计长度。后续根据比例当前屏幕长度比例值去换算当前跑马长度
        let width = this.node.width - scale, height = 40;
        let showsize = cc.size(width, height);
        let bpersist = false;
        glGame.panel.showRollNotice(cc.v2(width / 2 + 330, this.node.height - 110), showsize, bpersist);
        glGame.notice.reqGetHorseRaceLamp();
    },

    /**
     * 第一次进入大厅，判断需要弹出哪些弹窗
     */
    checkShowPanel() {
        glGame.user.plazaShowPanel = [];
        glGame.panel.hidejuhua();
        let isShowSetupPanel = glGame.storage.getItem('isShowSetupPanel');
        // 1.每天启动第一次弹出
        // 2.安装后第一次进入弹出
        //new Date(new Date().toLocaleDateString()).getTime();
        if (cc.sys.platform == cc.sys.IPHONE) {
            let nowTime = new Date(new Date().toLocaleDateString()).getTime();
            if (!isShowSetupPanel) {
                glGame.storage.setItem('isShowSetupPanel', { isSetup: false, time: nowTime });
                glGame.user.pushPlazaShowPanel("setupRepairTool");
            } else if (!isShowSetupPanel.isSetup
                && glGame.user.get("url").repair_switch
                && glGame.user.get("url").repair_switch == 1
                && isShowSetupPanel.time < nowTime) {
                isShowSetupPanel.time = nowTime;
                glGame.storage.setItem('isShowSetupPanel', isShowSetupPanel);
                glGame.user.pushPlazaShowPanel("setupRepairTool");
            }
        }
        if (!glGame.isfirstEnterPlaza) return
        if (!glGame.panel.showSuspicious()) {
            glGame.user.pushPlazaShowPanel("urgentnotice")
        }
        if (glGame.user.isTourist() && glGame.user.get('tips') && glGame.isfirstEnterPlaza) {
            glGame.user.pushPlazaShowPanel("touristtip")
        }
        if (glGame.user.get("sign_state")) {
            glGame.user.pushPlazaShowPanel("signin")
        }
        if(glGame.user.get("loginSwitch").activity_pop_up == 2){
            glGame.user.pushPlazaShowPanel("announcement");
        }else if(glGame.user.get("loginSwitch").activity_pop_up == 3){
            let isAnnouncement = glGame.storage.getItem('isAnnouncement');
            let nowTime = new Date(new Date().toLocaleDateString()).getTime();
            if(!isAnnouncement){
                glGame.storage.setItem('isAnnouncement', { time: nowTime });
                glGame.user.pushPlazaShowPanel("announcement");
            }else if (isAnnouncement.time < nowTime) {
                isAnnouncement.time = nowTime;
                glGame.storage.setItem('isAnnouncement', isAnnouncement);
                glGame.user.pushPlazaShowPanel("announcement");
            }
        }
        glGame.panel.showFirstEnterPanel();
        glGame.isfirstEnterPlaza = false;
    },

    entryRoom() {
        switch (glGame.scene.getUpScene()) {
            case 0:
            case glGame.scenetag.LOGIN:
            case glGame.scenetag.PLAZA:
            case glGame.scenetag.LABA:
                return;
            default: break;
        }
        glGame.logon.ReqGameState(glGame.scene.getUpScene(), gameid => {
            glGame.panel.showPanelByName(`longhudouentry`).then(panel => {
                let script = panel.getComponent("hundredgameentry");
                script.setGameId(gameid);
                script.updateBgInfo();
            });
        })
    },

    OnDestroy() {
        glGame.emitter.off("updatePlazaSwitch", this)
    },
});

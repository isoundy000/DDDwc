const dzp_result = {
    1: "img_hong", 2: "img_lan", 3: "img_hong", 4: "img_lan", 5: "img_hong", 6: "img_lan", 7: "img_hong", 8: "img_lan", 9: "img_hong", 10: "img_lan",
    11: "img_lan", 12: "img_hong", 13: "img_lan", 14: "img_hong", 15: "img_lan", 16: "img_hong", 17: "img_lan", 18: "img_hong", 19: "img_hong", 20: "img_lan", 21: "img_hong",
    22: "img_lan", 23: "img_hong", 24: "img_lan", 25: "img_hong", 26: "img_lan", 27: "img_hong", 28: "img_lan", 29: "img_lan", 30: "img_hong", 31: "img_lan", 32: "img_hong",
    33: "img_lan", 34: "img_hong", 35: "img_lan", 36: "img_hong"
}
const Spritename = {
    1: ['img_hongxiaoquan', 'img_lanxiaoquan'],
    2: ['img_hongyuan', 'frame_lanyuan'],
    3: ['img_hongxiegang', 'img_lanxiegang']
}
glGame.baseclass.extend({
    properties: {
        content: cc.Node,
        node_record: cc.Node,
        node_result: cc.Node,
        sprite_Atlas: cc.SpriteAtlas,
        roomtypepic: [cc.SpriteFrame],
        bar: [cc.SpriteFrame],
        gameStatepic: [cc.SpriteFrame],
        battleWatchpic: cc.SpriteFrame,
        qhbjl_sp: [sp.SkeletonData],
        qhbjl_fnt: [cc.Font],
        hcpy_spr: [cc.SpriteFrame],
        hcpyRoomType: [cc.SpriteFrame],
        slwh_bg: [cc.SpriteFrame],
        record_bg:[cc.SpriteFrame],
    },

    onLoad() {
        this.reqEnterArea();
        this.registerEvent();
        this.roomType = 0;
        this.roomName = {
            longhudouselect: '龙虎斗',
            brnnselect: '百人牛牛',
            baijialeselect: '百家乐',
            shuiguojiselect: '水果机',
            hongheiselect: '红黑',
            luckturntableselect: '大转盘',
        };
        this.gameState = {
            baijialeselect: { 1: '等待中', 2: '下注中', 3: '结算中', },
            brnnselect: { 1: '等待中', 2: '下注中', 3: '结算中' },
            longhudouselect: { 1: '等待中', 2: '下注中', 3: '结算中', },
            hongheiselect: { 1: '等待中', 2: '下注中', 3: '结算中', },
            shuiguojiselect: { 1: '等待中', 2: '下注中', 3: '结算中', },
            luckturntableselect: { 1: '等待中', 2: '下注中', 3: '结算中', },
        };
        this.waittime = {};
        this.nodeInfo = {};
    },

    start() {

    },
    //发包
    reqEnterArea() {
        switch (this.node.name) {
            case 'longhudouselect':
                this.gameID = glGame.scenetag.LONGHUDOU;
                glGame.readyroom.reqEnterArea(glGame.scenetag.LONGHUDOU);
                break;
            case 'baijialeselect':
                this.gameID = glGame.scenetag.BAIJIALE;
                glGame.readyroom.reqEnterArea(glGame.scenetag.BAIJIALE);
                break;
            case 'hongheiselect':
                this.gameID = glGame.scenetag.HONGHEI;
                glGame.readyroom.reqEnterArea(glGame.scenetag.HONGHEI);
                break;
            case 'brnnselect':
                this.gameID = glGame.scenetag.BRNN;
                glGame.readyroom.reqEnterArea(glGame.scenetag.BRNN);
                break;
            case 'shuiguojiselect':
                this.gameID = glGame.scenetag.SHUIGUOJI;
                glGame.readyroom.reqEnterArea(glGame.scenetag.SHUIGUOJI);
                break;
            case 'luckturntableselect':
                this.gameID = glGame.scenetag.LUCKTURNTABLE;
                glGame.readyroom.reqEnterArea(glGame.scenetag.LUCKTURNTABLE);
                break;
            case 'qhbjlselect':
                this.gameID = glGame.scenetag.QHBJL;
                glGame.readyroom.reqEnterArea(glGame.scenetag.QHBJL);
                break;
            case 'hcpyselect':
                this.gameID = glGame.scenetag.HCPY;
                glGame.readyroom.reqEnterArea(glGame.scenetag.HCPY);
                break;
            case 'slwhselect':
                this.gameID = glGame.scenetag.SLWH;
                glGame.readyroom.reqEnterArea(glGame.scenetag.SLWH);
                break;
        }
    },

    onClick(name, node) {
        switch (name) {
            case 'toggle_all':
                if (this.roomType != 0) {
                    this.roomType = 0;
                    // this.reqEnterArea();
                    this.content.destroyAllChildren();
                    this.content.removeAllChildren();
                    this.updateUI();
                }
                break;
            case 'toggle_base':
                if (this.roomType != 1) {
                    this.roomType = 1;
                    // this.reqEnterArea();
                    this.content.destroyAllChildren();
                    this.content.removeAllChildren();
                    this.updateUI();
                }
                break;
            case 'toggle_elementary':
                if (this.roomType != 2) {
                    this.roomType = 2;
                    // this.reqEnterArea();
                    this.content.destroyAllChildren();
                    this.content.removeAllChildren();
                    this.updateUI();
                }
                break;
            case 'toggle_medium':
                if (this.roomType != 3) {
                    this.roomType = 3;
                    // this.reqEnterArea();
                    this.content.destroyAllChildren();
                    this.content.removeAllChildren();
                    this.updateUI();
                }
                break;
            case 'toggle_higher':
                if (this.roomType != 4) {
                    this.roomType = 4;
                    // this.reqEnterArea();
                    this.content.destroyAllChildren();
                    this.content.removeAllChildren();
                    this.updateUI();
                }
                break;
            case 'toggle_plute':
                if (this.roomType != 5) {
                    this.roomType = 5;
                    // this.reqEnterArea();
                    this.content.destroyAllChildren();
                    this.content.removeAllChildren();
                    this.updateUI();
                }
                break;
            case 'btn_enter':
            case 'btn_start':
                if (glGame.user.isTourist()) {
                    glGame.panel.showRegisteredGift(true)
                    return;
                }
                glGame.panel.showRoomJuHua();
                glGame.room.reqMyGameState(this.gameID, this.nodeInfo[node.parent.name].type, node.parent.name).then(() => {
                    glGame.readyroom.enterHundredsRoom(node.parent.name, this.nodeInfo[node.parent.name].tag);
                })
                break;
        }
    },

    //事件监听
    registerEvent() {
        glGame.emitter.on("onGameInfolist_area", this.onGameInfolist, this);
        glGame.emitter.on("onRoomInfo_area", this.onRoomInfo, this);
        glGame.emitter.on("onHandInfo_area", this.onHandInfo, this);
        glGame.emitter.on("onDeleteRoom_area", this.onDeleteRoom, this);
    },
    //事件销毁
    unregisterEvent() {
        glGame.emitter.off("onGameInfolist_area", this);
        glGame.emitter.off("onRoomInfo_area", this);
        glGame.emitter.off("onHandInfo_area", this);
        glGame.emitter.off("onDeleteRoom_area", this);
    },
    //事件回调
    //进入游戏信息回调
    onDeleteRoom(msg) {
        for (let i = 0; i < this.content.children.length; i++) {
            if (this.content.children[i].name == msg.roomid) {
                this.content.children[i].destroy();
            }
        }

    },
    onGameInfolist(msg) {
        cc.log("服务端发送数据222", msg)
        this.gameInfoTest = glGame.readyroom.get("gameInfo");
        console.log('this.gameInfoTest', this.gameInfoTest)
        if (!this.gameInfoTest) return;
        this.serverTimeOff = Date.now() - msg.servertime;
        this.updateUI();
    },
    onHandInfo(msg) {
        this.roomRecord = glGame.readyroom.roomrecord;
        console.log("奖励", this.roomRecord);
        for (let i = 0; i < this.content.children.length; i++) {
            if (this.content.children[i].name == msg.roomid) {
                this.showRecord(this.content.children[i], this.roomRecord[msg.roomid], msg.roomid);
            }
        }
    },
    onRoomInfo(msg) {
        //this.updateUI();
        console.log('r')
        this.roomList = glGame.readyroom.roomlist;
        this.serverTimeOff = Date.now() - msg.servertime;
        //if (this.gameInfo.id != msg.gameid) return
        if (this.roomType != msg.roomdata.bettype && this.roomType !== 0) return
        let count = 0;
        for (let i = 0; i < this.content.children.length; i++) {
            if (this.content.children[i].name == msg.roomdata.roomid) {
                count++;
            }
        }
        if (count == 0) {
            let infoNode = cc.instantiate(this.node_record);
            infoNode.parent = this.content;
            infoNode.active = true;
            infoNode.name = `${msg.roomdata.roomid}`;
            this.nodeInfo[infoNode.name] = {
                tag: this.roomList[msg.roomdata.bettype][msg.roomdata.roomid].roomserverid,
                type: msg.roomdata.bettype
            }
            let waitTime = Math.round((this.roomList[msg.roomdata.bettype][msg.roomdata.roomid].curwaittime - (Date.now() - this.serverTimeOff)) / 1000);
            this.waittime[msg.roomdata.roomid] = {};
            this.waittime[msg.roomdata.roomid].cutdown = waitTime;
            this.waittime[msg.roomdata.roomid].totaltime = waitTime;
            infoNode.getChildByName('onlineNum').getComponent(cc.Label).string = this.roomList[msg.roomdata.bettype][msg.roomdata.roomid].online;
            infoNode.getChildByName('roomId').getComponent(cc.Label).string = msg.roomdata.roomid;
            if (msg.roomdata.gameid == glGame.scenetag.QHBJL) {
                let spine = infoNode.getChildByName('sp_bg');
                spine.getComponent(sp.Skeleton).skeletonData = this.qhbjl_sp[msg.roomdata.bettype];
                spine.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
                infoNode.getChildByName("type").getComponent(cc.Sprite).spriteFrame = this.roomtypepic[msg.roomdata.bettype];
                infoNode.getChildByName('roomId').getComponent(cc.Label).font = this.qhbjl_fnt[msg.roomdata.bettype];
                infoNode.getChildByName('roomId').children[0].getComponent(cc.Label).font = this.qhbjl_fnt[msg.roomdata.bettype];
                infoNode.getChildByName('chip').getChildByName('num').getComponent(cc.Label).string = this.getFloat(msg.roomdata.limit);
                if (this.gameInfoTest[msg.roomdata.bettype].EntranceRestrictions > glGame.user.get("coin")) {
                    infoNode.getChildByName("btn_enter").children[1].active =false;
                    infoNode.getChildByName("btn_enter").children[0].getComponent(cc.Sprite).spriteFrame = this.battleWatchpic;
                }
                infoNode.getChildByName('chiplimit').getChildByName('num').getComponent(cc.Label).string = this.getFloat(this.gameInfoTest[msg.roomdata.bettype].EntranceRestrictions);
            } else if (msg.roomdata.gameid == glGame.scenetag.HCPY) {
                infoNode.getChildByName("type").getComponent(cc.Sprite).spriteFrame = this.roomtypepic[msg.roomdata.bettype];
                infoNode.getChildByName('roomId').getComponent(cc.Label).string = '房间号' + msg.roomdata.roomid;
                infoNode.getChildByName('chiplimit').getComponent(cc.Label).string = this.getFloat(this.gameInfoTest[msg.roomdata.bettype].EntranceRestrictions);
            } else {
                if(msg.roomdata.gameid == glGame.scenetag.SLWH){
                    infoNode.getChildByName("bg").getComponent(cc.Sprite).spriteFrame = this.slwh_bg[msg.roomdata.bettype];
                }
                infoNode.getChildByName('roomId').getChildByName("type").getComponent(cc.Sprite).spriteFrame = this.roomtypepic[msg.roomdata.bettype]
                this.roomRecord = glGame.readyroom.roomrecord;
                this.showRecord(infoNode, this.roomRecord[msg.roomdata.roomid], msg.roomdata.roomid);
            }
        }
        for (let i = 0; i < this.content.children.length; i++) {
            if (this.content.children[i].name == msg.roomdata.roomid) {
                let waitTime = Math.round((msg.roomdata.curwaittime - (Date.now() - this.serverTimeOff)) / 1000);
                this.waittime[this.content.children[i].name].cutdown = waitTime;
                this.waittime[this.content.children[i].name].totaltime = waitTime;
                this.content.children[i].getChildByName('onlineNum').getComponent(cc.Label).string = msg.roomdata.online;
                if (msg.roomdata.gameid != glGame.scenetag.QHBJL && msg.roomdata.gameid != glGame.scenetag.HCPY) {
                    this.content.children[i].getChildByName("gamestate").getComponent(cc.Sprite).spriteFrame = this.gameStatepic[msg.roomdata.process]
                    if (this.node.name == "baijialeselect" || this.node.name == "longhudouselect") {
                        this.content.children[i].getChildByName("xipai").active = msg.roomdata.process == 4
                    }
                }
            }
        }
        if (msg.roomdata.gameid != glGame.scenetag.QHBJL || msg.roomdata.gameid != glGame.scenetag.HCPY) {
            this.cleanTimer();
            this.showClock();
        }
    },
    //更新UI
    updateUI() {
        this.roomList = []
        if (this.roomType == 0) {
            let roomlist = glGame.readyroom.roomlist
            for (let i in roomlist) {
                for (let j in roomlist[i]) {
                    this.roomList.push(roomlist[i][j])
                }
            }
        } else {
            for (let key in glGame.readyroom.roomlist[this.roomType]) {
                this.roomList.push(glGame.readyroom.roomlist[this.roomType][key])
            }
        }
        this.roomList.sort((a, b) => {
            return a.bettype - b.bettype;
        });
        this.roomRecord = glGame.readyroom.roomrecord;
        if (!this.roomList) {
            return;
        }
        this.cleanTimer();
        for (let roomid in this.roomList) {
            if (!this.roomList[roomid]) continue;
            for (let i = 0; i < this.content.childrenCount; i++) {
                if (this.content.children[i].name == this.roomList[roomid].roomid) {
                    return;
                }
            }
            let infoNode = cc.instantiate(this.node_record);
            infoNode.parent = this.content;
            infoNode.active = true;
            infoNode.name = `${this.roomList[roomid].roomid}`;
            console.log('infoNode.name',infoNode.name,this.roomList[roomid],this.roomList)
            this.nodeInfo[infoNode.name] = {
                tag: this.roomList[roomid].roomserverid,
                type: this.roomList[roomid].bettype
            }
            if (this.roomList[roomid].gameid == glGame.scenetag.QHBJL) {
                let spine = infoNode.getChildByName('sp_bg');
                spine.getComponent(sp.Skeleton).skeletonData = this.qhbjl_sp[this.roomList[roomid].bettype];
                spine.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
                infoNode.getChildByName('roomId').getComponent(cc.Label).string = this.roomList[roomid].roomid;
                infoNode.getChildByName('roomId').getComponent(cc.Label).font = this.qhbjl_fnt[this.roomList[roomid].bettype];
                infoNode.getChildByName('roomId').children[0].getComponent(cc.Label).font = this.qhbjl_fnt[this.roomList[roomid].bettype];
                infoNode.getChildByName("type").getComponent(cc.Sprite).spriteFrame = this.roomtypepic[this.roomList[roomid].bettype]
                infoNode.getChildByName('chip').getChildByName('num').getComponent(cc.Label).string = this.getFloat(this.gameInfoTest[this.roomList[roomid].bettype].BaseChips);
                infoNode.getChildByName('chiplimit').getChildByName('num').getComponent(cc.Label).string = this.getFloat(this.gameInfoTest[this.roomList[roomid].bettype].EntranceRestrictions);
                infoNode.getChildByName('onlineNum').getComponent(cc.Label).string = this.roomList[roomid].online;
                if (this.gameInfoTest[this.roomList[roomid].bettype].EntranceRestrictions > glGame.user.get("coin")) {
                    infoNode.getChildByName("btn_enter").children[1].active =false;
                    infoNode.getChildByName("btn_enter").children[0].getComponent(cc.Sprite).spriteFrame = this.battleWatchpic;
                }
            } else if (this.roomList[roomid].gameid == glGame.scenetag.HCPY) {
                infoNode.getChildByName('roomId').getComponent(cc.Label).string = '房间号' + this.roomList[roomid].roomid;
                infoNode.getChildByName('onlineNum').getComponent(cc.Label).string = this.roomList[roomid].online;
                infoNode.getChildByName("type").getComponent(cc.Sprite).spriteFrame = this.hcpyRoomType[this.roomList[roomid].bettype]
                infoNode.getComponent(cc.Sprite).spriteFrame = this.hcpy_spr[this.roomList[roomid].bettype]
                let minbet = glGame.user.EnterRoomGoldTemp(this.gameInfoTest[this.roomList[roomid].bettype].Chips[0]),
                maxbet = glGame.user.EnterRoomGoldTemp(this.gameInfoTest[this.roomList[roomid].bettype].MaxBet);
                infoNode.getChildByName('chiplimit').getComponent(cc.Label).string = minbet + "-" + maxbet;
                if (this.gameInfoTest[this.roomList[roomid].bettype].EntranceRestrictions <= glGame.user.get("coin")) {
                    infoNode.getChildByName("flash").active = true
                } else {
                    infoNode.getChildByName("flash").active = false;
                    infoNode.getChildByName("btn_enter").getComponent(cc.Sprite).spriteFrame = this.battleWatchpic;
                }
            } else {
                infoNode.getChildByName('roomId').getComponent(cc.Label).string = this.roomList[roomid].roomid;
                infoNode.getChildByName('roomId').getChildByName("type").getComponent(cc.Sprite).spriteFrame = this.roomtypepic[this.roomList[roomid].bettype]
                infoNode.getChildByName('onlineNum').getComponent(cc.Label).string = this.roomList[roomid].online;
                let minbet = glGame.user.EnterRoomGoldTemp(this.gameInfoTest[this.roomList[roomid].bettype].Chips[0]),
                    maxbet = glGame.user.EnterRoomGoldTemp(this.gameInfoTest[this.roomList[roomid].bettype].MaxBet);
                console.log("入口数据调整", this.gameInfoTest[this.roomList[roomid].bettype].Chips[0], minbet / 100, this.gameInfoTest[this.roomList[roomid].bettype].MaxBet / 100, maxbet)
                infoNode.getChildByName('chiplimit').getComponent(cc.Label).string = minbet + "-" + maxbet;
                infoNode.getChildByName("gamestate").getComponent(cc.Sprite).spriteFrame = this.gameStatepic[this.roomList[roomid].process];
                if(this.roomList[roomid].gameid == glGame.scenetag.SLWH){
                    infoNode.getChildByName('chiplimit').getComponent(cc.Label).string = this.gameInfoTest[this.roomList[roomid].bettype].RabbitQuota * minbet;
                    infoNode.getChildByName('bg').getComponent(cc.Sprite).spriteFrame = this.record_bg[this.roomList[roomid].bettype];
                }
                if (this.node.name == "baijialeselect" || this.node.name == "longhudouselect") {
                    infoNode.getChildByName("xipai").active = this.roomList[roomid].process == 4
                }
                if (this.gameInfoTest[this.roomList[roomid].bettype].EntranceRestrictions <= glGame.user.get("coin")) {
                    infoNode.getChildByName("flash").active = true
                } else {
                    infoNode.getChildByName("btn_enter").children[0].active = false;
                    infoNode.getChildByName("btn_enter").getComponent(cc.Sprite).spriteFrame = this.battleWatchpic;
                }
            }
            let waitTime = Math.round((this.roomList[roomid].curwaittime - (Date.now() - this.serverTimeOff)) / 1000);
            if (waitTime < 0) {
                waitTime = 0;
            }
            this.waittime[this.roomList[roomid].roomid] = {};
            this.waittime[this.roomList[roomid].roomid].cutdown = waitTime;
            this.waittime[this.roomList[roomid].roomid].totaltime = waitTime;
            if (this.roomList[roomid].gameid == glGame.scenetag.QHBJL) continue;
            this.showRecord(infoNode, this.roomRecord[this.roomList[roomid].roomid], this.roomList[roomid].roomid);
        }
        this.showClock();


    },
    //桌面数据的显示
    getFloat(value) {
        return (Number(value).div(100)).toString();
    },
    //显示倒计时
    showClock() {
        this.setTimeOut = setInterval(() => {
            if (this.content.children) {
                for (let i = 0; i < this.content.children.length; i++) {
                    this.waittime[this.content.children[i].name].cutdown -= 0.01;
                    if (this.waittime[this.content.children[i].name].cutdown < 0) {
                        this.waittime[this.content.children[i].name].cutdown = 0;
                    }
                    let residueTime = this.waittime[this.content.children[i].name].cutdown / this.waittime[this.content.children[i].name].totaltime;
                    // Frame =  this.content.children[i].getChildByName('ProgressBar').getChildByName("bar").getComponent(cc.Sprite);
                    // Frame.spriteFrame = residueTime<=0.2?this.bar[1]:this.bar[0];
                    this.content.children[i].getChildByName('bar').getComponent(cc.Sprite).spriteFrame = residueTime <= 0.2 ? this.bar[1] : this.bar[0];
                    if (Number(580).mul(residueTime) == 0) {
                        this.content.children[i].getChildByName('bar').width = 0.01;
                    } else {
                        this.content.children[i].getChildByName('bar').width = Number(580).mul(residueTime);
                    }
                    //this.content.children[i].getChildByName('ProgressBar').getComponent(cc.ProgressBar).progress = residueTime;
                }
            }
        }, 10)
    },
    //显示总局数以及红 、蓝的出现局数
    showRound(node, record) {
        let long = 0,
            hu = 0,
            he = 0,
            round = 0;
        for (let i = 0; i < record.length; i++) {
            if (record[i].result == 1) {
                long += record[i].count
                round += record[i].count
            } else if (record[i].result == 2) {
                hu += record[i].count
                round += record[i].count
            }
            if (record[i].he) {
                for (let k = 0; k < record[i].he.length; k++) {
                    he += record[i].he[k].num;
                    round += record[i].he[k].num;
                }
            }
        }
        node.getChildByName('jushu').getChildByName("count").getComponent(cc.Label).string = round < 10 && round > 0 ? '0' + round : round;
        node.getChildByName('hong').getChildByName("count").getComponent(cc.Label).string = long < 10 && long > 0 ? '0' + long : long;
        node.getChildByName('lan').getChildByName("count").getComponent(cc.Label).string = hu < 10 && hu > 0 ? '0' + hu : hu;
        node.getChildByName('lv').getChildByName("count").getComponent(cc.Label).string = he < 10 && he > 0 ? '0' + he : he;
    },
    showRecord(node, record, roomid) {
        if (!record) {
            return
        }
        let index = 0;
        let dotNode;
        let row = 0,
            col = 0;
        switch (this.node.name) {
            case 'longhudouselect':
            case 'baijialeselect':
            case 'hongheiselect':
                this.showRound(node, record);  //局数记录
                node.getChildByName('node_dot').destroyAllChildren();
                node.getChildByName('node_dot').removeAllChildren();
                this.beadplateTrend(node, record, roomid); // 珠盘路
                let parameter = {},
                    startpos = {
                        1: [-73, 10],
                        2: [110, 10],
                        3: [-73, -28],
                    };
                for (let i = 1; i < 4; i++) {
                    parameter[i] = {
                        row: 0,
                        col: -1,
                        recordArr: [],
                        record: 0,
                        isChangeRow: false,
                    }
                }
                //以上是大眼路、小眼路、小强路的参数
                index = 0;
                row = 0;
                col = 0;
                let recordArr = [];
                index = this.getIndex(record);
                for (let i = index; i < record.length; i++) {
                    let isChangeRow = false;
                    for (let j = 0; j < record[i].count; j++) {
                        let labelColor = null;
                        dotNode = cc.instantiate(this.node_result);
                        if (record[i].result == 1) {
                            labelColor = cc.Color.RED;
                            dotNode.getComponent(cc.Sprite).spriteFrame = this.sprite_Atlas._spriteFrames['img_hongxiaoquan'];
                        } else if (record[i].result == 2) {
                            labelColor = cc.color(0, 238, 238);
                            dotNode.getComponent(cc.Sprite).spriteFrame = this.sprite_Atlas._spriteFrames['img_lanxiaoquan'];
                        }
                        if (record[i].he) {
                            for (let k = 0; k < record[i].he.length; k++) {
                                if (record[i].he[k].index - 1 == j) {
                                    dotNode.children[0].active = true;
                                    dotNode.children[0].getComponent(cc.Label).string = record[i].he[k].num;
                                    dotNode.children[0].color = labelColor;
                                }
                            }
                        }
                        dotNode.parent = node.getChildByName('node_dot');
                        let newCol = col;
                        let newRow = row;
                        while (newRow > 5) {
                            newRow--;
                            newCol++;
                        }
                        for (let k = 0; k < recordArr.length; k++) {
                            if (newRow == recordArr[k][0] && newCol == recordArr[k][1]) {
                                isChangeRow = true;
                            }
                        }
                        if (isChangeRow) {
                            newRow--;
                        }
                        dotNode.setPosition(cc.v2(-69 + newCol * 15.3, 85 - newRow * 13));
                        recordArr.push([newRow, newCol]);
                        dotNode.active = true;
                        row++;
                        //其他三路的显示
                        for (let i = 1; i < 4; i++) {
                            let result = this.getresult(i, recordArr);
                            if (parameter[i].recordArr.length != 0 && parameter[i].record != result) {
                                parameter[i].row = 0;
                                parameter[i].isChangeRow = false
                                for (let j = parameter[i].recordArr.length - 1; j >= 0; j--) {
                                    if (parameter[i].recordArr[j][0] == 0) {
                                        parameter[i].col = parameter[i].recordArr[j][1] + 1;
                                        break;
                                    }
                                }
                            }
                            parameter[i].record = result;
                            let DANode = new cc.Node();
                            if (result == 1) {
                                DANode.addComponent(cc.Sprite).spriteFrame = this.sprite_Atlas._spriteFrames[Spritename[i][0]];
                            } else if (result == 2) {
                                DANode.addComponent(cc.Sprite).spriteFrame = this.sprite_Atlas._spriteFrames[Spritename[i][1]];
                            }
                            DANode.parent = node.getChildByName('node_dot');
                            DANode.width = 5;
                            DANode.height = 5;
                            DANode.name = `${i}`
                            while (parameter[i].row > 5) {
                                parameter[i].row--;
                                parameter[i].col++;
                            }
                            for (let k = 0; k < parameter[i].recordArr.length; k++) {
                                if (parameter[i].row == parameter[i].recordArr[k][0] && parameter[i].col == parameter[i].recordArr[k][1]) {
                                    parameter[i].row--;
                                    parameter[i].col++;
                                    parameter[i].isChangeRow = true;
                                    break;
                                }
                            }
                            if (parameter[i].isChangeRow) {
                                parameter[i].row--;
                                parameter[i].col++;
                            }
                            DANode.setPosition(cc.v2(startpos[i][0] + parameter[i].col * 7.7, startpos[i][1] - parameter[i].row * 6.6));
                            parameter[i].recordArr.push([parameter[i].row, parameter[i].col]);
                            parameter[i].row++
                        }
                    }
                    col++;
                    row = 0;
                }
                this.cleanNode(node, parameter);
                this.forecastResult(record, recordArr, node);
                break;
            case 'brnnselect':
                node.getChildByName('node_dot').destroyAllChildren();
                if (record.length > 20) {
                    index = record.length - 20;
                    node.getChildByName('node_bottom').getChildByName('round').getComponent(cc.Label).string = '近20局';
                } else {
                    node.getChildByName('node_bottom').getChildByName('round').getComponent(cc.Label).string = `近${record.length}局`;
                }
                let resultNumArr = [0, 0, 0, 0];
                for (let i = index; i < record.length; i++) {
                    for (let j in record[i]) {
                        if (j == 0) {
                            continue;
                        }
                        dotNode = cc.instantiate(this.node_result);
                        if (record[i][j] == 0) {
                            dotNode.getComponent(cc.Sprite).spriteFrame = this.sprite_Atlas._spriteFrames['img_x'];
                        } else {
                            dotNode.getComponent(cc.Sprite).spriteFrame = this.sprite_Atlas._spriteFrames['img_gou'];
                            resultNumArr[j - 1] += 1;
                        }
                        dotNode.parent = node.getChildByName('node_dot');
                        dotNode.setScale(0.6);
                        dotNode.setPosition(cc.v2(-239.5 + (i - index) * 27, 60 - (Number(j) - 1) * 31.2));
                        dotNode.active = true;
                    }
                }
                console.log("这是当前百人牛牛的记录条数", record.length)
                node.getChildByName("frame_new").active = record.length != 0;
                node.getChildByName("frame_new").x = record.length > 20 ? -239.5 + 19 * 27 : -239.5 + (record.length - 1) * 27
                node.getChildByName('node_bottom').getChildByName('tian').children[0].getComponent(cc.Label).string = resultNumArr[0] > 0 && resultNumArr[0] < 10 ? '0' + resultNumArr[0] : resultNumArr[0];
                node.getChildByName('node_bottom').getChildByName('di').children[0].getComponent(cc.Label).string = resultNumArr[1] > 0 && resultNumArr[1] < 10 ? '0' + resultNumArr[1] : resultNumArr[1];
                node.getChildByName('node_bottom').getChildByName('xuan').children[0].getComponent(cc.Label).string = resultNumArr[2] > 0 && resultNumArr[2] < 10 ? '0' + resultNumArr[2] : resultNumArr[2];
                node.getChildByName('node_bottom').getChildByName('huang').children[0].getComponent(cc.Label).string = resultNumArr[3] > 0 && resultNumArr[3] < 10 ? '0' + resultNumArr[3] : resultNumArr[3];
                break;
            case 'shuiguojiselect':
                node.getChildByName('node_dot').destroyAllChildren();
                node.getChildByName('node_dot').removeAllChildren();
                if (record.length > 16) {
                    index = record.length - 16;
                }
                for (let i = index; i < record.length; i++) {
                    dotNode = cc.instantiate(this.node_result);
                    dotNode.active = true;
                    if (record[i].rewardType != 11) {
                        dotNode.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_Atlas._spriteFrames['special_' + record[i].rewardType];
                        dotNode.children[0].y -= 9;
                        if (record[i].rewardType != 4 && record[i].rewardType != 5) {
                            dotNode.children[0].setScale(1.5)
                        }
                        dotNode.children[1].getChildByName("cheng").active = false;
                    } else {
                        dotNode.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_Atlas._spriteFrames['common_' + record[i].rewardArr[0].fruitType];
                        dotNode.children[0].setScale(0.7)
                        this.setmultiple(dotNode, record[i].rewardArr[0].priceMultiple)
                    }
                    dotNode.parent = node.getChildByName('node_dot');
                    if (i == record.length - 1) {
                        dotNode.getChildByName("new").active = true;
                    }
                }
                break;
            case 'luckturntableselect':
                node.getChildByName('node_dot').destroyAllChildren();
                let change = [0, 0, 0, 0, 0];
                if (record.length > 64) {
                    index = record.length - 64;
                }
                for (let i = index; i < record.length; i++) {
                    if (col > 15) {
                        col = 0;
                        row++;
                    }
                    dotNode = cc.instantiate(this.node_result);
                    if (record[i] == 0) {
                        dotNode.getComponent(cc.Sprite).spriteFrame = this.roomtypepic[0];
                        dotNode.color = cc.color(63, 181, 33);
                        change[4]++
                    } else {
                        dotNode.getComponent(cc.Sprite).spriteFrame = this.sprite_Atlas._spriteFrames[dzp_result[record[i]]];
                        record[i] % 2 == 1 ? change[0]++ : change[1]++
                        dzp_result[record[i]] == "img_hong" ? change[2]++ : change[3]++;
                    }
                    this.setmultiple(dotNode, record[i])
                    dotNode.parent = node.getChildByName('node_dot');
                    let parscale = dotNode.getChildByName("multiple");
                    for (let i = 0; i < parscale.children.length; i++) {
                        parscale.children[i].setScale(1.4);
                    }
                    dotNode.setPosition(cc.v2(-274.9 + col * 31.2, 34.5 - row * 31));
                    dotNode.active = true;
                    col++;
                }
                for (let i = 0; i < 5; i++) {
                    let change_string = record.length > 64 ? change[i] / 64 : change[i] / record.length
                    node.getChildByName("change").children[i].getComponent(cc.Label).string = `${Math.floor(change_string * 100)}%`
                }
                break;
        }
    },
    //这是珠盘路的显示
    beadplateTrend(node, record, roomid) {
        let Round = [],
            index = 0,
            dotNode,
            row = 0,
            col = 0;
        for (let i = 0; i < record.length; i++) {
            for (let j = 0; j < record[i].count; j++) {
                Round.push(record[i].result)
                if (record[i].he) {
                    for (let k = 0; k < record[i].he.length; k++) {
                        if (record[i].he[k].index - 1 == j) {
                            for (let z = 0; z < record[i].he[k].num; z++) {
                                Round.push(3);
                            }
                        }
                    }
                }
            }

        }
        index = Round.length % 6;
        index = index == 0 ? 6 : index;
        index = Round.length > 48 ? Round.length - 42 - index : 0;
        if (this.node.name == "baijialeselect") {
            let doublerecord = glGame.readyroom.doublerecord[roomid]
            for (let i = index; i < Round.length; i++) {
                while (row > 5) {
                    row = 0;
                    col++;
                }
                dotNode = cc.instantiate(this.node_result);
                if (Round[i] == 1) {
                    dotNode.getComponent(cc.Sprite).spriteFrame = this.sprite_Atlas._spriteFrames['img_hong'];
                } else if (Round[i] == 2) {
                    dotNode.getComponent(cc.Sprite).spriteFrame = this.sprite_Atlas._spriteFrames['img_xian'];
                } else if (Round[i] == 3) {
                    dotNode.getComponent(cc.Sprite).spriteFrame = this.sprite_Atlas._spriteFrames['img_he'];
                }
                if (doublerecord[i] == 1) {
                    dotNode.children[1].active = true;
                } else if (doublerecord[i] == 2) {
                    dotNode.children[2].active = true;
                } else if (doublerecord[i] == 3) {
                    dotNode.children[1].active = true;
                    dotNode.children[2].active = true;
                }
                dotNode.parent = node.getChildByName('node_dot');
                dotNode.width = 22;
                dotNode.height = 22;
                dotNode.name = "0"
                dotNode.setPosition(cc.v2(-278 + col * 27, 79.6 - row * 26.5));
                dotNode.active = true;
                row++
            }
            return;
        }
        for (let i = index; i < Round.length; i++) {
            while (row > 5) {
                row = 0;
                col++;
            }
            dotNode = new cc.Node();
            if (Round[i] == 1) {
                dotNode.addComponent(cc.Sprite).spriteFrame = this.sprite_Atlas._spriteFrames['img_hong'];
            } else if (Round[i] == 2) {
                dotNode.addComponent(cc.Sprite).spriteFrame = this.sprite_Atlas._spriteFrames['img_xian'];
            } else if (Round[i] == 3) {
                dotNode.addComponent(cc.Sprite).spriteFrame = this.sprite_Atlas._spriteFrames['img_he'];
            }
            dotNode.parent = node.getChildByName('node_dot');
            dotNode.width = 22;
            dotNode.height = 22;
            dotNode.name = "0"
            dotNode.setPosition(cc.v2(-278 + col * 27, 79.6 - row * 26.5));
            dotNode.active = true;
            row++
        }
    },
    //根据倍数用plist图集拼接数字
    setmultiple(node, multiple) {
        let stringCount = multiple.toString();
        let count = stringCount.length;
        for (let i = 0; i < count; i++) {
            let newNode = new cc.Node();
            newNode.addComponent(cc.Sprite).spriteFrame = this.sprite_Atlas.getSpriteFrame("img_" + stringCount[i]);
            newNode.parent = node.getChildByName("multiple");
        }
    },
    getIndex(record) {
        let index = 0;
        if (record.length > 24) {
            index = record.length - 24;
        }
        for (let j = index; j < record.length; j++) {
            if (j - index + record[j].count >= 29) {
                index += j - index + record[j].count - 29;
            }
        }
        return index;
    },
    //通过1、2、3、获得当前大眼路、小眼路、小强路的结果
    getresult(index, recordArr) {
        let result = 0,
            ColCountone = 0,
            ColCounttwo = 0,
            resultCfg = {
                1: { starpos: [1, 2], ContrastCol: [2, 1] },
                2: { starpos: [2, 3], ContrastCol: [3, 2] },
                3: { starpos: [3, 4], ContrastCol: [4, 3] },
            };
        for (let k = 0; k < recordArr.length; k++) {
            if ((recordArr[k][0] == 1 && recordArr[k][1] == resultCfg[index].starpos[0]) || (recordArr[k][0] == 0 && recordArr[k][1] == resultCfg[index].starpos[1])) {
                if (recordArr[recordArr.length - 1][0] == 0) {
                    for (let i = 0; i < recordArr.length; i++) {
                        if (recordArr[i][1] == recordArr[recordArr.length - 1][1] - resultCfg[index].ContrastCol[0]) {
                            ColCountone++;
                        } else if (recordArr[i][1] == recordArr[recordArr.length - 1][1] - 1) {
                            ColCounttwo++
                        }
                    }
                    result = ColCountone == ColCounttwo ? 1 : 2;
                    return result
                } else {
                    for (let i = 0; i < recordArr.length; i++) {
                        if (recordArr[i][1] == recordArr[recordArr.length - 1][1] - resultCfg[index].ContrastCol[1]) {
                            ColCountone++;
                        } else if (recordArr[i][1] == recordArr[recordArr.length - 1][1]) {
                            ColCounttwo++;
                        }
                    }
                    result = ColCounttwo - ColCountone == 1 ? 2 : 1;
                    return result;
                }
            }
        }
        return result;
    },
    //预测结果
    forecastResult(record, recordArr, node) {
        let indexname = {
            1: "hongse",
            2: "lanse"
        };
        for (let result = 1; result < 3; result++) {
            if (result == 2) {
                recordArr.pop();
            }
            if (!recordArr[recordArr.length - 1]) {
                return;
            }
            let row = result == record[record.length - 1].result ? recordArr[recordArr.length - 1][0] + 1 : 0,
                col = result == record[record.length - 1].result ? recordArr[recordArr.length - 1][1] : recordArr[recordArr.length - 1][1] + 1;
            recordArr.push([row, col]);
            for (let i = 1; i < 4; i++) {
                let smallresult = this.getresult(i, recordArr);
                if (smallresult != 0) {
                    node.getChildByName(indexname[result]).children[i - 1].getComponent(cc.Sprite).spriteFrame =
                        smallresult == 1 ? this.sprite_Atlas._spriteFrames[Spritename[i][0]] : this.sprite_Atlas._spriteFrames[Spritename[i][1]];
                } else {
                    node.getChildByName(indexname[result]).children[i - 1].getComponent(cc.Sprite).spriteFrame = null
                }
            }
        }
    },
    //清理多余节点
    cleanNode(node, parameter) {
        let allchildern = node.getChildByName('node_dot').children;
        for (let i = 1; i < 4; i++) {
            if (parameter[i].col > 23) {
                for (let j = 0; j < allchildern.length; j++) {
                    if (allchildern[j].name == i) {
                        let distance = (parameter[i].col - 23) * 7.7
                        allchildern[j].x -= distance;
                    }
                }
            }
        }
        for (let i = allchildern.length - 1; i >= 0; i--) {
            if (allchildern[i].name == "2" && allchildern[i].x < 110) {
                allchildern[i].destroy()
            } else if (allchildern[i].x < -73 && allchildern[i].name != "0") {
                allchildern[i].destroy()
            }
        }
    },
    //清理倒计时
    cleanTimer() {
        if (this.setTimeOut != null) {
            clearTimeout(this.setTimeOut);
        }
        this.setTimeOut = null;
    },
    set(key, value) {
        this[key] = value;
    },
    OnDestroy() {
        this.cleanTimer();
        this.unregisterEvent();
    },
});


glGame.baseclass.extend({
    properties: {
        content: cc.Node,
        node_record: cc.Node,
        node_redDot: cc.Node,
        node_blueDot: cc.Node,
    },

    onLoad() {
        glGame.readyroom.reqEnterArea(glGame.scenetag.BRNN);
        this.registerEvent();
        this.roomType = 1;
        this.roomName = {
            longhudouselect:'龙虎斗',
            brnnselect:'百人牛牛',
            baijialeselect:'百家乐',
            shuiguojiselect:'水果机',
            hongheiselect:'红黑',
            luckturntableselect:'大转盘',
        };
        this.gameState = {
            baijialeselect: { 1: '等待中', 2: '下注中', 3: '开牌中', },
            brnnselect: { 1: '下注中', 2: '结算中' ,3: '流程3',},
            longhudouselect: { 1: '流程1', 2: '流程2', 3: '流程3', },
            hongheiselect: { 1: '流程1', 2: '流程2', 3: '流程3', },
            shuiguojiselect: { 1: '流程1', 2: '流程2', 3: '流程3', },
            luckturntableselect: { 1: '流程1', 2: '流程2', 3: '流程3', },
        }
    },
    //事件监听
    registerEvent() {
        glGame.emitter.on("onGameInfolist_area", this.onGameInfolist, this);
        glGame.emitter.on("onRoomInfo_area", this.onRoomInfo, this);
        glGame.emitter.on("onHandInfo_area", this.onHandInfo, this);
    },
    //事件销毁
    unregisterEvent() {
        glGame.emitter.off("onGameInfolist_area", this);
        glGame.emitter.off("onRoomInfo_area", this);
        glGame.emitter.off("onHandInfo_area", this);
    },
    //事件回调
    //进入游戏信息回调
    onGameInfolist(msg) {
        this.serverTimeOff = Date.now() - msg.servertime;
        this.updateUI();
    },
    onHandInfo(msg) {
        this.roomRecord == glGame.readyroom.roomrecord;
        for (let i = 0; i < this.content.children.length; i++) {
            if (this.content.children[i].name == msg.roomid) {
                this.showRecord(this.content.children[i], this.roomRecord[msg.roomid]);
            }
        }
    },
    onRoomInfo(msg) {
        this.roomList = glGame.readyroom.roomlist;
        for (let i = 0; i < this.content.children.length; i++) {
            if (this.content.children[i].name == msg.roomdata.roomid) {
                let waitTime = Math.round((msg.roomdata.curwaittime - (Date.now() - this.serverTimeOff)) / 1000);
                this.content.children[i].getChildByName('lackTime').getComponent(cc.Label).string = waitTime;
                this.content.children[i].getChildByName('gameState').getComponent(cc.Label).string = this.gameState[this.node.name][msg.roomdata.process];
                this.content.children[i].getChildByName('onlineNum').getComponent(cc.Label).string = '在线' + msg.roomdata.online;
            }
        }
    },
    //更新UI
    updateUI() {
        this.roomList = glGame.readyroom.roomlist;
        this.roomRecord = glGame.readyroom.roomrecord;
        if (!this.roomList) {
            return;
        }
        this.cleanTimer();
        this.content.destroyAllChildren();
        for(let i=1;i<5;i++){
            for (let roomid in this.roomList[i]) {
                let infoNode = cc.instantiate(this.node_record);
                infoNode.parent = this.content;
                infoNode.active = true;
                infoNode.name = roomid;
                infoNode.getChildByName('roomId').getComponent(cc.Label).string = this.roomName[this.node.name] + roomid;
                infoNode.getChildByName('onlineNum').getComponent(cc.Label).string = '在线' + this.roomList[i][roomid].online;
                infoNode.tag = this.roomList[i][roomid].roomserverid;
                let waitTime = Math.round((this.roomList[i][roomid].curwaittime - (Date.now() - this.serverTimeOff)) / 1000);
                infoNode.getChildByName('lackTime').getComponent(cc.Label).string = waitTime;
                infoNode.getChildByName('gameState').getComponent(cc.Label).string = this.gameState[this.node.name][this.roomList[i][roomid].process];
    
    
                this.showRecord(infoNode, this.roomRecord[roomid]);
            }
        }
       
        this.showClock();
    },
    //显示倒计时
    showClock() {
        this.setTimeOut = setInterval(() => {
            if (this.content.children) {
                for (let i = 0; i < this.content.children.length; i++) {
                    let time = Number(this.content.children[i].getChildByName('lackTime').getComponent(cc.Label).string) - 1;
                    if (time < 0) {
                        time = 0;
                    }
                    this.content.children[i].getChildByName('lackTime').getComponent(cc.Label).string = time;
                }
            }
        }, 1000)
    },

    showRecord(node, record) {
        if (!record) {
            return
        }
        let index;
        let dotNode;
        switch (this.node.name) {
            case 'longhudouselect':
            case 'baijialeselect':
            case 'hongheiselect':
                index = this.getIndex(record);
                node.getChildByName('node_dot').destroyAllChildren();
                let recordArr = [];
                let row = 0,
                    col = 0;
                for (let i = index; i < record.length; i++) {
                    let isChangeRow = false;
                    for (let j = 0; j < record[i].count; j++) {
                        if (record[i].result == 1) {
                            dotNode = cc.instantiate(this.node_redDot);
                        } else if (record[i].result == 2) {
                            dotNode = cc.instantiate(this.node_blueDot);
                        }
                        if (record[i].he) {
                            for (let k = 0; k < record[i].he.length; k++) {
                                if (record[i].he[k].index - 1 == j) {
                                    dotNode.children[0].active = true;
                                    dotNode.children[0].getComponent(cc.Label).string = record[i].he[k].num;
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
                        dotNode.setPosition(cc.v2(-213 + newCol * 19, 30 - newRow * 19));
                        recordArr.push([newRow, newCol]);
                        dotNode.active = true;
                        row++;
                    }
                    col++;
                    row = 0;
                }
                break;
            case 'brnnselect':
                node.getChildByName('node_dot').destroyAllChildren();
                if (record.length > 15) {
                    index = record.length - 15;
                }
                for (let i = index; i < record.length; i++) {
                    for (let j in record[i]) {
                        if (record[i][j] == 0) {
                            dotNode = cc.instantiate(this.node_redDot);
                        } else {
                            dotNode = cc.instantiate(this.node_blueDot);
                        }
                        dotNode.parent = node.getChildByName('node_dot');
                        dotNode.setPosition(cc.v2(-213 + (i - index + 1) * 19, 30 - j * 19));
                        dotNode.active = true;
                    }
                }
                break;
            case 'shuiguojiselect':
                break;
            case 'luckturntableselect':
                break;
        }
    },

    getIndex(record) {
        let index = 0;
        if (record.length > 16) {
            index = record.length - 16;
        }
        for (let j = index; j < record.length; j++) {
            if (j - index + record[j].count >= 23) {
                index += j - index + record[j].count - 23;
            }
        }
        return index;
    },

    //清理倒计时
    cleanTimer() {
        if (this.setTimeOut != null) {
            clearTimeout(this.setTimeOut);
        }
        this.setTimeOut = null;
    },

    OnDestroy() {
        this.cleanTimer();
        this.unregisterEvent();
    },
});

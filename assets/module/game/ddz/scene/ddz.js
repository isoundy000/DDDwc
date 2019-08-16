let CONFIGS = require("ddzconst");

glGame.baseclass.extend({

    properties: {
        headNode: [cc.Node],
        node_bottom: cc.Node,
        node_cards: cc.Node,
        node_continue: cc.Node,

        prefab_playerControl: cc.Prefab,
        prefab_otherHead: cc.Prefab,
        prefab_Cards: cc.Prefab,
        prefab_bottom: cc.Prefab,
        prefab_pokersRecord: cc.Prefab,
        prefab_ani: cc.Prefab,
        prefab_settleLayer: cc.Prefab,
        backgroundMusic: {
            type:cc.AudioClip,
            default:[]
        },
        springAudio: {
            type:cc.AudioClip,
            default:null
        },

        // animSpring: cc.Node,
        richlabel: cc.RichText,
        node_coutDown: cc.Node,
        nodeBeginTip: null,
        prefabBeginTip: cc.Prefab,
        spine_spring: cc.Node,
        spine_data: sp.SkeletonData,
        animStartGame: sp.Skeleton,
        landlordIcon: sp.Skeleton,
        landlordLight: cc.Node,
        prefab_audioNode: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.curLogic = require("ddzlogic").getInstance();
        this.backgroundState = false;
        this.pokersRecord = null;

        glGame.panel.showRoomLoading();

        this.timerPool = [];
        this.initUI();
        this.registerEvent()
        this.registerGlobalEvent()

        let index = this.randomNumber();
        glGame.audio.playBGM(this.backgroundMusic[index]);
    },
    /**
     * @describe: 随机返回0或者1
     * @return: randomNumber 随机数
     */
    randomNumber() {
        let randomNumber = Math.floor(Math.random() * 1000) >= 500 ? 0 : 1;
        return randomNumber;
    },
    initUI() {
        // this.curLogic.setPreInPlayer()
        this.audioNode = cc.instantiate(this.prefab_audioNode);
        this.node.addChild(this.audioNode);
        //玩家控制按钮
        this.playerControl = cc.instantiate(this.prefab_playerControl);
        this.node.addChild(this.playerControl);
        //牌
        this.cards = cc.instantiate(this.prefab_Cards);
        this.node_cards.addChild(this.cards);
        //底部自己的信息
        this.bottom = cc.instantiate(this.prefab_bottom);
        this.node_bottom.addChild(this.bottom);
        //渲染区
        this.ani = cc.instantiate(this.prefab_ani);
        this.node.addChild(this.ani);
        this.showNotice();

        glGame.panel.closeLoading();

    },

    initRoomUI(){
        this.initHead();
        this.initPokersRecord();
        if (this.pokersRecord) {
            this.pokersRecord.active = false;
        }

        //结算信息
        this.settle = cc.instantiate(this.prefab_settleLayer);
        this.settle.parent = this.node;
        this.settle.active = false;
        this.node_continue.active = this.curLogic.get('roomInfo').canChangeRoom;
    },

    showNotice() {
        let size = cc.size(cc.winSize.width * 0.53, 30);
        let pos = cc.v2(cc.winSize.width * 0.5, 704);
        glGame.panel.showRollNotice(pos, size);
    },


    onProcess() {
        let processSt = this.curLogic.get('process')
        if (processSt == CONFIGS.gameProcess.gamefinish) {
        }
    },

    //叫分结束之后调用 通过事件"initPokersRecord"
    initPokersRecord() {
        if (this.pokersRecord) return;
        cc.log("记牌器", this.curLogic.get("roomInfo").roomRule.MemoryCard);
        if (this.curLogic.get("roomInfo").roomRule.MemoryCard != 1) return
        this.pokersRecord = cc.instantiate(this.prefab_pokersRecord);
        // this.pokersRecord.acitve = false;
        this.node.addChild(this.pokersRecord);
    },

    initHead() {
        let playerList = this.curLogic.get('players');
        console.log("playerList", playerList)
        for (let seatid in playerList) {
            if (seatid == this.curLogic.getMySeatID()) {
                continue;
            } else {
                //生成其他玩家的头像
                this.initSeats(seatid);
            }
        }
    },

    initSeats(seatid) {
        let viewid = this.curLogic.getViewSeatID(seatid) - 1;
        let nodeCount = this.headNode[viewid].childrenCount;
        if (nodeCount != 0) return;
        console.log("是否生成了头像", seatid)
        let curNode = cc.instantiate(this.prefab_otherHead);
        curNode.getComponent('ddzOtherHead').setCardClockalarmPos(seatid);
        this.headNode[viewid].addChild(curNode);
    },
    clearCountDown() {
        clearInterval(this.intervalID);
        this.intervalID = null;
    },

    showCoutTime() {
        if (!glGame.isThirtySecond) return;
        this.node_coutDown.zIndex=1000;
        let time;
        let settleTime = this.curLogic.get("settleCountdown");
        let date = new Date();
        if (!settleTime) {
            time = 25;
        } else {
            time = Math.floor(25 - ((date - settleTime) / 1000));
        }
        this.richlabel.string = `<color=#ffffff>请换桌,否则</c><color=#ffd323>${time}</color><color=#ffffff>秒后将会退出房间！</c>`;
        this.intervalID = setInterval(() => {
            time--;
            date = new Date();
            this.richlabel.string = `<color=#ffffff>请换桌,否则</c><color=#ffd323>${time}</color><color=#ffffff>秒后将会退出房间！</c>`;
            if (time <= 0) {
                this.clearCountDown();
                this.node_coutDown.active = false;
                glGame.room.exitRoom();
            }
        }, 1000);
    },

    onHandCards() {
        this.landlordIcon.node.active = true;
        this.landlordIcon.setAnimation(0, "animation", false);
        this.landlordIcon.setCompleteListener((trackEntry, loopCount)=>{
            let name = trackEntry.animation ? trackEntry.animation.name : "";
            if (name=='animation') {
                this.landlordIcon.node.active = false;

                let pos = null;
                console.log("抢地主成功动画结束后", this.curLogic.getViewSeatID(this.curLogic.landlordID))
                if (this.curLogic.getViewSeatID(this.curLogic.landlordID)==0) {
                    console.log("玩家本人")
                    pos = cc.v2(-545, -210);
                } else {
                    console.log("其他玩家")
                    pos = this.headNode[this.curLogic.getViewSeatID(this.curLogic.landlordID)-1].position;
                }
                let action = cc.sequence(cc.spawn(cc.moveTo(0.1, pos.x, pos.y+100), cc.scaleTo(0.1, 0.1)), cc.callFunc(()=>{
                    glGame.emitter.emit("refreshLandlordIcon");
                }), cc.hide());
                this.landlordLight.active = true;
                this.landlordLight.runAction(action);
            }
        })
    },

    registerEvent() {
        glGame.emitter.on(CONFIGS.CCEvent.onEnterRoom, this.onEnterRoom, this);
        glGame.emitter.on(CONFIGS.CCEvent.onProcess, this.onProcess, this);
        glGame.emitter.on("initRoomUI", this.initRoomUI, this);
        glGame.emitter.on(CONFIGS.CCEvent.onSyncData, this.onSyncData, this);
        glGame.emitter.on(CONFIGS.CCEvent.onGameOver, this.onGameOver, this);
        glGame.emitter.on(CONFIGS.CCEvent.startGameTimeOut, this.startGameTimeOut, this);
        glGame.emitter.on(CONFIGS.CCEvent.onStartGame, this.onStartGame, this);
        glGame.emitter.on("closeSettle", this.closeSettle, this);
        glGame.emitter.on(CONFIGS.CCEvent.onHandCards, this.onHandCards, this);
    },

    unregisterEvent() {
        glGame.emitter.off(CONFIGS.CCEvent.onEnterRoom, this);
        glGame.emitter.off(CONFIGS.CCEvent.onProcess, this);
        glGame.emitter.off("initRoomUI", this);
        glGame.emitter.off(CONFIGS.CCEvent.onSyncData, this);
        glGame.emitter.off(CONFIGS.CCEvent.onGameOver, this);
        glGame.emitter.off(CONFIGS.CCEvent.startGameTimeOut, this);
        glGame.emitter.off(CONFIGS.CCEvent.onStartGame, this);
        glGame.emitter.off("closeSettle", this);
        glGame.emitter.off(CONFIGS.CCEvent.onHandCards, this);
    },

    registerGlobalEvent() {
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
    },

    unRegisterGlobalEvent() {
        glGame.emitter.off("EnterBackground", this);
        glGame.emitter.off("EnterForeground", this);
    },

    EnterBackground() {
        this.backgroundState = true;
        this.unregisterEvent();
        this.clearCountDown();
        this.animStartGame.clearTrack(0);
        this.animStartGame.node.active = false;
    },

    EnterForeground() {
        if (this.backgroundState) {
            this.backgroundState = false;
            this.registerEvent();
        }
        glGame.panel.closeLoading();
        this.initHead();
        if (this.curLogic.get("process") == CONFIGS.gameProcess.loop && !this.pokersRecord) {
            this.initPokersRecord();
        }
        if (this.curLogic.get("process") == CONFIGS.gameProcess.gamefinish && this.node_coutDown.active) {
            this.showCoutTime();
        }
        this.initBeginTip();
    },

    onStartGame() {
        if (this.nodeBeginTip) {
            this.nodeBeginTip.removeFromParent();
        }
        this.animStartGame.node.active = true;
        this.animStartGame.setAnimation(0, 'pjks', false);
        this.animStartGame.getComponent(sp.Skeleton).setCompleteListener((trackEntry, loopCount) => {
            let name = trackEntry.animation ? trackEntry.animation.name : "";
            if (name == 'pjks') {
                this.animStartGame.node.active = false;
            }
        })
    },


    initBeginTip() {
        let startTime = this.curLogic.get("startTime");
        if (!startTime) return;
        let curTime = (new Date()).getTime();
        let surplusTime = Math.floor(startTime - curTime / 1000);
        console.log("剩余开局时间ddz", surplusTime);
        if (surplusTime > 1 && !this.nodeBeginTip) {
            this.nodeBeginTip = cc.instantiate(this.prefabBeginTip);
            this.nodeBeginTip.parent = this.node;
        }
    },

    startGameTimeOut() {
        this.nodeBeginTip = cc.instantiate(this.prefabBeginTip);
        this.nodeBeginTip.parent = this.node;
    },

    onEnterRoom(seatID) {
        let seatid = seatID;//this.curLogic.get('enterRoomSeatId');
        console.log('onEnterRoom', seatid, this.curLogic.getMySeatID())
        if (seatid == this.curLogic.getMySeatID()) {
            return;
        }
        this.initSeats(seatid);
        glGame.emitter.emit("updateHeadInfo");
    },

    closeSettle() {
        this.node_continue.active = true;
        this.node_coutDown.active = glGame.isThirtySecond;
        let date = new Date();
        this.curLogic.set("settleCountdown", date);
        this.showCoutTime();
    },

    onGameOver() {
        let isSpring = this.curLogic.get("isSpring");
        if (isSpring != 0) {
            this.timerPool.push(setTimeout(() => {
                this.spine_spring.active = true;
                this.spine_spring.zIndex=20;
                let spineNode = this.spine_spring.getComponent(sp.Skeleton);
                spineNode.setAnimation(0, "chuntian", false);
                glGame.audio.playSoundEffect(this.springAudio);
            }, 1000))
            let animEndFunc = () => {
                this.spine_spring.active = false;
            }
            this.spine_spring.getComponent(sp.Skeleton).setCompleteListener((trackEntry, loopCount) => {
                let name = trackEntry.animation ? trackEntry.animation.name : "";
                if (name == 'chuntian' && animEndFunc) {
                    animEndFunc();
                }
            })
        }
    },

    onSyncData() {
        let processSt = this.curLogic.get('process')
        console.log("重连进入的流程", processSt, CONFIGS.gameProcess.gamefinish)
        if (processSt == CONFIGS.gameProcess.gamefinish) {
            this.node_continue.active = true;
        } else if (processSt == CONFIGS.gameProcess.loop) {
        }
    },

    OnDestroy() {
        this.clearCountDown();
        this.timerPool.forEach((timer) => { clearTimeout() });
        this.timerPool = [];
        this.unregisterEvent();
        this.unRegisterGlobalEvent();
    },

    onClick(name, node) {
        switch (name) {
            case "continue":
                if (!this.curLogic.showGoldTip()) {
                    console.log("换桌lalalalal")
                    glGame.user.reqMyInfo();
                    glGame.room.changeTable();
                }
                break;
            default:
                break;
        }
    },
    // start () {

    // },

    // update (dt) {},
});

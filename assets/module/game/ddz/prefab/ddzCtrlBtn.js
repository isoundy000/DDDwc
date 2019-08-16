let CONFIGS = require("ddzconst");
let Judgement = require("doudizhuFP");
glGame.baseclass.extend({
    properties: {
        node_normal: cc.Node,
        node_pillage: cc.Node,
        node_notOver: cc.Node,
        node_firstPlayCard: cc.Node,
        node_cancelTrusteeship: cc.Node,
        node_clock1: cc.Node,
        node_clock2: cc.Node,
        cardTypeError: cc.Node,
        autoPlayBtn: cc.Node,
        xialaBtn: cc.Node,
        xialaPanel: cc.Node,

        countDownAudio: {
             type:cc.AudioClip,
             default:null
        },
        noExit: cc.Node,
        xialaClose: cc.Node,
        notOutCard: cc.Node,
        notOutCardThree: cc.Node,

        btn_gm: cc.Node,
        btn_gameOver: cc.Node,
        prefab_gm: cc.Prefab,
        grayScoreFrame: [cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.curLogic = require("ddzlogic").getInstance();
        this.backgroundState = false;
        this.initData();
        this.refOutBtnState();
        this.regisrterEvent();
        this.registerGlobalEvent();
    },

    initData() {
        this.timerPool = [];
    },

    start() {

    },

    //显示按钮
    showBtn(state) {
        if (this.curLogic.get('isAuto')[this.curLogic.getMySeatID()]) {
            return;
        }
        this.refOutBtnState();
        switch (state) {
            case CONFIGS.gameState.pillgae:
                this.node_pillage.active = true;
                // for(let i=1;i<=3;i++){
                //     this.node_pillage.getChildByName(`btn_score${i}`).enableAutoGrayEffect = true;
                // }
                this.startCountDown(this.node_pillage.children[0].children[0]);
                console.log("不能显示的按钮", this.curLogic.get("curScore"))
                for (let i = this.curLogic.get('curScore'); i > 0; i--) {
                    this.node_pillage.getChildByName(`btn_score${i}`).getComponent(cc.Button).interactable = false;
                    this.node_pillage.getChildByName(`btn_score${i}`).getChildByName("score").getComponent(cc.Sprite).spriteFrame = this.grayScoreFrame[i-1];
                }
                break;
            case CONFIGS.gameState.normal:
                this.node_normal.active = true;
                this.startCountDown(this.node_normal.children[0].children[0]);
                break;
            case CONFIGS.gameState.notover:
                this.node_notOver.active = true;
                this.startCountDown(this.node_notOver.children[0].children[0]);
                break;
            case CONFIGS.gameState.firstPlayCard:
                this.node_firstPlayCard.active = true;
                this.startCountDown(this.node_firstPlayCard.children[0].children[0]);
                break;
            case CONFIGS.gameState.trusteeship:
                this.node_cancelTrusteeship.active = true;
                break;
        }
    },

    // 重写父类按钮点击事件
    onClick(name, node) {
        switch (name) {
            case "btn_tip": this.tip_cb(); break;
            case "btn_pass": this.pass_cb(); break;
            case "btn_palyCard": this.playCard_cb(); break;
            case "btn_trusteeship": this.trusteeship_cb(1); break;
            case "btn_cancelTrusteeship": this.trusteeship_cb(0); break;
            case "btn_notOver": this.pass_cb(); break;
            case "btn_score1": this.pillage(1); break;
            case "btn_score2": this.pillage(2); break;
            case "btn_score3": this.pillage(3); break;
            case "btn_giveup": this.pillage(0); break;
            case "btn_exit": this.exitRoom(); break;
            case "btn_first_playCard": this.playCard_cb(); break;
            case "btn_shezhi": this.shezhi_cb(); break;
            case "btn_jilu": this.jilu_cb(); break;
            case "btn_bangzhu": this.bangzhu_cb(); break;
            case "xialaBtn": this.xiala_cb(); break;
            case "xialaClose": this.xiala_cb(); break;
            case "gm": this.gm_cb(); break;
            case "gameover": this.gameover_cb(); break;
            default: console.error("no find button name -> %s", name); break;
        }
    },
    gm_cb() {
        let gm = cc.instantiate(this.prefab_gm);
        gm.parent = this.node;
        gm.zIndex = 10;
        this.scheduleOnce(this.hideGM, 5)
    },
    hideGM() {
        this.btn_gm.active = false;
    },
    gameover_cb() {
        let msg = {
            "oprType": 3,
        };
        console.log("发送配牌请求", msg);
        glGame.gameNet.send_msg("ddzRoom.ddzRoomHandler.playerGmOp", msg);
    },

    //====================网络事件
    regisrterEvent() {
        glGame.emitter.on(CONFIGS.CCEvent.onplayerOp, this.onplayerOp, this);
        glGame.emitter.on(CONFIGS.CCEvent.onLandowner, this.onLandowner, this);   //通知谁抢地主
        glGame.emitter.on(CONFIGS.CCEvent.onLandownerResult, this.onLandownerResult, this);
        glGame.emitter.on(CONFIGS.CCEvent.onPlayCard, this.onPlayCard, this);
        glGame.emitter.on(CONFIGS.CCEvent.onPlayCardResult, this.onPlayCardResult, this);
        glGame.emitter.on(CONFIGS.CCEvent.onAutoPlay, this.onAutoPlay, this);
        glGame.emitter.on(CONFIGS.CCEvent.onGameOver, this.onGameOver, this);
        glGame.emitter.on(CONFIGS.CCEvent.onSyncData, this.onSyncData, this);
        glGame.emitter.on(CONFIGS.CSEvent.onProcess, this.onProcess, this);
        glGame.emitter.on("ddzExitTip", this.exitTip, this);
        glGame.emitter.on("selectCardEnd", this.refOutBtnState, this);
        glGame.emitter.on(CONFIGS.CCEvent.onStartGame, this.onStartGame, this);

    },
    unregisterEvent() {
        glGame.emitter.off(CONFIGS.CCEvent.onplayerOp, this);
        glGame.emitter.off(CONFIGS.CCEvent.onLandowner, this);
        glGame.emitter.off(CONFIGS.CCEvent.onLandownerResult, this);
        glGame.emitter.off(CONFIGS.CCEvent.onPlayCard, this);
        glGame.emitter.off(CONFIGS.CCEvent.onPlayCardResult, this);
        glGame.emitter.off(CONFIGS.CCEvent.onAutoPlay, this);
        glGame.emitter.off(CONFIGS.CCEvent.onGameOver, this);
        glGame.emitter.off(CONFIGS.CCEvent.onSyncData, this);
        glGame.emitter.off(CONFIGS.CSEvent.onProcess, this);
        glGame.emitter.off("ddzExitTip", this);
        glGame.emitter.off("selectCardEnd", this);
        glGame.emitter.off(CONFIGS.CCEvent.onStartGame, this);

    },

    registerGlobalEvent() {
        glGame.emitter.on("EnterBackground", this.EnterBackground, this);
        glGame.emitter.on("EnterForeground", this.EnterForeground, this);
    },

    unRegisterGlobalEvent() {
        glGame.emitter.off("EnterBackground", this);
        glGame.emitter.off("EnterForeground", this);
    },

    onStartGame() {
        this.btn_gm.active = this.curLogic.get("gmSwitch");
        this.btn_gameOver.active = this.curLogic.get("gmSwitch");
    },

    EnterBackground() {
        this.backgroundState = true;
        this.unregisterEvent();
        this.node_clock1.active = false;
        this.node_clock2.active = false;
        this.clearCountDown();
    },

    EnterForeground() {
        let processSt = this.curLogic.get("process")
        if (processSt == CONFIGS.gameProcess.loop) {
            this.hideMyAllCtrlBtn();
            this.onPlayCard();
            this.autoPlayBtn.active = true;
            this.node_cancelTrusteeship.active = this.curLogic.get('isAuto')[this.curLogic.getMySeatID()];
        }
        if (processSt == CONFIGS.gameProcess.pillgae) {
            this.hideMyAllCtrlBtn();
            this.onLandowner();
        }
        if (this.backgroundState) {
            this.backgroundState = false;
            this.regisrterEvent();
        }
        if (processSt == CONFIGS.gameProcess.gamefinish) {
            this.hideMyAllCtrlBtn();
            this.node_cancelTrusteeship.active = false;
        }
    },

    refOutBtnState() {
        let outCardList = this.curLogic.get('outCardList');
        this.notOutCard.active = outCardList.length == 0;
        this.notOutCardThree.active = outCardList.length == 0;
    },

    exitTip() {
        this.noExit.active = true;
        this.timerPool.push(setTimeout(() => {
            this.noExit.active = false;
        }, 2000))
    },

    OnDestroy() {
        this.timerPool.forEach((timer) => { clearTimeout(timer) });
        this.timerPool = [];
        this.unregisterEvent();
        this.unRegisterGlobalEvent();
    },

    onSyncData() {
        let processSt = this.curLogic.get("process");
        if (processSt == CONFIGS.gameProcess.pillgae) {
            this.onLandowner();
        } else if (processSt == CONFIGS.gameProcess.loop) {
            this.onPlayCard();
            this.autoPlayBtn.active = true;
            this.node_cancelTrusteeship.active = this.curLogic.get('isAuto')[this.curLogic.getMySeatID()];
        }
    },

    onProcess() {
        let processSt = this.curLogic.get("process");
        if (processSt == CONFIGS.gameProcess.loop) {
            this.autoPlayBtn.active = true;
        }
    },

    //操作的回调
    onplayerOp() {
        glGame.panel.closeRoomJuHua();
        let msg = this.curLogic.get("t_onplayerOp");

        if (msg.type == CONFIGS.oprEvent.oprSnatchLandlord) { //抢地主
            if (msg.success == 1) {
                this.node_pillage.active = false;
                // let audioPath = `modules/games/ddz/res/audio/unbindaudio/lord_v_callscore_${score}`;
                // let sexPath = glGame.user.userSex === 1 ? "male/": "female/";
                // let audioPath = CONFIGS.audioPathPrefix + sexPath + "au_ddz_cardtype0_" + score;
                // console.log("叫分音频路径", audioPath)
                // glGame.audio.playSoundEffectByPath(audioPath);
                this.clearCountDown();
            } else {
                console.log("叫地主错误")
            }
        } else if (msg.type == CONFIGS.oprEvent.oprPlayerCard) {// 玩家出牌
            let state = this.curLogic.get("gameState");
            if (msg.success == 1) {
                if (state == CONFIGS.gameState.normal) {//普通的不出，提示，出牌
                    this.node_normal.active = false;
                } else if (state == CONFIGS.gameState.notover) {//要不起
                    this.node_notOver.active = false;
                } else if (state == CONFIGS.gameState.firstPlayCard) {//第一手出牌
                    this.node_firstPlayCard.active = false;
                }
                this.clearCountDown();
            } else {
                console.log("玩家出牌错误")
            }
        } else if (msg.type == CONFIGS.oprEvent.oprAutoPlay) {// 玩家托管
            if (msg.errCode == 1) {
                // this.node_cancelTrusteeship.active = !this.node_cancelTrusteeship.active;
            } else {
                console.log("玩家托管错误")
            }
        }
        if (msg.errCode != 1) {
            let state = this.curLogic.get("gameState");
            if (state == CONFIGS.gameState.normal) {
                console.log("牌型错误")
                this.cardTypeError.active = true;
                glGame.emitter.emit("selectCardError");
                this.timerPool.push(setTimeout(() => {
                    console.log("隐藏牌型错误提示")
                    this.cardTypeError.active = false;
                }, 1000))
            }
        }
    },

    onLandowner() {
        let seatID = this.curLogic.get("opSeatId");
        let viewID = this.curLogic.getViewSeatID(seatID);
        if (viewID == 0) {
            cc.log("轮到我选地主了")
            if (this.curLogic.get('allScore')[seatID] == -1) {
                this.showBtn(CONFIGS.gameState.pillgae);
            }
        } else if (viewID == 1) {
            this.startCountDown(this.node_clock1.children[0]);
        } else if (viewID == 2) {
            this.startCountDown(this.node_clock2.children[0]);
        }
    },
    onLandownerResult() {
        let seatID = this.curLogic.get("opSeatId");
        let viewID = this.curLogic.getViewSeatID(seatID);
        if (viewID == 0) {
            cc.log("我选完地主了")
            this.node_pillage.active = false;
        } else if (viewID == 1) {
            this.node_clock1.active = false;

        } else if (viewID == 2) {
            this.node_clock2.active = false;
        }
        this.clearCountDown();
    },
    onPlayCard() {
        let seatID = this.curLogic.get("opSeatId");
        let viewID = this.curLogic.getViewSeatID(seatID);
        let searchOutCardLength = this.curLogic.get("searchOutCardLength");
        if (viewID == 0) {
            let referPokers = this.curLogic.get("referPokers");
            if (Object.keys(referPokers).length == 0) {
                this.showBtn(CONFIGS.gameState.firstPlayCard)
            } else {
                if (searchOutCardLength == 0) {
                    this.showBtn(CONFIGS.gameState.notover);
                } else if (seatID == referPokers.seatId) {
                    this.showBtn(CONFIGS.gameState.firstPlayCard)
                } else {
                    this.showBtn(CONFIGS.gameState.normal)
                }
            }
        } else if (viewID == 1) {
            this.startCountDown(this.node_clock1.children[0]);
        } else if (viewID == 2) {
            this.startCountDown(this.node_clock2.children[0]);
        }
    },
    onPlayCardResult() {
        let seatID = this.curLogic.get("opSeatId");
        let viewID = this.curLogic.getViewSeatID(seatID);
        if (viewID == 0) {
            this.node_normal.active = false;
            this.node_firstPlayCard.active = false;
            this.node_notOver.active = false;
        } else if (viewID == 1) {
            this.node_clock1.active = false;
        } else if (viewID == 2) {
            this.node_clock2.active = false;
        }
        this.clearCountDown();
    },
    hideMyAllCtrlBtn() {
        this.node_normal.active = false;
        this.node_firstPlayCard.active = false;
        this.node_notOver.active = false;
        this.node_pillage.active = false;
    },
    //退出房间
    exitRoom() {
        if (this.curLogic.get("gameStart")) {
            glGame.panel.showExitRoomPanel('coin', 30);
            return;
        }
        glGame.user.reqMyInfo();
        glGame.room.exitRoom();
    },
    //托管、1 取消托管、0
    trusteeship_cb(_isAuto) {
        // glGame.panel.showRoomJuHua();
        this.curLogic.send_trusteeship(_isAuto);
    },
    //不出/要不起
    pass_cb() {
        // glGame.panel.showRoomJuHua();
        glGame.emitter.emit("cancelSelect")
        this.curLogic.send_playCard();
    },
    //提示
    tip_cb() {
        glGame.emitter.emit("tipSelectCard");
        this.refOutBtnState();
    },
    //正常出牌,第一手出牌
    playCard_cb() {
        if (this.curLogic.get("outCardList").length == 0) {
            this.cardTypeError.active = true;
            glGame.emitter.emit("selectCardError");
            this.timerPool.push(setTimeout(() => {
                console.log("隐藏牌型错误提示")
                this.cardTypeError.active = false;
            }, 1000))
            return;
        }
        // glGame.panel.showRoomJuHua();
        this.curLogic.send_playCard();
    },
    shezhi_cb() {
        cc.log("shezhi");
        this.xiala_cb();
        glGame.panel.showSetting();
    },

    jilu_cb() {
        this.xiala_cb();
        glGame.panel.showNewGameRecord(36);
    },

    bangzhu_cb() {
        this.xiala_cb();
        glGame.panel.showNewGameRule(36);
    },

    xiala_cb() {
        this.xialaPanel.active = !this.xialaPanel.active;
        this.xialaClose.active = this.xialaPanel.active;
        this.xialaBtn.getChildByName('shou').active = !this.xialaPanel.active;
        this.xialaBtn.getChildByName('kai').active = this.xialaPanel.active;
    },
    //叫地主操作
    pillage(score) {
        // glGame.panel.showRoomJuHua();
        this.curLogic.send_pillage(score);

    },

    onAutoPlay() {
        this.node_cancelTrusteeship.active = this.curLogic.get('isAuto')[this.curLogic.getMySeatID()];
        if (this.curLogic.get('isAuto')[this.curLogic.getMySeatID()]) {
            this.node_normal.active = false;
            this.node_firstPlayCard.active = false;
            this.node_notOver.active = false;
            this.node_pillage.active = false;
        }
    },

    onGameOver() {
        this.node_cancelTrusteeship.active = false;
        this.autoPlayBtn.active = false;
    },

    // //显示倒计时
    // showCountDown(time,node) {
    //     let curTime = time;
    //     node.getComponent(cc.Label).string = curTime;
    //     this.intervalID = setInterval(() => {
    //         if (curTime > 0) {
    //             curTime -= 1;
    //             node.getComponent(cc.Label).string = curTime;
    //         } else {
    //             node.parent.active = false;
    //             this.clearCountDown();
    //         }
    //     }, 1000);
    // },
    //清除倒计时
    clearCountDown() {
        this.node.stopAllActions();
    },
    // //开始倒计时
    // startCountDown (node){
    //     this.clearCountDown();
    //     node.parent.active = true;
    //     let time = this.curLogic.getCurWaitTime();
    //     if(time > 0){
    //         this.showCountDown(time,node);
    //     }
    // },
    startCountDown(node) {
        this.clearCountDown();
        let time = this.curLogic.getCurWaitTime(0);
        if (this.node_notOver.active) {
            time = this.curLogic.getCurWaitTime(1);
        }
        node.getComponent(cc.Label).string = time;
        node.parent.active = true;
        var curlogic = this.curLogic;
        this.node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(1), cc.callFunc(() => {
            time = curlogic.getCurWaitTime(0);
            if (this.node_notOver.active) {
                time = curlogic.getCurWaitTime(1);
            }
            node.getComponent(cc.Label).string = time;
            node.parent.active = true;
            if (time <= 3) {
                glGame.audio.playSoundEffect(this.countDownAudio);
            }
            if (time <= 0) {
                if (this.node_notOver.active) {
                    console.log("像服务端发送要不起")
                    this.pass_cb();
                }
                node.parent.active = false;
                if (node.parent.parent != this.node) {
                    console.log("隐藏操作按钮节点")
                    node.parent.parent.active = false;
                }
                this.clearCountDown();
            }
        }))));
    },
    // update (dt) {},
});

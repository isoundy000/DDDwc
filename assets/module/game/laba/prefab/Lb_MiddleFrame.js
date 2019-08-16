
const SCROLL_STRIP_INDEX = {
    SCROLL_STRIP_1: 1,
    SCROLL_STRIP_2: 2,
    SCROLL_STRIP_3: 3,
    SCROLL_STRIP_4: 4,
    SCROLL_STRIP_5: 5,
}

glGame.baseclass.extend({
    properties: {
        prefab_strip: cc.Prefab,
        prefab_strip_action: cc.Prefab,
        strip_count: 3,
        strip_act: cc.Node,
        node_strip_show: cc.Node,
        node_scroll_1: cc.Node,
        node_scroll_2: cc.Node,
        node_scroll_3: cc.Node,
        node_scroll_4: cc.Node,
        node_scroll_5: cc.Node,

        gd_audio: {
            type: cc.AudioClip,
            default: null
        },
        gdt_audio: {
            type: cc.AudioClip,
            default: null
        },
    },
    onLoad() {
        this.lbmgr = require("labalogic").getInstance();
        this.time = 0.5 * 1000;
        this.time_gap = 0.5 * 1000;
        this.num_min = 10;
        this.bNowStrip = 1;
        this.move_y = 1;
        this.show_end = 0;
        this.strip_max = 7;

        this.refreshstrip();
        //添加5个滚动条
        this.addScrollStrip(this.node_scroll_1);
        this.addScrollStrip(this.node_scroll_2);
        this.addScrollStrip(this.node_scroll_3);
        this.addScrollStrip(this.node_scroll_4);
        this.addScrollStrip(this.node_scroll_5);

        glGame.emitter.on("lb.startstrip", this.startstrip, this);
        glGame.emitter.on("lb.refreshstrip", this.refreshstrip, this);
        glGame.emitter.on("lb.stopstrip", this.stopstrip, this);
        glGame.emitter.on("lb.hideStrip", this.hideStrip, this);

    },
    start() {
    },

    OnDestroy() {
        glGame.emitter.off("lb.startstrip", this);
        glGame.emitter.off("lb.refreshstrip", this);
        glGame.emitter.off("lb.stopstrip", this);
        glGame.emitter.off("lb.hideStrip", this);
    },
    //展示龙骨动画且隐藏滚动对应的节点
    hideStrip() {
        let arr = this.lbmgr.getShowArrPos();
        let nodeArr = this.lbmgr.getShowArrNode();
        for (let i = 0; i < arr.length; i++) {
            let index = arr[i].split("_")[1];
            let index1 = arr[i].split("_")[0];
            let node = nodeArr[index].children[2 - index1];
            node.active = false;
        }
    },
    //胜利线条数量
    addStripAction() {
        if (!this.node.getChildByName(this.prefab_strip_action.name)) {
            let strip_action = cc.instantiate(this.prefab_strip_action);
            this.node.addChild(strip_action);
        }
        if (this.lbmgr.strip_index) {
            for (let key in this.lbmgr.strip_index) {
                let strip_node = this.node_strip_show.getChildByName(`strip_${key}`);
                if (strip_node) {
                    let strip_action = cc.instantiate(this.strip_act);
                    strip_action.active = true;
                    strip_node.addChild(strip_action);
                    strip_action.zIndex = 10;
                    let act_time = 0.3;
                    strip_action.runAction(cc.repeatForever(cc.sequence(cc.fadeOut(act_time), cc.fadeIn(act_time))));
                }
            }
        }
    },
    //随机产生滚动条的图片索引
    getRandomStripList() {
        let num_1 = parseInt(Math.random() * this.strip_max + 1),
            num_2 = parseInt(Math.random() * this.strip_max + 1),
            num_3 = parseInt(Math.random() * this.strip_max + 1);
        return { 0: num_1, 1: num_2, 2: num_3 };
    },
    //获取显示线条列表
    getShowList() {
        return this.lbmgr.show_list[this.bNowStrip] || this.getRandomStripList();
    },
    //
    setOnShow(node, showlist) {
        let ScrollStrip = node.getComponent("Lb_ScrollStrip");
        ScrollStrip.SetShow(showlist);
    },
    //索引变量获取值
    getRandom() {
        let num = parseInt(Math.random() * (1 - this.strip_max + 1) + this.strip_max);
        return num;
    },
    //初始化添加滚动条
    addScrollStrip(node) {
        let scrollStripObj1 = cc.instantiate(this.prefab_strip);
        node.addChild(scrollStripObj1);
        scrollStripObj1.y = scrollStripObj1.height / 2 - this.node_scroll_1.height / 2;
        this.move_y = scrollStripObj1.y;
        this.setOnShow(scrollStripObj1, { 0: this.getRandom(), 1: this.getRandom(), 2: this.getRandom() });

        let scrollStripObj2 = cc.instantiate(this.prefab_strip);
        node.addChild(scrollStripObj2);
        scrollStripObj2.y = this.move_y + scrollStripObj2.height;
        this.setOnShow(scrollStripObj2, { 0: this.getRandom(), 1: this.getRandom(), 2: this.getRandom() });
    },
    //获取滚动条结束的坐标值
    getNumberHeight(num) {
        let scrollStripObj = cc.instantiate(this.prefab_strip);
        return this.node_scroll_1.height / 2 - scrollStripObj.height / 2 - this.node_scroll_1.height / 3 + (num - 1) * (scrollStripObj.height / this.strip_count);
    },
    //根据参数设置其滚动的结束位置
    moveAction(node, end_time, now_move, end_num) {
        let now_time = new Date().getTime(),
            move_pos = 6,
            bMove = false,
            now_height = this.getNumberHeight(end_num),
            scrollStripObj1 = node.children[1],
            scrollStripObj2 = node.children[2];
        //判定是否到结束
        if (end_time != 0) {
            if (Math.abs(now_height - scrollStripObj1.y) <= now_move
                || Math.abs(now_height - scrollStripObj2.y) <= now_move) {
                if (end_time - now_time < this.time / 3) {
                    //now_move = Math.max(now_move - move_pos, this.num_min);
                }
            }
        }
        //滚动距离递减
        scrollStripObj1.y = scrollStripObj1.y - now_move;
        scrollStripObj2.y = scrollStripObj2.y - now_move;
        if (scrollStripObj1.y <= this.move_y - scrollStripObj1.height) {
            scrollStripObj1.y = scrollStripObj2.y + scrollStripObj2.height;
            if (now_time >= end_time && end_time != 0) {
                this.setOnShow(scrollStripObj1, this.getShowList());
                this.show_end = 1;
            } else
                this.setOnShow(scrollStripObj1, this.getRandomStripList());
        }
        if (scrollStripObj2.y <= this.move_y - scrollStripObj2.height) {
            scrollStripObj2.y = scrollStripObj1.y + scrollStripObj1.height;
            if (now_time >= end_time && end_time != 0) {
                cc.log("渲染1", this.getShowList())
                this.setOnShow(scrollStripObj2, this.getShowList());
                this.show_end = 2;
            } else {
                cc.log("渲染2", this.getShowList())
                this.setOnShow(scrollStripObj2, this.getRandomStripList());
            }
        }
        //到达结束时间，结束位置，定位
        if (now_time >= end_time && end_time != 0 && this.show_end != 0 /*&& now_move == this.num_min*/) {
            let bEnd = false,
                scroll_obj = null,
                move_scroll = null;
            if (Math.abs(now_height - scrollStripObj1.y) <= now_move && this.show_end == 1) {
                scroll_obj = scrollStripObj1;
                move_scroll = scrollStripObj2;
                bEnd = true;
            } else if (Math.abs(now_height - scrollStripObj2.y) <= now_move && this.show_end == 2) {
                scroll_obj = scrollStripObj2;
                move_scroll = scrollStripObj1;
                bEnd = true;
            }

            //定位
            if (bEnd) {
                this.lbmgr.setShowArrNode(scroll_obj);
                glGame.audio.playSoundEffect(this.gdt_audio);
                this.show_end = 0;
                scroll_obj.y = now_height;
                move_scroll.y = scroll_obj.y + scroll_obj.height;
                node.stopAllActions();
                //最终结束
                if (this.bNowStrip == SCROLL_STRIP_INDEX.SCROLL_STRIP_5) {
                    if (this.lbmgr.strip_index != null && Object.keys(this.lbmgr.strip_index).length != 0) {
                        cc.log("显示开奖龙骨", this.lbmgr.strip_index)
                        this.addStripAction();
                        glGame.emitter.emit("lb.showWinSp");
                    } else {
                        glGame.emitter.emit("lb.stopstrip");
                    }
                }


                this.bNowStrip++;
            }
        }
        return now_move;
    },
    //滚动时间值换算
    bolMoveFrame(node, endtime) {
        let gapTime = 0;
        switch (node) {
            case this.node_scroll_1:
                if (SCROLL_STRIP_INDEX.SCROLL_STRIP_1 == this.bNowStrip) gapTime = this.time;
                break;
            case this.node_scroll_2:
                if (SCROLL_STRIP_INDEX.SCROLL_STRIP_2 == this.bNowStrip) gapTime = this.time_gap;
                break;
            case this.node_scroll_3:
                if (SCROLL_STRIP_INDEX.SCROLL_STRIP_3 == this.bNowStrip) gapTime = this.time_gap;
                break;
            case this.node_scroll_4:
                if (SCROLL_STRIP_INDEX.SCROLL_STRIP_4 == this.bNowStrip) gapTime = this.time_gap;
                break;
            case this.node_scroll_5:
                if (SCROLL_STRIP_INDEX.SCROLL_STRIP_5 == this.bNowStrip) gapTime = this.time_gap;
                break;
            default:
                break;
        }
        if (gapTime != 0) endtime = new Date().getTime() + gapTime;
        return endtime;
    },
    //根据定义的参数设置其滚动结束以及滚动定位
    MoveActionObj(node, num) {
        var num_now = 1500 / (1 / cc.director.getDeltaTime());
        console.log("num_now", num_now, cc.director.getDeltaTime());
        let end_time = 0;
        let delay = cc.delayTime(0.01);
        let call = cc.callFunc(() => {
            if (end_time == 0) {
                end_time = this.bolMoveFrame(node, end_time);
            }
            num_now = this.moveAction(node, end_time, num_now, num)
        });
        node.runAction(cc.repeatForever(cc.sequence(delay, call)));
    },
    //滚动动画统一入口
    ActionObj() {
        let endPosNum = 2;
        glGame.audio.playSoundEffect(this.gd_audio);
        this.bNowStrip = SCROLL_STRIP_INDEX.SCROLL_STRIP_1;
        this.MoveActionObj(this.node_scroll_1, endPosNum);
        this.MoveActionObj(this.node_scroll_2, endPosNum);
        this.MoveActionObj(this.node_scroll_3, endPosNum);
        this.MoveActionObj(this.node_scroll_4, endPosNum);
        this.MoveActionObj(this.node_scroll_5, endPosNum);
    },
    //滚动开始
    startstrip() {
        this.node.runAction(cc.sequence(
            cc.delayTime(0.4),
            cc.callFunc(() => { this.ActionObj() })
        ))

    },
    //刷新选中的线条显示框
    refreshstrip() {
        for (let key in this.lbmgr.betData) {
            let data = this.lbmgr.betData[key];
            let strip_node = this.node_strip_show.getChildByName(`strip_${key}`);
            if (strip_node) {
                let strip = strip_node.getComponent(cc.Toggle);
                if (data != 0) {
                    strip.check();
                } else {
                    strip.uncheck();
                }
            }
        }
    },
    //滚动停止，显示其中奖条目清理
    stopstrip() {
        for (let key in this.lbmgr.betData) {
            let strip_node = this.node_strip_show.getChildByName(`strip_${key}`);
            if (strip_node) {
                let strip_act = strip_node.getChildByName("jt_00");
                if (strip_act != null) {
                    strip_act.destroy();
                }
            }
        }
    },
});

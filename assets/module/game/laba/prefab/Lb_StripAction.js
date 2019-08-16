
glGame.baseclass.extend({
    properties: {
        nodeLine: cc.Node,
        nodeResult: cc.Node,
        skeletonDataList: [sp.SkeletonData],
    },


    onLoad() {
        this.lbmgr = require("labalogic").getInstance();

        this.showStrip();

        this.showSpine();

        this.showStripEnd();
        glGame.emitter.on("removeResultSp", this.remove, this);
    },
    start() {
    },

    OnDestroy() {
        glGame.emitter.off("removeResultSp", this);
    },
    //显示中奖线条
    showStrip() {
        let strip_index = this.lbmgr.strip_index;
        if (strip_index) {
            for (let key in strip_index) {
                let data = strip_index[key];
                if (!data) continue;
                let strip_node = this.nodeLine.getChildByName(`img_strip_${key}`);
                strip_node.active = true;
                let act_time = 0.3;
                strip_node.runAction(cc.repeatForever(cc.sequence(cc.fadeTo(act_time, 0x7f), cc.fadeTo(act_time, 0xff))));
            }
        }
    },
    //奖励动画显示延迟
    showStripEnd() {
        let delay_time;
        if (this.lbmgr.award_count) {
            delay_time = 2
        } else {
            delay_time = 0;
        }
        this.node.runAction(cc.sequence(cc.callFunc(() => {
            glGame.emitter.emit("lb.awardshow");
        }), cc.delayTime(delay_time), cc.callFunc(() => {
            glGame.emitter.emit("lb.myCoinshow");
        })))
    },

    //7，铃铛，星星，幸运草，柠檬，葡萄，樱桃
    //哪个位置亮起什么水果
    showSpine() {
        let resultArr = this.lbmgr.resultArr;
        let arr = [], resultType, first, scened, node, nodearr, posArrs = [], posArr = [];
        for (let i = 0; i < resultArr.length; i++) {
            arr = resultArr[i];
            resultType = this.lbmgr.getSameNumber(arr);
            nodearr = [];
            console.log("中奖数据-类型", resultType)
            for (let j = 0; j < arr.length; j++) {
                let key = Object.keys(arr[j])[0];
                if (arr[j][key] != resultType) {
                    if (nodearr.length >= 3) {
                        break;
                    } else {
                        nodearr = [];
                        posArr = [];
                        continue;
                    }
                }
                first = key.split("_")[0];
                scened = key.split("_")[1];
                node = this.nodeResult.children[first].children[scened];
                nodearr.push(node);
                posArr.push(key);
            }
            for (let i = 0; i < nodearr.length; i++) {
                let node = nodearr[i];
                node.getComponent(sp.Skeleton).skeletonData = this.skeletonDataList[resultType - 1];
                node.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
            }
            for (let i = 0; i < posArr.length; i++) {
                posArrs.push(posArr[i]);
            }
        }
        this.lbmgr.setShowArrPos(posArrs);
        glGame.emitter.emit("lb.hideStrip");
    },
});

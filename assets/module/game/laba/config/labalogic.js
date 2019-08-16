
let lbconfig = require("lbconfig");
let g_instance = null;
exports.getInstance = function () {
    if (!g_instance) {
        g_instance = new labaLogic;
        g_instance.registerEvent();
        g_instance.init();
    }
    return g_instance;
};

exports.destroy = function () {
    if (g_instance) {
        g_instance.destroy();
    }
};

class labaLogic {
    registerEvent() {
        glGame.emitter.on(glGame.room.getEnterRoom(glGame.scenetag.LABA), this.enterRoom, this);
        glGame.emitter.on("onInitRoom", this.connector_entryHandler_enterRoom, this);
        glGame.emitter.on(glGame.room.getPlayerOp(glGame.scenetag.LABA), this.PlayerOp, this); //玩家列表
        glGame.emitter.on("horseRaceLamp", this.onNotice, this); // 跑马灯
    }
    unregisterEvent() {
        glGame.emitter.off(glGame.room.getEnterRoom(glGame.scenetag.LABA), this);
        glGame.emitter.off(glGame.room.getPlayerOp(glGame.scenetag.LABA), this); //玩家列表
        glGame.emitter.off("onInitRoom", this);
        glGame.emitter.off("horseRaceLamp", this); // 跑马灯
    }
    onNotice = function (msg) {
        cc.log("---收到onNotice---", msg);
        if (msg.gameId != glGame.scenetag.LABA) return;
        let str = `恭喜玩家<color=#27d9ff>${msg.nickname}</c>在<color=#ffdd20>拉霸</c>内大赢特赢，获得<color=#00ff42>${Number(msg.winCoin).div(100)}</c>金币。`;
        glGame.notice.addContent(str);
    };
    //初始化数据
    init() {
        //this.reqGainLaba();
        this.strip_score = 0;
        this.pour_score = 0;
        this.myCoin = 0;
        this.show_multiple = {};
        this.resultArr = [];

        this.repeatInit();
    }
    //刷新数据
    repeatInit() {
        this.storage_key = "lbstorage";             //保存条目选线的key
        this.storage_index_key = "lbstorageindex";  //保存下注的索引值
        this.betData = {};                          //分线列表
        let betdata = glGame.storage.getItem(this.storage_key);
        if (betdata) this.betData = betdata;
        else {
            //为拉取到分线，默认初始化全部选中
            for (let i = 1; i <= 9; i++)
                this.betData[i] = 1;
        }
        let data_index = glGame.storage.getItem(this.storage_index_key);
        this.coin_index = data_index ? data_index.index : 1;    //选中下注的索引值
        this.strip_index = null;                            //胜利线条，以及胜利线条的奖励分数
        this.show_list = {};                                //最后显示的滚动条索引
        this.award_count = 0;                               //奖励数目
        this.initStripNode();
    }

    //显示滚动的节点
    initStripNode() {
        if (!this.showArrPos) {
            this.showArrPos = [];
            this.showArrNode = [];
            return;
        }
        for (let i = 0; i < this.showArrPos.length; i++) {
            let index = this.showArrPos[i].split("_")[1];
            let index1 = this.showArrPos[i].split("_")[0];
            let node = this.showArrNode[Number(index)].children[2 - Number(index1)];
            node.active = true;
        }
        this.showArrPos = [];
        this.showArrNode = [];
    }

    destroy() {
        this.unregisterEvent();
        g_instance = null;
        delete this;
    };
    enterRoom(msg) {
        console.log("这是当前的错误码", msg)
    };
    connector_entryHandler_enterRoom(msg) {
        let data = this.getconversion(msg.roomRule);
        this.http_reqGainLaba(data);
        this.myCoin = msg.seats[0].coin;
        glGame.emitter.emit("lb_initRoom");
    };
    PlayerOp(msg) {
        console.log("这是受到玩家操作的消息", msg)
        if (msg.subGameErrCode && msg.subGameErrCode == 3) {
            glGame.panel.showErrorTip("金币不足");
            return
        }
        this.http_reqStartLaba(msg)
    };
    //设置选线
    setStripBet(betdata) {
        this.betData = betdata;
        glGame.storage.setItem(this.storage_key, this.betData);
    }
    //设置下注索引
    setCoinIndex(index) {
        this.coin_index = index;
        glGame.storage.setItem(this.storage_index_key, { index: this.coin_index });
    }
    //游戏开始对于选中的线条进行下注赋值
    setStripPour() {
        for (let i = 1; i <= 9; i++) {
            if (this.betData[i] != 0) {
                this.betData[i] = this.strip_score;
            }
        }
    }
    //存展示龙骨动画的位置
    setShowArrPos(value) {
        this.showArrPos = value;
    }
    //得到展示龙骨动画的位置
    getShowArrPos() {
        return this.showArrPos;
    }
    //存展示龙骨动画的位置
    setShowArrNode(value) {
        this.showArrNode.push(value)
    }
    //得到展示龙骨动画的位置
    getShowArrNode() {
        return this.showArrNode;
    }
    //浮点型运算取俩位
    getFloat(value) {
        return (Number(value).div(100)).toString();
    }
    //强取两位小数
    getFixNumber(value) {
        return (Number(value).div(100).toFixed(2)).toString();
    }
    //获取线条列表
    getStripBet() {
        return this.betData;
    }
    //获取胜利线条，以及胜利线条的分数
    getStripIndex() {
        return this.strip_index;
    }
    //获取最后显示的滚动条索引
    getShowList() {
        return this.show_list;
    }
    //转换onEnterroom数据
    getconversion(roomRule) {
        let data = {};
        data.Chips = roomRule.Chips;
        data.weight = [];
        for (let i = 0; i < 21; i++) {
            data.weight.push({ id: i + 1, type: `Award${i + 1}`, score: roomRule[`Award${i + 1}`] })
        }
        return data;
    }
    //数组转换
    toOldStruct(resultArea) {
        let oldStruct = { 1: [], 2: [], 3: [], 4: [], 5: [] };
        resultArea.forEach((yArea, y) => {
            yArea.forEach((shape, x) => {
                oldStruct[x + 1][2 - y] = shape;
            })
        })
        return oldStruct;
    }
    //开始滚动发包
    reqStartLaba() {
        // let send = {
        //     "strip":this.betData,
        // }
        // console.log("这个是strip",send)
        // glGame.gameNet.send_msg("http.reqStartLaba", send, this.http_reqStartLaba.bind(this));
        let strip = [],
            base = 0;
        for (let key in this.betData) {
            if (this.betData[key] != 0) {
                strip.push(key)
                base = this.betData[key];
            }
        }
        let oprEvent = {
            oprType: 1,
            lines: strip,
            baseChip: base
        }
        this.payMoney = strip.length * base;
        glGame.gameNet.send_msg(glGame.room.getPlayerOp(glGame.scenetag.LABA), oprEvent);
    }
    // //数据获取发包
    // reqGainLaba(){
    //     glGame.gameNet.send_msg("http.reqGainLaba", {}, this.http_reqGainLaba.bind(this));
    // }
    //数据获取并进行赋值
    http_reqGainLaba(data) {
        console.log("数据获取并进行赋值", data);
        if (data) {
            for (let key in data.Chips) {
                lbconfig.set(`v_Chips${Number(key) + 1}`, data.Chips[key]);
            }
            this.show_multiple = data.weight;
            glGame.emitter.emit("lb.refreshstrip");
        }
    }
    //滚动结果收包
    http_reqStartLaba(data) {
        cc.log("中奖数据", data)
        this.strip_index = {};
        this.resultArea = data.resultArea;
        for (let i = 0; i < data.rewardLineIds.length; i++) {
            this.strip_index[data.rewardLineIds[i]] = data.rewardLineIds[i]
        }
        this.show_list = this.toOldStruct(data.resultArea);
        this.award_count = data.winCoin;
        this.myCoin = this.myCoin - this.payMoney + data.winCoin;
        glGame.emitter.emit("lb.startstrip");
        this.checkWinPos();
    }
    //===================开奖动画展示相关数据处理===================
    checkWinPos() {
        let Linearr = [];  //得出中奖的数据 -- [["1_0", "1_1", "1_2", "1_3", "1_4"]]
        let rewardLine = lbconfig.rewardLine;
        for (let key in this.strip_index) {
            Linearr.push(rewardLine[key])
        }
        cc.log("中奖数据-哪条线", Linearr)
        this.resultArr = [];
        let data, first, scened, arr = [];
        for (let i = 0; i < Linearr.length; i++) {
            let temparr = Linearr[i];
            arr = [];
            for (let j = 0; j < temparr.length; j++) {
                data = {};
                first = temparr[j].split("_")[0];
                scened = temparr[j].split("_")[1];
                data[temparr[j]] = this.resultArea[first][scened];
                arr.push(data);         //[{"1_0":3},{"2_0":3},{"3_0":3},{"4_0":3},{"5_0":3}]
            }
            this.resultArr.push(arr)         //[[{"1_0":3},{"2_0":3},{"3_0":3},{"4_0":3},{"5_0":3}],[]]
        }
        console.log("中奖数据-线", this.resultArr)
    }
    //得到开的是什么类型水果的奖
    getSameNumber(array) {
        let arr = []
        for (let i = 0; i < array.length; i++) {
            for (let key in array[i]) {
                arr.push(array[i][key])
            }
        }
        let data = arr.reduce(function (p, n) {
            if (!p[n]) {
                p[n] = 1;
            } else {
                p[n] += 1
            }
            return p
        }, {});
        for (let key in data) {
            if (data[key] >= 3) {
                return key
            }
        }
    }
    //===================开奖动画展示相关数据处理===================
};

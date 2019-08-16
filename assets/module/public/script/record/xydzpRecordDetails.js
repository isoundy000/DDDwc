glGame.baseclass.extend({
    properties: {
        node_value: cc.Node,
        content: cc.Node,
        item: cc.Node,

        gezi:[cc.Node]
    },
    onLoad() {
        this.roomType = {
            1:"初级房",2:"中级房",3:"高级房",4:"贵宾房",5:"富豪房",99:"体验房"
        }
        this.colorList = [1, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 2, 0, 2, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 2, 0, 2];
        this.resultDef = {
            37: "第一组",
            38: "第二组",
            39: "第三组",
            40: "1-12",
            41: "13-24",
            42: "25-36",
            43: "1-18",
            44: "双数",
            45: "红",
            46: "黑",
            47: "单数",
            48: "19-36"
        }
        this.RefreshInfo(this["recordDetailsData"]);
    },
    onClick(name, node) {
        switch (name) {
            case "close": this.close_cb(); break;
            default: console.error();
        }
    },

     //刷新数据
     RefreshInfo(data) {
        this.setTitle_value(data);
        let record = JSON.parse(this["recordDetailsData"].record);
        let winNum = record.winNum;
        this.setResult(winNum);
        let areaSettleInfo = record.areaSettleInfo;
        this.drawgezi(areaSettleInfo);
        this.setAreaInfo(areaSettleInfo);
    },

    //设置主标题的值
    setTitle_value(data) {

        let no = this.node_value.getChildByName("no").getComponent(cc.Label);
        no.string = data.hand_number;

        let roomType = this.node_value.getChildByName("roomType").getComponent(cc.Label);
        roomType.string = this.roomType[data.bettype];

        let winning_coin = this.node_value.getChildByName("winning_coin");
        winning_coin.getComponent(cc.Label).string = data.winning_coin>0?`+${this.cutDownNum(data.winning_coin)}`:this.cutDownNum(data.winning_coin);
        this.setLabelColor(winning_coin, data.winning_coin);

        let gain = this.node_value.getChildByName("gain");
        gain.getComponent(cc.Label).string = data.number>0?`+${this.cutDownNum(data.number)}`:this.cutDownNum(data.number);
        this.setLabelColor(gain, data.number);
    },

    //开奖结果
    setResult(value) {
        this.getBgColor(this.node_value.getChildByName("result"),this.colorList[value]);
        let label = this.node_value.getChildByName("result").children[0].getComponent(cc.Label);
        label.string = value;
    },

    //设置字体颜色
    setLabelColor(node, _value) {
        let value = Number(_value);
        node.color = value > 0 ? new cc.Color(0, 255, 0) : new cc.Color(255, 0, 0);
    },

    //渲染网格
    drawgezi(areaSettleInfo){
        let length =  Object.keys(areaSettleInfo).length;
        length = Math.ceil(length/2);
        for(let i=0; i<length; i++){
            let node;
            if(i==length-1){
                node = this.gezi[1];
            }else{
                node = this.gezi[0];
            }
            let node_gezi = cc.instantiate(node);
            node_gezi.active = true;
            node_gezi.parent = this.content;
        }
    },

    //渲染区域的数据
    setAreaInfo(areaSettleInfo) {
        let index = 0;
        for (let i in areaSettleInfo) {
            let node = cc.instantiate(this.item);
            let parentIndex  = Math.floor(index/2); 
            node.parent = this.content.children[parentIndex];
            index++;
            node.active = true;
            let listAreaIndex = i.split(",");
            listAreaIndex
            for (let j = 0; j < listAreaIndex.length; j++) {
                let length = listAreaIndex.length;          //下注数字的区域数
                listAreaIndex[j] =Number(listAreaIndex[j]);
                if (length == 1) {
                    if (listAreaIndex[j] <= 36) {
                        cc.log("进来渲染几次了")
                        node.getChildByName("area_sprite").active = true;
                        this.getBgColor(node.getChildByName("area_sprite"),this.colorList[listAreaIndex[j]]);
                        node.getChildByName("area_sprite").children[0].getComponent(cc.Label).string = listAreaIndex[j];
                    } else {
                        node.getChildByName("area_label").active = true;
                        node.getChildByName("area_label").getComponent(cc.Label).string = this.resultDef[listAreaIndex[j]];
                    }
                } else if (length > 1 && length <= 3) {
                    let item = cc.instantiate(node.getChildByName("area_sprite"));
                    item.parent = node.getChildByName("threeArea");
                    item.active = true;
                    item.scale =0.8;
                    this.getBgColor(item,this.colorList[listAreaIndex[j]]);
                    item.children[0].getComponent(cc.Label).string = listAreaIndex[j];
                } else {
                    cc.log("jici")
                    let item = cc.instantiate(node.getChildByName("area_sprite"));
                    item.parent = j >= 3 ? node.getChildByName("sixArea").children[1] : node.getChildByName("sixArea").children[0];
                    item.active = true;
                    item.scale =0.8;
                    this.getBgColor(item,this.colorList[listAreaIndex[j]]);
                    item.children[0].getComponent(cc.Label).string = listAreaIndex[j];
                }
            }
            let chipMoney = areaSettleInfo[i].chipMoney;
            let winloseMoney = areaSettleInfo[i].winloseMoney;
            node.getChildByName("beted").getComponent(cc.Label).string = this.cutDownNum(chipMoney);
            node.getChildByName("gain").getComponent(cc.Label).string = winloseMoney>0?`+${this.cutDownNum(winloseMoney)}`:this.cutDownNum(winloseMoney);
            this.setLabelColor(node.getChildByName("gain"), winloseMoney);
        }
    },
   
    getBgColor(node, index) {
        switch (index) {
            case 0: node.color = cc.color(6, 15, 13); break;
            case 1: node.color = cc.color(63, 181, 33); break;
            case 2: node.color = cc.color(157, 0, 4); break;
        }
    },

    close_cb() {
        if (this["modelType"] == 1) {
            this.node.parent.parent.getChildByName("panel").active = true;
            this.node.parent.parent.getChildByName("mask").active = true;
        }
        this.remove();
    },


    //截取小数点后两位
    cutDownNum (value, num = 2) {
        if (isNaN(value)) return;
        if (~~value === value) {
            return value.div(100).toString();
        } else {
            value = Number(value).div(100);
            return (Math.floor(value * 100) / 100).toFixed(num);
        }
    },

    OnDestroy() { },
    set(key, value) {
        this[key] = value;
    },
    get(key) {
        return this[key];
    }
});
glGame.baseclass.extend({
    properties: {
        exchangeTitle: cc.Node,
        listview: cc.Node,
        exchangeitem: cc.Node,
        exchangeAc:cc.Label,
        node_exchangeAc:cc.Node,
        tip:cc.Node,
        },
    onLoad () {
        this.resetData();
    },
    resetData () {
        this.exchangeState = ["等待审核", "兑换成功", "取消申请", "审核失败"];
        this.exchangeColor = [cc.color(255,144,0),cc.color(130, 184, 65),cc.color(255,255,255),cc.color(127,126,128)];
    },
    initUI () {
        switch (this["showModel"]) {
            case 1:
                this.exchangeAc.string = "支付宝账号";
                break;
            case 2:
                this.exchangeAc.string = "银行卡号";
                break;
        }
        glGame.gameNet.send_msg("http.reqWithdrawLog", {type: this["showModel"]}, (route, data)=>{
            this.updateItem(data);
        })
    },

    //浮点型运算取俩位
    getFloat(value, num = 2) {
        value = Number(value).div(100);
        if (isNaN(value)) return;
        if (~~value === value) {
            return value.toString();
        } else {
            return (Math.floor(value * 100) / 100).toFixed(num).toString();
        }
    },
    updateItem (data) {
        let exchangeInfo = data.list;
        let count = exchangeInfo.length;
        this.tip.active = count==0;
        for (let i=0; i<count; i++) {
            let info = exchangeInfo[i];
            let panel = cc.instantiate(this.exchangeitem);
            panel.parent = this.listview;
            panel.active = true;
            let bg = panel.getChildByName("bg")
            let coin = panel.getChildByName("coin").getComponent(cc.Label);
            let acc = panel.getChildByName("acc").getComponent(cc.Label);
            let time = panel.getChildByName("time").getComponent(cc.Label);
            let state = panel.getChildByName("state").getComponent(cc.Label);
            bg.active = i%2==0;
            coin.string = this.getFloat(info["amount"]);
            let strArr = info["payment_number"].split("");
            for (let i = 3; i < strArr.length - 4; i++) strArr[i] = "*";
            acc.string = strArr.join("");
            time.string = info["create_time"];
            state.string = this.exchangeState[info["status"]];
            state.node.color = this.exchangeColor[info["status"]];
           
            console.log("兑换记录", exchangeInfo[i]);
        }
    },
    onClick (name, node) {
        switch (name) {
            case "close": this.click_close(); break;
            default: console.error("no find button name -> %s", name);
        }
    },
    click_close () {
        this.remove();
    },
    set (key, value) {
        this[key] = value;
    },
    get (key) {
        return this[key];
    }
});


glGame.baseclass.extend({

    properties: {
        label1: cc.Label,
        label2: cc.Label,
        label3: cc.Label,
    },

    onLoad() {
        this.label1.string = `1.每日积分会实时结算刷新`;
        if (glGame.user.get("dialRefreshType") == 2) {
            this.label1.string = `1.积分每日${glGame.user.get("dialRefreshTime")}进行更新，更新时，将未使用的积分清零。然后将前24小时内的有效投注转化为积分。`;
        }
        this.label2.string = `2.积分转化比例：有效投注${this.getFloat(glGame.user.get("scoreBet"))}金币=1积分。`;
        this.label3.string = '3.转盘档次越高，每次抽奖需消耗的积分越多，奖励也越高';
    },

    onClick(name, node) {
        switch (name) {
            case 'close':
                this.remove();
                break;
            default:
                console.error("luckDrawHelp close botton error!!")
                break;
        }
    },

    getFloat(value) {
        return (Number(value).div(100)).toString();
    },

    // start () {},

    // update (dt) {},
});

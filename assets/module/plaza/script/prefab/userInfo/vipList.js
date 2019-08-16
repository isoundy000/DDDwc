
glGame.baseclass.extend({
    properties: {
        vipListItem: cc.Node,
        item:cc.Node,
        labRule: cc.RichText,
        listContent: cc.Node,

        titleLayout: cc.Node,
        lintLyout: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // this.reqVipData();
    },

    start() {
        this.node.getComponent(cc.Widget).updateAlignment();            //挂载到父节点要立刻刷新widget
        this.adaptation();
        this.reqVipData();
    },

    /**
     * title和item 
     * 1280的宽 layout spacingX = 60 , left  = 1280 - 8*100 -60*7 = 60/2 = 30
     * 990 的宽 layout   left  = 30/1280*990 = 23.2
     * 
     * line的left  比较好算
     * 1280   layout   left = 1280/8 = 160  layout spacingX = (1280-160*2-7*2)/6 = 157.7  160*2-左右2空隙  7*2-线本身的长度 6-6个空隙
     * 
     * 990    layout   left = 160/1280/990 = 123.75；
     */
    adaptation() {
        let width = this.node.width;

        let vipListLayout = this.item.getComponent(cc.Layout);
        vipListLayout.paddingLeft = 30 / 1280 * width;        //1280*720的屏幕下摆的    
        vipListLayout.spacingX = (width - 800 - (30 / 1280 * width * 2)) / 7;         //7个空隙
        vipListLayout.updateLayout();

        let titleLayout = this.titleLayout.getComponent(cc.Layout);
        titleLayout.paddingLeft = 30 / 1280 * width;        //1280*720的屏幕下摆的    
        titleLayout.spacingX = (width - 800 - (30 / 1280 * width * 2)) / 7;         //7个空隙
        titleLayout.updateLayout();

        let lintLyout = this.lintLyout.getComponent(cc.Layout);
        lintLyout.paddingLeft = 160 / 1280 * width;       //1280*720的屏幕下摆的    
        lintLyout.spacingX = (width - 2 * 7 - (160 / 1280 * width * 2)) / 6;
        lintLyout.updateLayout();

        this.labRule.maxWidth = width - 20;
    },

    reqVipData() {
        glGame.gameNet.send_msg("http.reqVip", {}, (route, data) => {
            console.log("vip列表信息", data)
            this.vipListData = data.result.list;
            this.upgradeType = data.result.upgradeType;
            this.curLevelID = data.result.accounts_vip_id;
            this.refreshVIPList();
            this.refreshVIPDes();
        })
    },

    refreshVIPList() {
        let totalPromotion = 0;
        for (let i = 0; i < this.vipListData.length; i++) {
            let curNode = cc.instantiate(this.vipListItem);
            curNode.parent = this.listContent;
            curNode.getChildByName("bg").active  = i % 2;

            let item = curNode.getChildByName("item");
            item.getChildByName("level").children[0].getComponent(cc.Label).string = "VIP." + this.vipListData[i].vip_name;
            item.getChildByName("level").children[0].color = i % 2 == 0 ? new cc.Color(239, 202, 135) : new cc.Color(255, 84, 0);
            let upgrade = this.upgradeType == 1 ? this.vipListData[i].recharge : this.vipListData[i].betting;
            item.getChildByName("totalBet").children[0].getComponent(cc.Label).string = this.cutFloat(upgrade);
            item.getChildByName("promotion").children[0].getComponent(cc.Label).string = this.cutFloat(this.vipListData[i].bonus_upgrade);
            item.getChildByName("weekAward").children[0].getComponent(cc.Label).string = this.cutFloat(this.vipListData[i].bonus_week);
            item.getChildByName("monthAward").children[0].getComponent(cc.Label).string = this.cutFloat(this.vipListData[i].bonus_month);
            totalPromotion = Number(totalPromotion).add(this.vipListData[i].bonus_upgrade);
            item.getChildByName("totalPromotion").children[0].getComponent(cc.Label).string = this.cutFloat(totalPromotion);
            let deposit = item.getChildByName("deposit");
            deposit.getChildByName("isDeposit").active = this.vipListData[i].recharge_setting_status == 1;
            deposit.getChildByName("noDeposit").active = this.vipListData[i].recharge_setting_status == 0;

            let service = item.getChildByName("service");
            service.getChildByName("isService").active = this.vipListData[i].own_custom_service == 1;
            service.getChildByName("noService").active = this.vipListData[i].own_custom_service == 0;

            curNode.active = true;
        }
    },

    refreshVIPDes() {
        let weekCoin = 0, monthCoin = 0, maxCoin = 0;
        for (let i = 0; i < this.vipListData.length; i++) {
            if (this.curLevelID == this.vipListData[i].id) {
                weekCoin = this.cutFloat(this.vipListData[i].bonus_week);
                monthCoin = this.cutFloat(this.vipListData[i].bonus_month);
            }
            maxCoin += this.vipListData[i].bonus_upgrade;
        }
        maxCoin = this.cutFloat(maxCoin);
        let str1 = "<color=#bdbcbc>即日起在游戏中</c><color=#d4be8e>永久累计打码</c><color=#bdbcbc>，让您的会员账号享有至高无上的价值，</c><color=#d4be8e>会员账号=金钱</c>"
        let str2 = `<color=#bdbcbc>，周赠</c><color=#ff5400>${weekCoin}元</c><color=#bdbcbc>，月赠</c><color=#ff5400>${monthCoin}元</c>`
        let str3 = `<color=#bdbcbc>，等级礼包最高可获得</c><color=#ff5400>${maxCoin}元</c><color=#bdbcbc>！您的每一笔棋牌投注都会永久累积，积累到一定标准。</c>`
        this.labRule.string = str1 + str2 + str3;
        cc.log(this.labRule.string)
    },

    cutFloat(num) {
        return (this.getFloat(Number(num).div(100))).toString();
    },


    //浮点型运算取俩位
    getFloat(value, num = 2) {
        value = Number(value);
        if (isNaN(value)) return;
        if (~~value === value) {
            return value.toString();
        } else {
            return (Math.floor(value * 100) / 100).toFixed(num);
        }
    },

    OnDestroy() {

    },

    // start () {},

    // update (dt) {},
});

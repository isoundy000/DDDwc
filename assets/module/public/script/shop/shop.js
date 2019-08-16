/**
 * 需要给服务端发送提交的字段
 *  $type = type类型
    $mid =id id
    $money = money 充值金额
    $accounts = accounts 充值人名字
    $order = order 充值订单号
    $bankType = bank_type 银行卡充值的充值类型
    $payAddr = bank_addr 银行卡充值的充值类型
 */
//type：类型 1-银行卡 2-微信支付 3-支付宝 4-财付通 5-QQ扫码 6-京东钱包 7-百度钱包  9-第三方支付类型  99 vip支付
const PAYTYPE =
{
    "atmpay": 1,
    "wechatpay": 2,
    "alipay": 3,
    "vippay": 99,
    "fastpay": 100,
}
const ICONINDEX =
{
    "1": 5,
    "2": 1,
    "3": 0,
    "99": 3,
    "100": 4,
}
let screenshot = require('ScreenShot');
glGame.baseclass.extend({
    properties: {
        audio:{
            type:cc.AudioClip,
            default: null
        },
        content: cc.Node,
        toggleContainer: cc.Node,
        prefab_shopZFBPanel: cc.Prefab,
        prefab_shopWXPanel: cc.Prefab,
        prefab_shopATMPanel: cc.Prefab,
        prefab_shopONLINEBANKPanel: cc.Prefab,
        prefab_shopVIPPanel: cc.Prefab,
        returnBtn: cc.Node,
        againBtn: cc.Node,
        commitSuccessAnim: sp.Skeleton,
        maskNode: cc.Node,
        leftNodeItem: cc.Node,
        iconList: [cc.SpriteFrame],

        code_bg: cc.Node,
        node_head: cc.Node,

        bigQRCode:cc.Node,
    },
    onLoad() {
        this.qqlist = [];
        this.wxlist = [];

        this.wxPanel = null;
        this.zfbPanel = null;
        this.vipPanel = null;
        this.bankPanel = null;

        glGame.audio.closeCurEffect();
        glGame.audio.playSoundEffect(this.audio, true);
        glGame.emitter.on("showShopUI", this.showUI, this)
        glGame.emitter.on("showSuccessAnim", this.showSuccessAnim, this);
        glGame.emitter.on("showWechatCode", this.initCode, this);
        glGame.emitter.on("shopActionEnd", this.shopActionEnd, this);
        glGame.emitter.on("saveCodeToLocalShop", this.saveCodeToLocalShop, this);
        if (isiPhoneX) {
            let panelwidth = this.node.getChildByName("panel").getComponent(cc.Widget);
            panelwidth.left += 35;
            panelwidth.updateAlignment();
        }
    },

    saveCodeToLocalShop(spriteFrame){
        this.bigQRCode.active = true;
        glGame.panel.showRemoteImage(this.bigQRCode.children[0], spriteFrame);
        screenshot.captureScreenshot('shareCode', this.bigQRCode);
    },

    shopActionEnd() {
        glGame.user.reqPayGoodsList();
    },

    initCode(msg) {
        this.code_bg.active = true;
        glGame.panel.showRemoteImage(this.node_head, msg.url)
    },
    showUI() {
        let shopData = glGame.user.ShopData;
        let setOne = true;
        for (let key = 0; key < shopData.length; key++) {
            if (!this.getNameByType(shopData[key].sub_type)) continue;
            let itemNode = cc.instantiate(this.leftNodeItem);
            itemNode.parent = this.toggleContainer;
            itemNode.getChildByName("Background").getChildByName("icon").getComponent(cc.Sprite).spriteFrame = this.iconList[ICONINDEX[shopData[key].sub_type]];
            let itemName = shopData[key].name;
            if (!shopData[key].name) {
                itemName = shopData[key].sub_type == 100 ? '快充中心' : 'vip支付';
            }
            itemNode.getChildByName("Background").getChildByName("label").getComponent(cc.Label).string = itemName;
            itemNode.getChildByName("checkmark").getChildByName("icon").getComponent(cc.Sprite).spriteFrame = this.iconList[ICONINDEX[shopData[key].sub_type]];
            itemNode.getChildByName("checkmark").getChildByName("label").getComponent(cc.Label).string = itemName;
            itemNode.name = this.getNameByType(shopData[key].sub_type);
            itemNode.payKey = key;
            itemNode.active = true;
            if (setOne) {               //打开第一个界面
                setOne = false;
                this.btn_1 = this.toggleContainer.children[0];
                this.btn_1.getComponent(cc.Toggle).isChecked = true;
                this.onClick(this.btn_1.name, this.btn_1);
            }
        }
    },

    getNameByType(type) {
        for (let key in PAYTYPE) {
            if (type == PAYTYPE[key]) return key;
        }
        return false;
    },

    cutFloat(num) {
        return (this.getFloat(Number(num).div(100)));
    },

    getFloat(value, num = 2) {
        value = Number(value);
        if (isNaN(value)) return;
        if (~~value === value) {
            return value.toString();
        } else {
            return (Math.floor(value * 100) / 100).toFixed(num);
        }
    },
    closeAllPanel() {
        cc.log("关闭全部界面")
        if (this.wxPanel) this.wxPanel.active = false;
        if (this.zfbPanel) this.zfbPanel.active = false;
        if (this.bankPanel) this.bankPanel.active = false;
        if (this.vipPanel) this.vipPanel.active = false;
    },
    onClick(name, node) {
        if (name == 'code_bg') {
            this.code_bg.active = false;
            return;
        }
        switch (name) {
            case "close_eff": this.click_close(); break;
            case "vippay": this.click_vippay(node); break;
            case "alipay": this.click_alipay(node); break;
            case "wechatpay": this.click_wechatpay(node); break;
            case "atmpay": this.click_atmpay(node); break;
            case "onlinebankpay": this.click_onlinebankpay(node); break;    //网银，5.29砍掉
            case "fastpay": this.click_fastpay(node); break;
            case "return": this.click_return(); break;
            case "again": this.click_again(); break;
            case "btn_saveCode": this.saveBigQRcodeSprite(); break;
            default: console.error("no find button name -> %s", name);
        }
    },

    //保存二维码
    saveBigQRcodeSprite() {
        screenshot.captureScreenshot('shareCode', this.code_bg);
    },

    click_vippay(node) {
        this.closeAllPanel();
        if (this.vipPanel) {
            this.vipPanel.active = true;
            let script = this.vipPanel.getComponent(this.vipPanel.name);
            script.initUI();
        } else {
            this.vipPanel = glGame.panel.showChildPanel(this.prefab_shopVIPPanel, this.content);
            let script = this.vipPanel.getComponent(this.vipPanel.name);
            script.refPayData(node.payKey);
        }
    },

    click_fastpay(node) {
        let shopData = glGame.user.ShopData;
        let url = shopData[node.payKey].link;
        cc.sys.openURL(url);
    },

    click_alipay(node) {
        this.closeAllPanel();
        if (this.zfbPanel) {
            this.zfbPanel.active = true;
            let script = this.zfbPanel.getComponent(this.zfbPanel.name);
            script.refPayData(node.payKey);
        } else {
            this.zfbPanel = glGame.panel.showChildPanel(this.prefab_shopZFBPanel, this.content);
            let script = this.zfbPanel.getComponent(this.zfbPanel.name);
            script.refPayData(node.payKey);
        }
    },
    click_wechatpay(node) {
        this.closeAllPanel();
        if (this.wxPanel) {
            this.wxPanel.active = true;
            let script = this.wxPanel.getComponent(this.wxPanel.name);
            script.refPayData(node.payKey);
        } else {
            this.wxPanel = glGame.panel.showChildPanel(this.prefab_shopWXPanel, this.content);
            let script = this.wxPanel.getComponent(this.wxPanel.name);
            script.refPayData(node.payKey);
        }
    },
    click_atmpay(node) {
        this.closeAllPanel();
        if (this.bankPanel) {
            this.bankPanel.active = true;
            let script = this.bankPanel.getComponent(this.bankPanel.name);
            script.refPayData(node.payKey);
        } else {
            this.bankPanel = glGame.panel.showChildPanel(this.prefab_shopATMPanel, this.content);
            let script = this.bankPanel.getComponent(this.bankPanel.name);
            script.refPayData(node.payKey);
        }
    },

    click_onlinebankpay(node) {
        this.closeAllPanel();
        if (this.onlinebankPanel) {
            this.onlinebankPanel.active = true;
            let script = this.onlinebankPanel.getComponent(this.onlinebankPanel.name);
            script.refPayData(node.payKey);
        } else {
            this.onlinebankPanel = glGame.panel.showChildPanel(this.prefab_shopONLINEBANKPanel, this.content);
            let script = this.onlinebankPanel.getComponent(this.onlinebankPanel.name);
            script.refPayData(node.payKey);
        }
    },

    click_close() {
        glGame.panel.revertOpenNodeEffect(this.node, 2).then(() => { this.remove() });
        let nodeName = null;
        if (this.node.parent.getChildByName("longhudouentry")) nodeName = "longhudouentry";
        glGame.emitter.emit("plazaOpen", nodeName)
    },

    click_return() {
        this.click_close();
    },

    click_again() {
        this.commitSuccessAnim.node.active = false;
        this.maskNode.active = false;

        for (let i = 0; i < this.toggleContainer.childrenCount; i++) {
            if (this.toggleContainer.children[i].getComponent(cc.Toggle).isChecked) {
                this.onClick(this.toggleContainer.children[i].name, this.toggleContainer.children[i]);
            }
        }
    },

    showSuccessAnim() {
        this.commitSuccessAnim.node.active = true;
        this.maskNode.active = true;
        this.commitSuccessAnim.setAnimation(0, "tijiaochenggong", false);
        this.commitSuccessAnim.setCompleteListener((trackEntry, loopCount) => {
            let name = trackEntry.animation ? trackEntry.animation.name : '';
            if (name == "tijiaochenggong" || name == "duihuanchenggong") {
                this.returnBtn.active = true;
                this.againBtn.active = true;
            }
        })
    },

    OnDestroy() {
        glGame.emitter.off("showShopUI", this);
        glGame.emitter.off("showSuccessAnim", this);
        glGame.emitter.off("showWechatCode", this);
        glGame.emitter.off("shopActionEnd", this);
        glGame.emitter.off("saveCodeToLocalShop", this);
    }
});

glGame.baseclass.extend({
    properties: {
        node_content: cc.Node,
        node_gz:cc.Node,
        //龙虎斗
        longhudouUI: [cc.SpriteFrame],
        //红黑
        hongheiUI: [cc.SpriteFrame],
        //大转盘
        dazhuanpanUI: [cc.SpriteFrame],
        //水果机
        shuiguojiUI: [cc.SpriteFrame],
        //拉霸
        labaUI: [cc.SpriteFrame],
        //百人牛牛
        brnnUI: [cc.SpriteFrame],
        //德州扑克
        dezhoupkUI: [cc.SpriteFrame],
        //斗地主
        doudizhuUI: [cc.SpriteFrame],
        //抢庄牛牛
        qznnUI: [cc.SpriteFrame],
        //三公
        sangongUI: [cc.SpriteFrame],
        //炸金花
        zhajinhuaUI: [cc.SpriteFrame],
        //牌九
        paijiuUI: [cc.SpriteFrame],
        //百家乐
        baijialeUI: [cc.SpriteFrame],
        //极速炸金花
        jszjhUI: [cc.SpriteFrame],
        //二八杠
        ebgUI: [cc.SpriteFrame],
        //21点
        esydUI: [cc.SpriteFrame],
        //捕鱼
        fishUI: [cc.SpriteFrame],
        //抢红包
        qhbjlUI: [cc.SpriteFrame],
        //十三水
        sssUI: [cc.SpriteFrame],
        //豪车漂移
        hcpyUI: [cc.SpriteFrame],
        //森林舞会
        slwhUI: [cc.SpriteFrame],
    },
    onLoad () {
      
    },
    // updateUI (gameid) {
    //     let gameName = glGame.room.getGameNameById(gameid);
    //     this.replaceWebUrl(1);
    //     // let count = this.changeSpriteNode.length;
    //     // for (let i=0; i<count; i++) {
    //     //     if(!this[`${gameName}UI`])continue;
    //     //     this.changeSpriteNode[i].spriteFrame = this[`${gameName}UI`][i];
    //     // }
    //     // count = this.changePositionNode.length;
    //     // for (let i=0; i<count; i++) {
    //     //     if(!this[`${gameName}Pos`])continue;
    //     //     this.changePositionNode[i].setPosition(this[`${gameName}Pos`][i]);
    //     // }
    //     if(!this[`${gameName}ToggleTitle`]){
    //         this.webContent.node.y = -30;
    //         this.webContent.node.height = 420;
    //         return;
    //     }
    //     let toggletitle =this[`${gameName}ToggleTitle`].split(",");
    //     for (let i=0; i<toggletitle.length; i++) {
    //         let item = cc.instantiate(this.selectItem);
    //         item.name = `toggle_${i}`;
    //         let background = item.getChildByName("Background");
    //         let checkmark = item.getChildByName("checkmark");
    //         let backgroundlabel = background.children[0];
    //         let checkmarklabel= checkmark.children[0];
    //         if(i==0){
    //             background.getComponent(cc.Sprite).spriteFrame = this.commonSelectBg[0];
    //             checkmark.getComponent(cc.Sprite).spriteFrame = this.commonSelectBg[1];
    //             backgroundlabel.getComponent(cc.Label).string = toggletitle[i];
    //             checkmarklabel.getComponent(cc.Label).string = toggletitle[i];
    //             background.scaleX = -1;
    //             checkmark.scaleX = -1;
    //             backgroundlabel.scaleX = -1;
    //             checkmarklabel.scaleX = -1;
    //         }else if(i==toggletitle.length-1){
    //             background.getComponent(cc.Sprite).spriteFrame = this.commonSelectBg[0];
    //             checkmark.getComponent(cc.Sprite).spriteFrame = this.commonSelectBg[1];
    //             backgroundlabel.getComponent(cc.Label).string = toggletitle[i];
    //             checkmarklabel.getComponent(cc.Label).string = toggletitle[i];
    //             background.scaleX = 1;
    //             checkmark.scaleX = 1;
    //             backgroundlabel.scaleX = 1;
    //             checkmarklabel.scaleX = 1;
    //         }else{
    //             background.getComponent(cc.Sprite).spriteFrame = this.commonSelectBg[2];
    //             checkmark.getComponent(cc.Sprite).spriteFrame = this.commonSelectBg[3];
    //             backgroundlabel.getComponent(cc.Label).string = toggletitle[i];
    //             checkmarklabel.getComponent(cc.Label).string = toggletitle[i];
    //         }
    //         item.parent = this.selectView;
    //         item.y = 0;
    //         item.active = true;
    //     }
    // },
    updateUI(gameid){
        let nowGame = null;
        switch(gameid){
            case glGame.scenetag.ZHAJINHUA:nowGame = this.zhajinhuaUI; break;
            case glGame.scenetag.QZNN: nowGame = this.qznnUI; break;
            case glGame.scenetag.BRNN: nowGame = this.brnnUI; break;
            case glGame.scenetag.SANGONG: nowGame = this.sangongUI; break;
            case glGame.scenetag.HONGHEI: nowGame = this.hongheiUI; break;
            case glGame.scenetag.SHUIGUOJI: nowGame = this.shuiguojiUI; break;
            case glGame.scenetag.LONGHUDOU: nowGame = this.longhudouUI; break;
            case glGame.scenetag.LABA: nowGame = this.labaUI; break;
            case glGame.scenetag.BAIJIALE: nowGame = this.baijialeUI; break;
            case glGame.scenetag.PAIJIU: nowGame = this.paijiuUI; break;
            case glGame.scenetag.LUCKTURNTABLE: nowGame = this.dazhuanpanUI; break;
            case glGame.scenetag.DZPK: nowGame = this.dezhoupkUI; break;
            case glGame.scenetag.DDZ: nowGame = this.doudizhuUI; break;
            case glGame.scenetag.JSZJH: nowGame = this.jszjhUI; break;
            case glGame.scenetag.EBG: nowGame = this.ebgUI; break;
            case glGame.scenetag.ESYD: nowGame = this.esydUI; break;
            case glGame.scenetag.FISH: nowGame = this.fishUI; break;
            case glGame.scenetag.QHBJL: nowGame = this.qhbjlUI; break;
            case glGame.scenetag.SSS: nowGame = this.sssUI; break;
            case glGame.scenetag.HCPY: nowGame = this.hcpyUI; break;
            case glGame.scenetag.SLWH: nowGame = this.slwhUI; break;
            default:
            break;
        }
        if (nowGame){
            for (let i=0, count = nowGame.length; i< count; i++){
                let node_rule = cc.instantiate(this.node_gz);
                node_rule.active = true;
                node_rule.getComponent(cc.Sprite).spriteFrame = nowGame[i];
                node_rule.parent = this.node_content;
                if(gameid == glGame.scenetag.SLWH){
                    this.node_content.scaleX = 0.9;
                }else{
                    this.node_content.scaleX = 1;
                }
            }
        }
    },
    // replaceWebUrl(tag){
    //     this.webContent.url = glGame.servercfg.getGameRuleURL(tag, this.gameName);
    // },
    onClick (name, node) {
        // if (name.indexOf("toggle_") > -1) {
        //     return this.replaceWebUrl(parseInt(name.split("_")[1])+1)
        // }
        switch(name){
            case 'close':
                console.log('click back')
                this.remove();
                break;
        }
    }
});

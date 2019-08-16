glGame.baseclass.extend({
    
        properties: {
            pokerAlast: cc.SpriteAtlas,

    
            gameSeries: cc.Label,
            gameType: cc.Label,
            gameBaseBet: cc.Label,
            gameProfit: cc.Node,
            cardinfo:cc.Node,
            sprite_cardType:[cc.SpriteFrame],
            sprite_Special:[cc.SpriteFrame],
        },
    
        onLoad () {
            this.loseFntColor = new cc.Color(255, 60, 60);//红色
            this.winFntColor = new cc.Color(102, 255, 0);//绿色
            this.initData();
            this.refreshGameInfoContent();
            this.refreshPlayerItem();
        },
    
        initData () {
            console.log("recordrecordrecordrecord", this.recordDetailsData);
            this.roomTypeTitle = ['初级房', '中级房', '高级房', '贵宾房', '富豪房', '体验房'];
            this.seriesNum = this.recordDetailsData.hand_number;
            this.roomType = this.recordDetailsData.bettype;
            this.baseBet = this.recordDetailsData.baseChip;
            this.winCoin = this.recordDetailsData.number;
            this.gainFee = this.recordDetailsData.gainFee;
            this.players = JSON.parse(this.recordDetailsData.record);
            console.log("recordrecordrecordrecord2", this.players);
        },
    
        refreshGameInfoContent () {
            
            this.gameSeries.string = this.seriesNum;
            this.gameType.string = this.roomTypeTitle[this.roomType-1];
            this.gameBaseBet.string = this.getFloat(this.baseBet);
            let winNum = this.getFloat(this.winCoin);
            this.gameProfit.getComponent(cc.Label).string = winNum>0 ? `+${winNum}` : winNum;
            this.gameProfit.color = winNum>0 ? new cc.Color(0, 255, 0) : new cc.Color(255, 0, 0);
        },
        //设置牌值，牌型，对局状态
        setCardValue(cards,cardNode,player,isDouble){

        },
        refreshPlayerItem () {
            let allPlayer =this.players.players;
            let index = 0;
            for(let key in allPlayer){
                if (key == glGame.user.get("logicID")) {
                   this.cardinfo.children[index].getChildByName('layout').children[0].color =  new cc.Color(255, 108, 0);//橙色
                }
                this.cardinfo.children[index].getChildByName('layout').children[0].getComponent(cc.Label).string = allPlayer[key].nickname;
               let arr = JSON.parse(allPlayer[key].handcards); 
                console.log('allPlayer[key].handcards',allPlayer[key].handcards,allPlayer[key].handcards.length,arr) 
                for(let i = 0 ;i<arr[0].length;i++){
                   this.cardinfo.children[index].getChildByName('cards').children[0].children[i].getComponent(cc.Sprite).spriteFrame = this.pokerAlast.getSpriteFrame(this.getSixValue(arr[0][i])) ;
                }
                for(let j = 0 ; j<arr[1].length;j++){
                    this.cardinfo.children[index].getChildByName('cards').children[1].children[j].getComponent(cc.Sprite).spriteFrame = this.pokerAlast.getSpriteFrame(this.getSixValue(arr[1][j])) ;
                }
                for(let x = 0;x<arr[2].length;x++){
                    this.cardinfo.children[index].getChildByName('cards').children[2].children[x].getComponent(cc.Sprite).spriteFrame = this.pokerAlast.getSpriteFrame(this.getSixValue(arr[2][x])) ;
                }
                if(allPlayer[key].teshu){
                    this.cardinfo.children[index].getChildByName('dun_type').active = false;
                    this.cardinfo.children[index].getChildByName('teshu_type').active = true;
                    let type = this.getSpecialType(allPlayer[key].teshu)
                    this.cardinfo.children[index].getChildByName('teshu_type').children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_Special[type]
                }else{
                    this.showEachDunType(allPlayer[key].qianType,this.cardinfo.children[index].getChildByName('dun_type').children[0],0)
                    this.showEachDunType(allPlayer[key].zhongType,this.cardinfo.children[index].getChildByName('dun_type').children[1],1)
                    this.showEachDunType(allPlayer[key].houType,this.cardinfo.children[index].getChildByName('dun_type').children[2],1)
                }
                this.cardinfo.children[index].getChildByName('settle').color = allPlayer[key].winCoin >=0? this.winFntColor:this.loseFntColor;
                this.cardinfo.children[index].getChildByName('settle').getComponent(cc.Label).string = allPlayer[key].winCoin >=0? '+' +glGame.user.GoldTemp(allPlayer[key].winCoin):glGame.user.GoldTemp(allPlayer[key].winCoin);
                this.cardinfo.children[index].getChildByName('shui').getComponent(cc.Label).string = allPlayer[key].zongfen + '水'
                this.cardinfo.children[index].getChildByName('shui').color = allPlayer[key].zongfen >0?new cc.Color(255, 150, 0):new cc.Color(25, 242, 250);//橙色
                index++;
            }
    
        },
    
        refreshCards (nodes, cardData) {
            for (let i=0; i<cardData.length; i++) {
                nodes[i].getComponent(cc.Sprite).spriteFrame = this.pokerAlast.getSpriteFrame(this.getSixValue(cardData[i]));
            }
        },
    
        getSixValue(card) {
            card = parseInt(card);
            let str = card < 14 ?  "bull1_0x0" : "bull1_0x";
            return str + card.toString(16);
        },
    
        onClick (name, node) {
            switch (name) {
                case "btn_close": this.close_cb(); break;
                default: console.error(name);
            }
        },
    
        close_cb() {
            if (this["modelType"] == 1) {
                this.node.parent.parent.getChildByName("panel").active = true;
                this.node.parent.parent.getChildByName("mask").active = true;
            }
            this.remove();
        },
    
        getFloat (value) {
            return (Number(value).div(100)).toString();
        },
    
        set (key, value) {
            this[key] = value;
        },
    
        get (key) {
            return this[key];
        },
 
        getCardvalue(logicNum) {
            let value = logicNum & 0x0f;
            if (value >= 10) { value = 10; }
            return value;
        },

        showEachDunType(type,node,index){
            node.active = true;
            switch(type){
                case 1:
                node.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_cardType[0];
                break;
                case 2:
                node.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_cardType[1];
                break;
                case 3:
                node.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_cardType[2];
                break;
                case 4:
                node.children[0].getComponent(cc.Sprite).spriteFrame = index == 0?this.sprite_cardType[11]:this.sprite_cardType[3];
                break;
                case 5:
                node.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_cardType[4];
                break;
                case 6:
                node.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_cardType[4];
                break
                case 7:
                node.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_cardType[4];
                break
                case 8:
                node.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_cardType[5];
                break;
                case 9:
                    node.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_cardType[6];
                break;
                case 15:
                node.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_cardType[7];
                break;
                case 16:
                node.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_cardType[8];
                break;
                case 17:
                node.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_cardType[8];
                break;
                case 18:
                node.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_cardType[8];
                break;
                case 44:
                node.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_cardType[9];
                break;
                case 100:
                node.children[0].getComponent(cc.Sprite).spriteFrame = this.sprite_cardType[10];
                break;
            }
            
        },
        getSpecialType(type){
            switch(type){
                case 526: //同花十三水,清龙 
                return 0 ;
                break;
                case 425://十三水，一条龙 
                return 1 ;
                break;
                case 124://四套冲三：  
                return 2 ;
                break;
                case 223://三炸弹，三分天下
                return 3 ;
                break;
                case 322://十二皇族，
                return 4 ;
                break
                case 321://三同花顺， 
                return 5 ;
                break
                case 220://全大： 
                return 6 ;
                break
                case 219://全小： 
                return 7 ;
                break;
                case 218://凑一色：
                return 8 ;
                break;
                case 117: //五对冲三，
                return 9 ;
                break;
                case 116://六对半，报道六队半， 
                return 10 ;
                break;
                case 115://三同花，报道三同花
                return 11 ;
                break;
                case 114: //三顺子，三顺子
                return 12 ;
                break;
    
            }
        },
        // start () {
    
        // },
        // update (dt) {},
    });
    
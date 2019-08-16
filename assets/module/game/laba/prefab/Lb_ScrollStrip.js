

const SCROLL_STRIP = {
    SHOW_1: 0,
    SHOW_2: 1,
    SHOW_3: 2,
}

const STRIP_PIC = {
    PIC_TYPE_1: 1,
    PIC_TYPE_2: 2,
    PIC_TYPE_3: 3,
    PIC_TYPE_4: 4,
    PIC_TYPE_5: 5,
    PIC_TYPE_6: 6,
    PIC_TYPE_7: 7,
}

glGame.baseclass.extend({

    properties: {
        pic_1: cc.SpriteFrame,   //葡萄
        pic_2: cc.SpriteFrame,   //苹果
        pic_3: cc.SpriteFrame,   //西瓜
        pic_4: cc.SpriteFrame,   //樱桃
        pic_5: cc.SpriteFrame,   //柠檬
        pic_6: cc.SpriteFrame,   //爱心
        pic_7: cc.SpriteFrame,   //铃铛
        show_1: cc.Sprite,
        show_2: cc.Sprite,
        show_3: cc.Sprite,
    },

    onLoad() {
    },

    start() {
    },
    //设置索引图片
    setSonShow(sprite_obj, index) {
        switch (index) {
            case STRIP_PIC.PIC_TYPE_1:
                sprite_obj.spriteFrame = this.pic_1;
                break;
            case STRIP_PIC.PIC_TYPE_2:
                sprite_obj.spriteFrame = this.pic_2;
                break;
            case STRIP_PIC.PIC_TYPE_3:
                sprite_obj.spriteFrame = this.pic_3;
                break;
            case STRIP_PIC.PIC_TYPE_4:
                sprite_obj.spriteFrame = this.pic_4;
                break;
            case STRIP_PIC.PIC_TYPE_5:
                sprite_obj.spriteFrame = this.pic_5;
                break;
            case STRIP_PIC.PIC_TYPE_6:
                sprite_obj.spriteFrame = this.pic_6;
                break;
            case STRIP_PIC.PIC_TYPE_7:
                sprite_obj.spriteFrame = this.pic_7;
                break;
            default:
                break;
        }
    },
    //设置n个图片
    SetShow(show_list) {
        for (let key in show_list) {
            let data = show_list[key];
            if (key == SCROLL_STRIP.SHOW_1) {
                this.setSonShow(this.show_1, data);
            } else if (key == SCROLL_STRIP.SHOW_2) {
                this.setSonShow(this.show_2, data);
            } else if (key == SCROLL_STRIP.SHOW_3) {
                this.setSonShow(this.show_3, data);
            }
        }
    }
});

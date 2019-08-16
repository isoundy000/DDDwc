
glGame.baseclass.extend({

    properties: {
        singleMale:{
            type:cc.AudioClip,
            default:[]
        },
        doubleMale:{
            type:cc.AudioClip,
            default:[]
        },
        singleFemale:{
            type:cc.AudioClip,
            default:[]
        },
        doubleFemale:{
            type:cc.AudioClip,
            default:[]
        },
        cardTypeMale:{
            type:cc.AudioClip,
            default:[]
        },
        cardTypeFemale:{
            type:cc.AudioClip,
            default:[]
        },
    },

    onLoad () {
        glGame.emitter.on("playAudio", this.playAudio, this);
    },

    playAudio (msg) {
        let str = msg.sex==1 ? "Male" : "Female";
        let audioArr = null;
        console.log("出牌音效0", msg);
        switch(msg.cardType) {
            case 1:
                audioArr = this["single"+str];
                console.log("出牌音效1", audioArr)
                glGame.audio.playSoundEffect(audioArr[msg.value-1]);
                break;
            case 2:
                audioArr = this["double"+str];
                console.log("出牌音效2", audioArr)
                glGame.audio.playSoundEffect(audioArr[msg.value-1]);
                break;
            default:
                audioArr = this["cardType"+str];
                let index = msg.cardType>6 ? msg.cardType-4 : msg.cardType-3;
                glGame.audio.playSoundEffect(audioArr[index]);
                break;
        }
    },

    OnDestroy () {
        glGame.emitter.off("playAudio", this);
    },


    // update (dt) {},
});

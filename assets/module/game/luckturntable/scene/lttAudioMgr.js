glGame.baseclass.extend({
    properties: {
        BGM: {
            type: cc.AudioClip,
            default: null
        },
        ksxz: {
            type: cc.AudioClip,
            default: null
        },
        xzjs: {
            type: cc.AudioClip,
            default: null
        },
        ballRotate: {
            type: cc.AudioClip,
            default: null
        },
        numberRun: {
            type: cc.AudioClip,
            default: null
        },
        bet: {
            type: cc.AudioClip,
            default: null
        },
        win: {
            type: cc.AudioClip,
            default: null
        },
        lose: {
            type: cc.AudioClip,
            default: null
        },
        otherBet: {
            type: cc.AudioClip,
            default: null
        },
        clickChips: {
            type: cc.AudioClip,
            default: null
        },
        flyToPlayer: {
            type: cc.AudioClip,
            default: null
        },
        timeDown:{
            type: cc.AudioClip,
            default: []
        },
        resultAudio:{
            type: cc.AudioClip,
            default: []
        },

        turnTable: {
            type: cc.AudioClip,
            default: null
        },
        luozi: {
            type: cc.AudioClip,
            default: null
        },
    },

    playBGM() {
        glGame.audio.playBGM(this.BGM);
    },

    stopBGM() {
        glGame.audio.stopCurBGM();
    },

    playClockEffect(bool) {
        bool ? glGame.audio.playSoundEffect(this.timeDown[0]) : glGame.audio.playSoundEffect(this.timeDown[1])
    },

    playResultEffect(result) {
        glGame.audio.playSoundEffect(this.resultAudio[result])
    },

    playEffect(audioName) {
        glGame.audio.playSoundEffect(this[audioName])
    },

    playBallRotate() {
        if (!glGame.audio.BGMSE["SoundEffectPlayState"]) return;
        this.ballId = cc.audioEngine.play(this.turnTable, false, glGame.audio.BGMSE["SoundEffectVolume"]);
    },

    stopBallRotate() {
        if (this.ballId) {
            cc.audioEngine.stop(this.ballId);
            this.ballId = null;
        }
    },

    stopAllAudio() {
        glGame.audio.stopAllMusic();
    },
    // update (dt) {},
});

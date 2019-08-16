
glGame.baseclass.extend({
    properties: {
        duihuanSpine: sp.Skeleton,
        closeNode: cc.Node,
        duihuanSpData: sp.SkeletonData,
    },


    onLoad() {
       this.registerEvent();
    },

    start() {

    },
    showSuccess(msg){
        this.closeNode.active = false;
        let spine = this.duihuanSpine;
        spine.skeletonData = this.duihuanSpData;
        spine.animation = msg.name;
        // 动画的结束回调
        spine.setCompleteListener((trackEntry, loopCount) => {
            let name = trackEntry.animation ? trackEntry.animation.name : '';
            
            if (name === 'tixianchenggong'||name ==='tijiaochenggong') {
                this.closeNode.active = true;
                // 动画结束后执行自己的逻辑
                console.log('动画播放结束');
            }
        });
    },
    registerEvent() {
        glGame.emitter.on('exchangeWin1',this.showSuccess,this)
    },
    unRegisterEvent() {
        glGame.emitter.off('exchangeWin1',this)
    },
    OnDestroy() {
        this.unRegisterEvent();
    },
    duihuan_close() {
        this.remove();
    },

    // update (dt) {},
});

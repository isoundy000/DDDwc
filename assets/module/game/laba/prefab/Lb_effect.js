
glGame.baseclass.extend({

   properties: {
      downpar: cc.Node,
      uppar: cc.Node,
      flash_node: cc.Node
   },

   // LIFE-CYCLE CALLBACKS:

   onLoad() {
      this.initflash();
      glGame.emitter.on("lb.startstrip", this.startstrip, this);
      glGame.emitter.on("lb.stopstrip", this.stopstrip, this);
      this.seteffect(false)
   },
   initflash() {
      for (let i = 0; i < 18; i++) {
         let flash = cc.instantiate(this.flash_node);
         flash.position = cc.v2(0, 0);
         flash.active = true;
         flash.parent = this.downpar;
      }
      for (let i = 0; i < 17; i++) {
         let flash = cc.instantiate(this.flash_node);
         flash.position = cc.v2(0, 0);
         flash.active = true;
         flash.parent = this.uppar;
      }
   },
   startstrip() {
      this.seteffect(true)
   },
   stopstrip() {
      this.seteffect(false)
   },
   seteffect(bool) {
      for (let i = 0; i < this.node.children.length; i++) {
         this.node.children[i].active = bool;
      }
   },
   OnDestroy() {
      glGame.emitter.off("lb.startstrip", this);
      glGame.emitter.off("lb.stopstrip", this);
   }
});

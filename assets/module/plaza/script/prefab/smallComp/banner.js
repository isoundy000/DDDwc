/**
 * 当手动滑动时，屏蔽自动滑动
 * 当自动滑动时，开启遮罩，防止连续滑动
 * 当手动滑动时，开启遮罩，防止连续滑动 
 */
glGame.baseclass.extend({
    properties: {
        page1: {
            default: null,
            type: cc.Node
        },
        page2: {
            default: null,
            type: cc.Node
        },
        page3: {
            default: null,
            type: cc.Node
        },
        pageTouch: {
            default: null,
            type: cc.Node
        },
        mask: {
            default: null,
            type: cc.Node
        },
        dianGroup: {
            default: null,
            type: cc.Node
        },
        dianItem: {
            default: null,
            type: cc.Node
        },
    },

    onLoad: function () {
        glGame.emitter.on("initBillBoradsUI", this.initBillBoradsUI, this)
        this.lastPage = this.page1;
        this.curPage = this.page2;
        this.nextPage = this.page3;
        this.pages = [this.page1, this.page2, this.page3]
        this.moveBool = true;                           //是否在移动
        this.DTY = 0;
        this.curIndex = 0;
        this.nextIndex = 0;
        this.laseIndex = 0;
        this.isCanMove = false;                        //开启监听  只有1页的时候不需要开启
    },

    start() {
        glGame.user.reqBillboards();
    },

    initBillBoradsUI(data) {
        this.bannerData = data.list;
        this.loop = data.loop;
        this.curIndex = 0;

        if (this.bannerData.length == 1) {
            glGame.panel.showRemoteImage(this.pages[1].children[0], this.bannerData[0].img);    //中间渲染
            this.pageTouch.on(cc.Node.EventType.TOUCH_START, this.click_pageTouch, this)
        } else if (this.bannerData.length == 2) {
            glGame.panel.showRemoteImage(this.pages[0].children[0], this.bannerData[1].img);    //中间渲染
            glGame.panel.showRemoteImage(this.pages[1].children[0], this.bannerData[0].img);    //中间渲染
            glGame.panel.showRemoteImage(this.pages[2].children[0], this.bannerData[1].img);    //中间渲染
            this.isCanMove = true;
        } else if (this.bannerData.length >= 2) {
            let item = this.pages[0];
            glGame.panel.showRemoteImage(item.children[0], this.bannerData[this.bannerData.length - 1].img);
            for (let i = 1; i < this.pages.length; i++) {
                item = this.pages[i];
                glGame.panel.showRemoteImage(item.children[0], this.bannerData[i - 1].img);
            }
            this.isCanMove = true;
        }
        if (this.isCanMove) this.registerTouchEvent();
        this.initDian();
        this.initDianState();

        //开启自动滑动
        if (this.isCanMove && this.loop > 0) {
            this.schedule(this.runPage, this.loop)
        }
    },
    //初始化点
    initDian() {
        for (let i = 0; i < this.bannerData.length; i++) {
            let item = cc.instantiate(this.dianItem);
            item.parent = this.dianGroup;
            item.active = true;
        }
    },
    //初始化点的状态
    initDianState() {
        for (let i = 0; i < this.dianGroup.childrenCount; i++) {
            let node = this.dianGroup.children[i];
            node.children[0].active = i == this.curIndex
        }
    },

    registerTouchEvent() {
        this.pageTouch.on(cc.Node.EventType.TOUCH_START, this.touchstart, this)
        this.pageTouch.on(cc.Node.EventType.TOUCH_MOVE, this.touchmove, this)
        this.pageTouch.on(cc.Node.EventType.TOUCH_END, this.touchend, this)
        this.pageTouch.on(cc.Node.EventType.TOUCH_CANCEL, this.touchcancel, this)
    },

    touchstart(event) {
        this.unschedule(this.runPage);          //关闭滑动事件
        this.mask.active = true;                //开启遮罩，防止连续手动滑动
        this.moveBool = true;
        var touches = event.getTouches();
        this.startPos = this.movePos = event.target.convertToNodeSpaceAR(touches[0].getStartLocation())
    },
    touchmove(event) {
        if (!this.moveBool) return;
        var touches = event.getTouches();
        this.movePos = event.target.convertToNodeSpaceAR(touches[0].getLocation())
        if (this.movePos.x - this.startPos.x > 0) {
            //向右
            this.lastPage.x = -264 + (this.movePos.x - this.startPos.x)
            this.curPage.x = 0 + (this.movePos.x - this.startPos.x);
            this.nextPage.x = 264 + (this.movePos.x - this.startPos.x)
        } else if (this.movePos.x - this.startPos.x < 0) {
            //向左
            this.lastPage.x = -264 + (this.movePos.x - this.startPos.x);
            this.curPage.x = 0 + (this.movePos.x - this.startPos.x);
            this.nextPage.x = 264 + (this.movePos.x - this.startPos.x);
        }
        if (event.target.convertToNodeSpace(event.getLocation()).x > 264 || event.target.convertToNodeSpace(event.getLocation()).x < 0) {
            this.moveBool = false;
        }
    },
    touchend(event) {
        this.moveBool = false;
        this.DTY = Math.abs(this.movePos.x - this.startPos.x) / 264 * 0.2;
        if (this.loop > 0) {
            setTimeout(() => {
                this.schedule(this.runPage, this.loop)
            }, 1)
        }
        let dty = cc.delayTime(this.DTY);
        if (this.movePos.x - this.startPos.x > 0) {
            //向右
            if (Math.abs(this.movePos.x - this.startPos.x) >= 100) {
                let moveTo = cc.moveTo(this.DTY, cc.v2(0, 0));
                let moveTo1 = cc.moveTo(this.DTY, cc.v2(264, 0));
                this.lastPage.runAction(moveTo);
                this.curPage.runAction(moveTo1);
                let cb = cc.callFunc(() => {
                    this.setPage(2)
                })
                this.node.runAction(cc.sequence(dty, cb));
            } else {
                let moveTo = cc.moveTo(this.DTY, cc.v2(-264, 0));
                let moveTo1 = cc.moveTo(this.DTY, cc.v2(0, 0));
                this.lastPage.runAction(moveTo);
                this.curPage.runAction(moveTo1);
                let cb = cc.callFunc(() => {
                    this.setPage(1)
                })
                this.node.runAction(cc.sequence(dty, cb));

            }
        } else if (this.movePos.x - this.startPos.x < 0) {
            //向左
            if (Math.abs(this.movePos.x - this.startPos.x) >= 100) {
                let moveTo = cc.moveTo(this.DTY, cc.v2(0, 0));
                let moveTo1 = cc.moveTo(this.DTY, cc.v2(-264, 0));
                this.nextPage.runAction(moveTo);
                this.curPage.runAction(moveTo1);
                let cb = cc.callFunc(() => {
                    this.setPage(0)
                })
                this.node.runAction(cc.sequence(dty, cb));

            } else {
                let moveTo = cc.moveTo(this.DTY, cc.v2(264, 0));
                let moveTo1 = cc.moveTo(this.DTY, cc.v2(0, 0));
                this.nextPage.runAction(moveTo);
                this.curPage.runAction(moveTo1);
                let cb = cc.callFunc(() => {
                    this.setPage(1)
                })
                this.node.runAction(cc.sequence(dty, cb));

            }
        }
        else if (this.movePos.x - this.startPos.x == 0) {
            this.click_pageTouch();
            this.mask.active = false;
        }
    },
    touchcancel(event) {
        this.moveBool = false;
        this.DTY = Math.abs(this.movePos.x - this.startPos.x) / 264 * 0.2;
        if (this.loop > 0) {
            setTimeout(() => {
                this.schedule(this.runPage, this.loop)
            }, 1)
        }
        let dty = cc.delayTime(this.DTY);
        if (this.movePos.x - this.startPos.x > 0) {
            //向右
            if (Math.abs(this.movePos.x - this.startPos.x) >= 100) {
                let moveTo = cc.moveTo(this.DTY, cc.v2(0, 0));
                let moveTo1 = cc.moveTo(this.DTY, cc.v2(264, 0));
                this.lastPage.runAction(moveTo);
                this.curPage.runAction(moveTo1);

                let cb = cc.callFunc(() => {
                    this.setPage(2)
                })
                this.node.runAction(cc.sequence(dty, cb));
            } else {
                let moveTo = cc.moveTo(this.DTY, cc.v2(-264, 0));
                let moveTo1 = cc.moveTo(this.DTY, cc.v2(0, 0));
                this.lastPage.runAction(moveTo);
                this.curPage.runAction(moveTo1);

                let cb = cc.callFunc(() => {
                    this.setPage(1)
                })
                this.node.runAction(cc.sequence(dty, cb));
            }
        } else if (this.movePos.x - this.startPos.x < 0) {
            //向左
            if (Math.abs(this.movePos.x - this.startPos.x) >= 100) {
                let moveTo = cc.moveTo(this.DTY, cc.v2(0, 0));
                let moveTo1 = cc.moveTo(this.DTY, cc.v2(-264, 0));
                this.nextPage.runAction(moveTo);
                this.curPage.runAction(moveTo1);

                let cb = cc.callFunc(() => {
                    this.setPage(0)
                })
                this.node.runAction(cc.sequence(dty, cb));
            } else {
                let moveTo = cc.moveTo(this.DTY, cc.v2(264, 0));
                let moveTo1 = cc.moveTo(this.DTY, cc.v2(0, 0));
                this.nextPage.runAction(moveTo);
                this.curPage.runAction(moveTo1);

                let cb = cc.callFunc(() => {
                    this.setPage(1);
                })
                this.node.runAction(cc.sequence(dty, cb));
            }
        }
        else if (this.movePos.x - this.startPos.x == 0) {
            this.click_pageTouch();
            this.mask.active = false;
        }
    },
    //设置节点位置
    setPage(dir) {
        setTimeout(() => {
            this.mask.active = false;
        }, 10)
        let node;
        switch (dir) {
            case 0:             //左
                this.lastPage.x = 264;
                node = this.pages.shift();
                this.pages.push(node)
                break;
            case 1:
                return;
            case 2:             //右
                this.nextPage.x = -264;
                node = this.pages.pop();
                this.pages.unshift(node);
                break;
        }
        this.lastPage = this.pages[0];
        this.curPage = this.pages[1];
        this.nextPage = this.pages[2];
        this.setcurIndex(dir);
        this.initDianState();
        this.initBannerUI(dir);
    },

    //设置当前界面的索引
    setcurIndex(dir) {
        let maxIndex = this.bannerData.length - 1;
        switch (dir) {
            case 0: this.curIndex++; break;   //左
            case 2: this.curIndex--; break;     //右
        }
        if (this.curIndex > maxIndex) {
            this.curIndex = 0;
        } else if (this.curIndex < 0) {
            this.curIndex = maxIndex
        }
    },
    //设置页面精灵
    initBannerUI(dir) {
        this.setOtherIndex(dir);
        switch (dir) {
            case 0:         //左  渲染最后一张
                glGame.panel.showRemoteImage(this.pages[2].children[0], this.bannerData[this.nextIndex].img);    //中间渲染
                break;
            case 2:         //右  渲染第一张
                glGame.panel.showRemoteImage(this.pages[0].children[0], this.bannerData[this.laseIndex].img);    //中间渲染
                break;
        }
    },
    //设置当前界面的索引
    setOtherIndex(dir) {
        let maxIndex = this.bannerData.length - 1;
        switch (dir) {
            case 0:             //左
                this.nextIndex = this.curIndex + 1;
                if (this.nextIndex > maxIndex) {
                    this.nextIndex = 0;
                }
                break;
            case 2:             //右
                this.laseIndex = this.curIndex - 1;
                if (this.laseIndex < 0) {
                    this.laseIndex = maxIndex;
                }
                break;
        }
    },

    runPage() {
        this.mask.active = true;
        this.moveBool = false;
        this.DTY = 0.2;
        let dty = cc.delayTime(0.2);
        let moveTo1 = cc.moveTo(this.DTY, cc.v2(-264, 0));
        this.curPage.runAction(moveTo1);
        let moveTo = cc.moveTo(this.DTY, cc.v2(0, 0));
        this.nextPage.runAction(moveTo);

        let cb = cc.callFunc(() => {
            this.setPage(0)
        })
        this.node.runAction(cc.sequence(dty, cb));
    },

    onClick(name, node) {
        switch (name) {
            default:
                break;
        }
    },

    click_pageTouch() {
        let url;
        for (let i = 0; i < this.bannerData.length; i++) {
            if (this.curIndex == i) {
                url = this.bannerData[i].url
                if (!url || url == "") return;
                if (url.indexOf("data://gid=") > -1) {
                    let gameid = Number(url.substring(11));
                    glGame.emitter.emit("roomEntrance", gameid);
                } else {
                    url = `${url}?token=${glGame.logon.get("_token")}`;
                    cc.sys.openURL(url);
                }
                break;
            }
        }
    },

    OnDestroy() {
        glGame.emitter.off("initBillBoradsUI", this);
        this.unschedule(this.runPage);
    },
});

let NoticeLogic = function () {
    this.resetData();
    this.initData();
},
    noticelogic = NoticeLogic.prototype,
    g_instance = null;
/**
 * 初始化数据
 */
noticelogic.initData = function () {
    this.special_content = "";
    this.special_end = 0;
    this.list_max = 30;
    this.delayTime = 60 * 1000;
    this.interval = null;
    this.registerGlobalEvent();
    this.EnterForeground();
};
/**
 * 重置数据
 */
noticelogic.resetData = function () {
    this.content_list = [];
    this.plaza_list = [];
    this.task_list = [];
    this.bHttp = false;
};

/**
 * 注册监听
 */
noticelogic.registerGlobalEvent = function () {
    glGame.emitter.on("EnterBackground", this.EnterBackground, this);
    glGame.emitter.on("EnterForeground", this.EnterForeground, this);
}

/**
 * 取消监听
 */
noticelogic.unRegisterGlobalEvent = function () {
    glGame.emitter.off("EnterBackground", this);
    glGame.emitter.off("EnterForeground", this);
}

/**
 * 后台切换回调
 */
noticelogic.EnterBackground = function () {
    if (this.interval != null) {
        clearInterval(this.interval);
        this.interval = null;
    }
}

/**
 * 前台切换回调(开启公共列表设计)
 */
noticelogic.EnterForeground = function () {
    if (this.interval == null) {
        this.interval = setInterval(() => {
            glGame.notice.checkTackList();
        }, 5000)
    }
}

/**
 * 监测大厅播放任务列表
 */
noticelogic.checkTackList = function () {
    if (this.task_list.length == 0) return;
    let now_time = Date.now();
    for (let index in this.task_list) {
        let data = this.task_list[index];
        if (!data) continue;
        let endtime = data.endtime + data.delay,
            starttime = data.starttime + data.delay;
        //判定是否符合跑马开启时间
        if (data.endtime != 0 && data.starttime != 0) {  //data.endtime和data.starttime都等于0，为不限时间；
            if (now_time < starttime || now_time > endtime) continue;
        }
        // //判定是否有跑马间隔开启时长
        // if (data.intervalstart === 0) {
        //     data.intervalstart = now_time;
        //     continue
        // }
        //判定是否符合添加进入播放列表

        if (now_time - data.intervalstart >= data.intervaltime && this.checkTack(data.content)) {
            this.plaza_list.push(data);
            data.intervalstart = now_time;
            if (this.plaza_list.length === 1) {
                glGame.emitter.emit("rnotice.plazastart");
            }
        }
    }
}


/**
 * 监测是否有重复数据，忽略第一条在进行插入
 */
noticelogic.checkTack = function (content) {
    //判定是否有重复添加
    if (this.plaza_list[0]) {
        for (let index in this.plaza_list) {
            let data = this.plaza_list[index];
            if (!data) continue;
            if (data.content == content && index != 0) return false;
        }
    }
    return true;
}


/**
 * 获取推送公告的内容 并进行时间判定
 */
noticelogic.getSpecial = function () {
    if (this.special_end !== 0) {
        if (Date.now() >= this.special_end && this.special_end !== 1) {
            this.special_end = 0;
            this.special_content = "";
        } else if (this.special_end === 1) {
            this.special_end = 0;
        }
    }
    return { content: this.special_content };
};

/**
 * 获取大厅公告的内容
 */
noticelogic.getPlazaContent = function () {
    if (!this.plaza_list[0]) {
        return "";
    }
    return this.plaza_list[0];
};

/**
 * 获取普通公告列表
 */
noticelogic.getContentList = function () {
    return this.content_list;
};

/**
 * 获取普通公告第一条
 */
noticelogic.getContent = function () {
    if (!this.content_list[0]) {
        return "";
    }
    return this.content_list[0];
};

/**
 * 特殊推送的公告
 * @param strContent string 公告内容
 * @param endTime    number 结束时间戳
 */
noticelogic.addSpecialContent = function (strContent, endTime) {
    let sendemit = false;
    if (this.special_end) sendemit = true
    this.special_content = strContent;
    this.special_end = endTime;
    if (!sendemit) glGame.emitter.emit("rnotice.specialstart");
};

/**
 * 大厅推送的任务公告
 * @param {any}   taskData   公告内容
 * @param {number} time      结束时间戳
 */
noticelogic.addTaskContent = function (taskData, time) {
    //判定是否有重复添加
    if (this.task_list[0]) {
        for (let index in this.task_list) {
            let data = this.task_list[index];
            if (!data) continue;
            if (data.starttime == taskData.starttime
                && data.endtime == taskData.endtime
                && data.intervaltime == taskData.interval_time
                && data.content == taskData.content) return;
        }
    }
    //添加到任务列表
    let now_time = Date.now();
    let task_notice = {
        starttime: taskData.starttime,           //开启时间段
        endtime: taskData.endtime,               //关闭时间段
        intervaltime: taskData.interval_time,    //播放时间间隔
        speed: taskData.play_speed,              //播放速率
        delay: time,                             //服务端与客户端的时间差
        content: taskData.content,                //播放内容
    }

    let endtime = taskData.endtime + time,
        starttime = taskData.starttime + time;
    task_notice.intervalstart = (now_time < starttime || now_time > endtime) ? 0 : now_time;
    this.task_list.push(task_notice);
};

/**
 * 非单局内出现的公告往后排
 * @param strContent string 公告内容 
 */
noticelogic.addContent = function (strContent) {
    this.content_list.push(strContent);
    if (this.special_end === 0 && this.content_list.length === 1) glGame.emitter.emit("rnotice.basestart");
};

/**
 * 非单局内出现的公告往后排(列表)
 * @param contentList string[] 公告列表
 */
noticelogic.addContentList = function (contentList) {
    let bStart = !this.content_list[0];
    this.content_list.push(...contentList);
    if (this.special_end === 0 && bStart) glGame.emitter.emit("rnotice.basestart");
};

/**
 * 对播放结束的通用列表进行清理
 */
noticelogic.removeContent = function () {
    if (this.content_list[0]) this.content_list.splice(0, 1);
};

/**
 * 对播放结束的大厅列表进行清理
 */
noticelogic.removePlazaContent = function () {
    if (this.plaza_list[0]) this.plaza_list.splice(0, 1);
};

/**
 * 作用单局内需要提前公告
 * @param strContent string 公告内容
 */
noticelogic.insertContent = function (strContent) {
    this.content_list.unshift(strContent);
    if (this.special_end === 0 && this.content_list.length === 1) glGame.emitter.emit("rnotice.basestart");
};

/**
 * 发送获取http的跑马
 */
noticelogic.reqGetHorseRaceLamp = function () {
    this.bHttp = true;
    glGame.gameNet.send_msg("http.reqGetHorseRaceLamp", {}, this.http_reqGetHorseRaceLamp.bind(this));
};

/**
 * 解析并对现有跑马进行赋值 等pomelo通知在请求
 * @param route string  访问地址
 * @param data  Array[] 获取公告列表
 */
noticelogic.http_reqGetHorseRaceLamp = function (route, data) {
    this.resetData();
    if (data.data) {
        let delay = data.servertime - Date.now();
        for (let i in data.data) {
            let notice = data.data[i];
            // if (notice.endtime) {
            //     //this.addSpecialContent(notice.content, notice.endtime + delay);            //特殊公告 目前干掉
            // } else {
            //     this.addContent(notice.content);
            // }
            this.addTaskContent(notice, delay);
        }
    }
    // else {
    //     if (this.bHttp) {
    //         setTimeout(() => {
    //             if (this.bHttp) this.reqGetHorseRaceLamp();
    //         }, this.delayTime);
    //     }
    // }
};


module.exports = function () {
    if (!g_instance) {
        g_instance = new NoticeLogic();
    }
    return g_instance;
};

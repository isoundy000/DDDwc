//1.web为将图片转换成base64并下载到本地；2.截取节点的图片保存到本地
//filename: string;
//accountCode: string;
//node: cc.Node; 二维码的渲染节点
module.exports.captureScreenshot = function(filename, node){
    if (isBrowser) {
        var callback = ()=>{
            var base64 = cc.game.canvas.toDataURL("imagea/png");//getBase64Image(img);//canvas.toDataURL("imagea/png")//;
            cc.director.off(cc.Director.EVENT_AFTER_DRAW);
            var href = base64.replace(/^data:image[^;]*/, "data:image/octet-stream");
            var alink = document.createElement("a")
            alink.href = href;
            alink.download = `${filename}.png`;
            alink.click()
            node.active = false;
            glGame.panel.showMsgBox("提示", "保存成功");
        }
        cc.director.on(cc.Director.EVENT_AFTER_DRAW, callback);
    } else {
        var size = cc.director.getWinSize();
        var fullPath = jsb.fileUtils.getWritablePath() + filename;
        if(jsb.fileUtils.isFileExist(fullPath)){
            jsb.fileUtils.removeFile(fullPath);
        }
        let renderTexture = cc.RenderTexture.create(
            size.width,
            size.height,
            cc.Texture2D.PIXEL_FORMAT_RGBA8888,
            gl.DEPTH24_STENCIL8_OES
        );
        //renderTexture.setPosition(cc.v2(size.width/2, size.height/2));
        renderTexture.begin();
        cc.director.getScene()._sgNode.visit();
        renderTexture.end();
        renderTexture.saveToFile(filename, cc.ImageFormat.PNG, true, function () {
            console.log('保存成功', jsb.fileUtils.getWritablePath())
            glGame.panel.showMsgBox("提示", "保存成功");
        });
    }
}

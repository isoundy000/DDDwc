let
    Def = require("default"),
    Web = Def.extend({
        copyToClip: function (str,tipStr) {
            let textArea = document.createElement("textarea");
            textArea.style.background = 'transparent';
            textArea.value = str;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                let successful = document.execCommand('copy');
                tipStr = tipStr?tipStr:"";
                tipStr = successful ? tipStr+'复制成功！' : tipStr+'复制失败！';
                glGame.panel.showTip(tipStr);
            } catch (err) {
            }
            document.body.removeChild(textArea);
        }
    }),
    g_instance = null;
module.exports.getInstance = function () {
    if (!g_instance) {
        g_instance = new Web();
    }
    return g_instance;
};


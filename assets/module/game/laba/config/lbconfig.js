let
    LabaCfg = function () {
        this.resetData();
    },
    labaCfg = LabaCfg.prototype,
    g_instance = null;

labaCfg.resetData = function () {
    this.labaList = [];
    this.rewardLine = {
        "1": ["1_0", "1_1", "1_2", "1_3", "1_4"],
        "2": ["2_0", "2_1", "2_2", "2_3", "2_4"],
        "3": ["0_0", "0_1", "0_2", "0_3", "0_4"],
        "4": ["2_0", "1_1", "0_2", "1_3", "2_4"],
        "5": ["0_0", "1_1", "2_2", "1_3", "0_4"],
        "6": ["1_0", "2_1", "2_2", "2_3", "1_4"],
        "7": ["1_0", "0_1", "0_2", "0_3", "1_4"],
        "8": ["2_0", "2_1", "1_2", "0_3", "0_4"],
        "9": ["0_0", "0_1", "1_2", "2_3", "2_4"]
    }
};

labaCfg.get = function (key) {
    return this.labaList[key] || 0;
};

labaCfg.set = function (key, value) {
    this.labaList[key] = value;
};

module.exports = function () {
    if (!g_instance) {
        g_instance = new LabaCfg();
    }
    return g_instance;
}();
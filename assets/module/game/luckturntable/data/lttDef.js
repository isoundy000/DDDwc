//客户端常用的常量和函数
let lttDef = {};

lttDef.roomType = { 99: "体验房", 1: "初级房", 2: "中级房", 3: "高级房", 4: "贵宾房", 5: "富豪房" };

lttDef.singleAngle = 360 / 37;
lttDef.numberList = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
//0黑  1绿  2红
lttDef.colorList = [1, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 2, 0, 2, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 2, 0, 2];

lttDef.judgeColor = function (num) {
    return this.colorList[num];
};

lttDef.getKeyByValue = function (value) {
    // if(!Array.isArray(value)) console.error("value is not Array!", value);
    if (value.length == 1) {
        if (value[0] > 36) {
            return parseInt(value[0]) + 108;
        }
    }
    for (let k in this.betList) {
        if (this.betList[k].number.toString() == value.sort((a, b) => a - b).toString()) {
            return k.substring(4);
        }
    }
}

lttDef.betList = {};
lttDef.betList.bet_0 = { number: [0], Multiple: 35 };
lttDef.betList.bet_1 = { number: [1], Multiple: 35 };
lttDef.betList.bet_2 = { number: [2], Multiple: 35 };
lttDef.betList.bet_3 = { number: [3], Multiple: 35 };
lttDef.betList.bet_4 = { number: [4], Multiple: 35 };
lttDef.betList.bet_5 = { number: [5], Multiple: 35 };
lttDef.betList.bet_6 = { number: [6], Multiple: 35 };
lttDef.betList.bet_7 = { number: [7], Multiple: 35 };
lttDef.betList.bet_8 = { number: [8], Multiple: 35 };
lttDef.betList.bet_9 = { number: [9], Multiple: 35 };
lttDef.betList.bet_10 = { number: [10], Multiple: 35 };
lttDef.betList.bet_11 = { number: [11], Multiple: 35 };
lttDef.betList.bet_12 = { number: [12], Multiple: 35 };
lttDef.betList.bet_13 = { number: [13], Multiple: 35 };
lttDef.betList.bet_14 = { number: [14], Multiple: 35 };
lttDef.betList.bet_15 = { number: [15], Multiple: 35 };
lttDef.betList.bet_16 = { number: [16], Multiple: 35 };
lttDef.betList.bet_17 = { number: [17], Multiple: 35 };
lttDef.betList.bet_18 = { number: [18], Multiple: 35 };
lttDef.betList.bet_19 = { number: [19], Multiple: 35 };
lttDef.betList.bet_20 = { number: [20], Multiple: 35 };
lttDef.betList.bet_21 = { number: [21], Multiple: 35 };
lttDef.betList.bet_22 = { number: [22], Multiple: 35 };
lttDef.betList.bet_23 = { number: [23], Multiple: 35 };
lttDef.betList.bet_24 = { number: [24], Multiple: 35 };
lttDef.betList.bet_25 = { number: [25], Multiple: 35 };
lttDef.betList.bet_26 = { number: [26], Multiple: 35 };
lttDef.betList.bet_27 = { number: [27], Multiple: 35 };
lttDef.betList.bet_28 = { number: [28], Multiple: 35 };
lttDef.betList.bet_29 = { number: [29], Multiple: 35 };
lttDef.betList.bet_30 = { number: [30], Multiple: 35 };
lttDef.betList.bet_31 = { number: [31], Multiple: 35 };
lttDef.betList.bet_32 = { number: [32], Multiple: 35 };
lttDef.betList.bet_33 = { number: [33], Multiple: 35 };
lttDef.betList.bet_34 = { number: [34], Multiple: 35 };
lttDef.betList.bet_35 = { number: [35], Multiple: 35 };
lttDef.betList.bet_36 = { number: [36], Multiple: 35 };
lttDef.betList.bet_37 = { number: [1, 2], Multiple: 17 };
lttDef.betList.bet_38 = { number: [2, 3], Multiple: 17 };
lttDef.betList.bet_39 = { number: [4, 5], Multiple: 17 };
lttDef.betList.bet_40 = { number: [5, 6], Multiple: 17 };
lttDef.betList.bet_41 = { number: [7, 8], Multiple: 17 };
lttDef.betList.bet_42 = { number: [8, 9], Multiple: 17 };
lttDef.betList.bet_43 = { number: [10, 11], Multiple: 17 };
lttDef.betList.bet_44 = { number: [11, 12], Multiple: 17 };
lttDef.betList.bet_45 = { number: [13, 14], Multiple: 17 };
lttDef.betList.bet_46 = { number: [14, 15], Multiple: 17 };
lttDef.betList.bet_47 = { number: [16, 17], Multiple: 17 };
lttDef.betList.bet_48 = { number: [17, 18], Multiple: 17 };
lttDef.betList.bet_49 = { number: [19, 20], Multiple: 17 };
lttDef.betList.bet_50 = { number: [20, 21], Multiple: 17 };
lttDef.betList.bet_51 = { number: [22, 23], Multiple: 17 };
lttDef.betList.bet_52 = { number: [23, 24], Multiple: 17 };
lttDef.betList.bet_53 = { number: [25, 26], Multiple: 17 };
lttDef.betList.bet_54 = { number: [26, 27], Multiple: 17 };
lttDef.betList.bet_55 = { number: [28, 29], Multiple: 17 };
lttDef.betList.bet_56 = { number: [29, 30], Multiple: 17 };
lttDef.betList.bet_57 = { number: [31, 32], Multiple: 17 };
lttDef.betList.bet_58 = { number: [32, 33], Multiple: 17 };
lttDef.betList.bet_59 = { number: [34, 35], Multiple: 17 };
lttDef.betList.bet_60 = { number: [35, 36], Multiple: 17 };
lttDef.betList.bet_61 = { number: [0, 1], Multiple: 17 };
lttDef.betList.bet_62 = { number: [1, 4], Multiple: 17 };
lttDef.betList.bet_63 = { number: [4, 7], Multiple: 17 };
lttDef.betList.bet_64 = { number: [7, 10], Multiple: 17 };
lttDef.betList.bet_65 = { number: [10, 13], Multiple: 17 };
lttDef.betList.bet_66 = { number: [13, 16], Multiple: 17 };
lttDef.betList.bet_67 = { number: [16, 19], Multiple: 17 };
lttDef.betList.bet_68 = { number: [19, 22], Multiple: 17 };
lttDef.betList.bet_69 = { number: [22, 25], Multiple: 17 };
lttDef.betList.bet_70 = { number: [25, 28], Multiple: 17 };
lttDef.betList.bet_71 = { number: [28, 31], Multiple: 17 };
lttDef.betList.bet_72 = { number: [31, 34], Multiple: 17 };
lttDef.betList.bet_73 = { number: [0, 2], Multiple: 17 };
lttDef.betList.bet_74 = { number: [2, 5], Multiple: 17 };
lttDef.betList.bet_75 = { number: [5, 8], Multiple: 17 };
lttDef.betList.bet_76 = { number: [8, 11], Multiple: 17 };
lttDef.betList.bet_77 = { number: [11, 14], Multiple: 17 };
lttDef.betList.bet_78 = { number: [14, 17], Multiple: 17 };
lttDef.betList.bet_79 = { number: [17, 20], Multiple: 17 };
lttDef.betList.bet_80 = { number: [20, 23], Multiple: 17 };
lttDef.betList.bet_81 = { number: [23, 26], Multiple: 17 };
lttDef.betList.bet_82 = { number: [26, 29], Multiple: 17 };
lttDef.betList.bet_83 = { number: [29, 32], Multiple: 17 };
lttDef.betList.bet_84 = { number: [32, 35], Multiple: 17 };
lttDef.betList.bet_85 = { number: [0, 3], Multiple: 17 };
lttDef.betList.bet_86 = { number: [3, 6], Multiple: 17 };
lttDef.betList.bet_87 = { number: [6, 9], Multiple: 17 };
lttDef.betList.bet_88 = { number: [9, 12], Multiple: 17 };
lttDef.betList.bet_89 = { number: [12, 15], Multiple: 17 };
lttDef.betList.bet_90 = { number: [15, 18], Multiple: 17 };
lttDef.betList.bet_91 = { number: [18, 21], Multiple: 17 };
lttDef.betList.bet_92 = { number: [21, 24], Multiple: 17 };
lttDef.betList.bet_93 = { number: [24, 27], Multiple: 17 };
lttDef.betList.bet_94 = { number: [27, 30], Multiple: 17 };
lttDef.betList.bet_95 = { number: [30, 33], Multiple: 17 };
lttDef.betList.bet_96 = { number: [33, 36], Multiple: 17 };
lttDef.betList.bet_97 = { number: [1, 2, 3], Multiple: 11 };
lttDef.betList.bet_98 = { number: [4, 5, 6], Multiple: 11 };
lttDef.betList.bet_99 = { number: [7, 8, 9], Multiple: 11 };
lttDef.betList.bet_100 = { number: [10, 11, 12], Multiple: 11 };
lttDef.betList.bet_101 = { number: [13, 14, 15], Multiple: 11 };
lttDef.betList.bet_102 = { number: [16, 17, 18], Multiple: 11 };
lttDef.betList.bet_103 = { number: [19, 20, 21], Multiple: 11 };
lttDef.betList.bet_104 = { number: [22, 23, 24], Multiple: 11 };
lttDef.betList.bet_105 = { number: [25, 26, 27], Multiple: 11 };
lttDef.betList.bet_106 = { number: [28, 29, 30], Multiple: 11 };
lttDef.betList.bet_107 = { number: [31, 32, 33], Multiple: 11 };
lttDef.betList.bet_108 = { number: [34, 35, 36], Multiple: 11 };
lttDef.betList.bet_109 = { number: [0, 1, 2], Multiple: 11 };
lttDef.betList.bet_110 = { number: [0, 2, 3], Multiple: 11 };
lttDef.betList.bet_111 = { number: [1, 2, 4, 5], Multiple: 8 };
lttDef.betList.bet_112 = { number: [4, 5, 7, 8], Multiple: 8 };
lttDef.betList.bet_113 = { number: [7, 8, 10, 11], Multiple: 8 };
lttDef.betList.bet_114 = { number: [10, 11, 13, 14], Multiple: 8 };
lttDef.betList.bet_115 = { number: [13, 14, 16, 17], Multiple: 8 };
lttDef.betList.bet_116 = { number: [16, 17, 19, 20], Multiple: 8 };
lttDef.betList.bet_117 = { number: [19, 20, 22, 23], Multiple: 8 };
lttDef.betList.bet_118 = { number: [22, 23, 25, 26], Multiple: 8 };
lttDef.betList.bet_119 = { number: [25, 26, 28, 29], Multiple: 8 };
lttDef.betList.bet_120 = { number: [28, 29, 31, 32], Multiple: 8 };
lttDef.betList.bet_121 = { number: [31, 32, 34, 35], Multiple: 8 };
lttDef.betList.bet_122 = { number: [2, 3, 5, 6], Multiple: 8 };
lttDef.betList.bet_123 = { number: [5, 6, 8, 9], Multiple: 8 };
lttDef.betList.bet_124 = { number: [8, 9, 11, 12], Multiple: 8 };
lttDef.betList.bet_125 = { number: [11, 12, 14, 15], Multiple: 8 };
lttDef.betList.bet_126 = { number: [14, 15, 17, 18], Multiple: 8 };
lttDef.betList.bet_127 = { number: [17, 18, 20, 21], Multiple: 8 };
lttDef.betList.bet_128 = { number: [20, 21, 23, 24], Multiple: 8 };
lttDef.betList.bet_129 = { number: [23, 24, 26, 27], Multiple: 8 };
lttDef.betList.bet_130 = { number: [26, 27, 29, 30], Multiple: 8 };
lttDef.betList.bet_131 = { number: [29, 30, 32, 33], Multiple: 8 };
lttDef.betList.bet_132 = { number: [32, 33, 35, 36], Multiple: 8 };
lttDef.betList.bet_133 = { number: [0, 1, 2, 3,], Multiple: 8 };
lttDef.betList.bet_134 = { number: [1, 2, 3, 4, 5, 6], Multiple: 5 };
lttDef.betList.bet_135 = { number: [4, 5, 6, 7, 8, 9], Multiple: 5 };
lttDef.betList.bet_136 = { number: [7, 8, 9, 10, 11, 12], Multiple: 5 };
lttDef.betList.bet_137 = { number: [10, 11, 12, 13, 14, 15], Multiple: 5 };
lttDef.betList.bet_138 = { number: [13, 14, 15, 16, 17, 18], Multiple: 5 };
lttDef.betList.bet_139 = { number: [16, 17, 18, 19, 20, 21], Multiple: 5 };
lttDef.betList.bet_140 = { number: [19, 20, 21, 22, 23, 24], Multiple: 5 };
lttDef.betList.bet_141 = { number: [22, 23, 24, 25, 26, 27], Multiple: 5 };
lttDef.betList.bet_142 = { number: [25, 26, 27, 28, 29, 30], Multiple: 5 };
lttDef.betList.bet_143 = { number: [28, 29, 30, 31, 32, 33], Multiple: 5 };
lttDef.betList.bet_144 = { number: [31, 32, 33, 34, 35, 36], Multiple: 5 };
lttDef.betList.bet_145 = { number: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34], Multiple: 2 }; // 第一组
lttDef.betList.bet_146 = { number: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35], Multiple: 2 }; // 第二组
lttDef.betList.bet_147 = { number: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36], Multiple: 2 }; // 第三组
lttDef.betList.bet_148 = { number: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], Multiple: 2 }; // 1-12
lttDef.betList.bet_149 = { number: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], Multiple: 2 }; // 13-24
lttDef.betList.bet_150 = { number: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], Multiple: 2 }; // 25-36
lttDef.betList.bet_151 = { number: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], Multiple: 1 }; // 1- 18
lttDef.betList.bet_152 = { number: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36], Multiple: 1 }; // 双数
lttDef.betList.bet_153 = { number: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36], Multiple: 1 }; // 红
lttDef.betList.bet_154 = { number: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35], Multiple: 1 }; // 黑
lttDef.betList.bet_155 = { number: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35], Multiple: 1 }; // 单数
lttDef.betList.bet_156 = { number: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], Multiple: 1 }; // 19-36

lttDef.bigBetList = {
    0:
        [
            { "0": "[0]" },
            { "61": "[0,1]" },
            { "73": "[0,2]" },
            { "85": "[0,3]" },
            { "109": "[0,1,2]" },
            { "110": "[0,2,3]" },
            { "133": "[0,1,2,3]" }
        ],
    1:
        [
            { "1": "[1]" },
            { "61": "[1,0]" },
            { "37": "[1,2]" },
            { "62": "[1,4]" },
            { "109": "[1,0,2]" },
            { "97": "[1,2,3]" },
            { "133": "[1,0,2,3]" },
            { "111": "[1,2,4,5]" },
            { "134": "[1,2,3,4,5,6]" }
        ],
    2:
        [
            { "2": "[2]" },
            { "73": "[2,0]" },
            { "37": "[2,1]" },
            { "38": "[2,3]" },
            { "74": "[2,5]" },
            { "109": "[2,0,1]" },
            { "110": "[2,0,3]" },
            { "97": "[2,1,3]" },
            { "133": "[2,0,1,3]" },
            { "111": "[2,1,4,5]" },
            { "122": "[2,3,5,6]" },
            { "134": "[2,1,3,4,5,6]" }
        ],
    3:
        [
            { "3": "[3]" },
            { "85": "[3,0]" },
            { "38": "[3,2]" },
            { "86": "[3,6]" },
            { "110": "[3,0,2]" },
            { "97": "[3,1,2]" },
            { "133": "[3,0,1,2]" },
            { "122": "[3,2,5,6]" },
            { "134": "[3,1,2,4,5,6]" }
        ],
    4:
        [
            { "4": "[4]" },
            { "62": "[4,1]" },
            { "39": "[4,5]" },
            { "63": "[4,7]" },
            { "98": "[4,5,6]" },
            { "111": "[4,1,2,5]" },
            { "112": "[4,5,7,8]" },
            { "134": "[4,1,2,3,5,6]" },
            { "135": "[4,5,6,7,8,9]" }
        ],
    5:
        [
            { "5": "[5]" },
            { "74": "[5,2]" },
            { "39": "[5,4]" },
            { "40": "[5,6]" },
            { "75": "[5,8]" },
            { "98": "[5,4,6]" },
            { "111": "[5,1,2,4]" },
            { "122": "[5,2,3,6]" },
            { "112": "[5,4,7,8]" },
            { "123": "[5,6,8,9]" },
            { "134": "[5,1,2,3,4,6]" },
            { "135": "[5,4,6,7,8,9]" }
        ],
    6:
        [
            { "6": "[6]" },
            { "86": "[6,3]" },
            { "40": "[6,5]" },
            { "87": "[6,9]" },
            { "98": "[6,4,5]" },
            { "122": "[6,2,3,5]" },
            { "123": "[6,5,8,9]" },
            { "134": "[6,1,2,3,4,5]" },
            { "135": "[6,4,5,7,8,9]" }
        ],
    7:
        [
            { "7": "[7]" },
            { "63": "[7,4]" },
            { "41": "[7,8]" },
            { "64": "[7,10]" },
            { "99": "[7,8,9]" },
            { "112": "[7,4,5,8]" },
            { "113": "[7,8,10,11]" },
            { "135": "[7,4,5,6,8,9]" },
            { "136": "[7,8,9,10,11,12]" }
        ],
    8:
        [
            { "8": "[8]" },
            { "75": "[8,5]" },
            { "41": "[8,7]" },
            { "42": "[8,9]" },
            { "76": "[8,11]" },
            { "99": "[8,7,9]" },
            { "112": "[8,4,5,7]" },
            { "123": "[8,5,6,9]" },
            { "113": "[8,7,10,11]" },
            { "124": "[8,9,11,12]" },
            { "135": "[8,4,5,6,7,9]" },
            { "136": "[8,7,9,10,11,12]" }
        ],
    9:
        [
            { "9": "[9]" },
            { "87": "[9,6]" },
            { "42": "[9,8]" },
            { "88": "[9,12]" },
            { "99": "[9,7,8]" },
            { "123": "[9,5,6,8]" },
            { "124": "[9,8,11,12]" },
            { "135": "[9,4,5,6,7,8]" },
            { "136": "[9,7,8,10,11,12]" }
        ],
    10:
        [
            { "10": "[10]" },
            { "64": "[10,7]" },
            { "43": "[10,11]" },
            { "65": "[10,13]" },
            { "100": "[10,11,12]" },
            { "113": "[10,7,8,11]" },
            { "114": "[10,11,13,14]" },
            { "136": "[10,7,8,9,11,12]" },
            { "137": "[10,11,12,13,14,15]" }
        ],
    11:
        [
            { "11": "[11]" },
            { "76": "[11,8]" },
            { "43": "[11,10]" },
            { "44": "[11,12]" },
            { "77": "[11,14]" },
            { "100": "[11,10,12]" },
            { "113": "[11,7,8,10]" },
            { "124": "[11,8,9,12]" },
            { "114": "[11,10,13,14]" },
            { "125": "[11,12,14,15]" },
            { "undefined": "[11,7,8,9,11,12]" },
            { "137": "[11,10,12,13,14,15]" }
        ],
    12:
        [
            { "12": "[12]" },
            { "88": "[12,9]" },
            { "44": "[12,11]" },
            { "89": "[12,15]" },
            { "100": "[12,10,11]" },
            { "124": "[12,8,9,11]" },
            { "125": "[12,11,14,15]" },
            { "136": "[12,7,8,9,10,11]" },
            { "137": "[12,10,11,13,14,15]" }
        ],
    13:
        [
            { "13": "[13]" },
            { "65": "[13,10]" },
            { "45": "[13,14]" },
            { "66": "[13,16]" },
            { "101": "[13,14,15]" },
            { "114": "[13,10,11,14]" },
            { "115": "[13,14,16,17]" },
            { "137": "[13,10,11,12,14,15]" },
            { "138": "[13,14,15,16,17,18]" }
        ],
    14:
        [
            { "14": "[14]" },
            { "77": "[14,11]" },
            { "45": "[14,13]" },
            { "46": "[14,15]" },
            { "78": "[14,17]" },
            { "101": "[14,13,15]" },
            { "114": "[14,10,11,13]" },
            { "125": "[14,11,12,15]" },
            { "115": "[14,13,16,17]" },
            { "126": "[14,15,17,18]" },
            { "137": "[14,10,11,12,13,15]" },
            { "138": "[14,13,15,16,17,18]" }
        ],
    15:
        [
            { "15": "[15]" },
            { "89": "[15,12]" },
            { "46": "[15,14]" },
            { "90": "[15,18]" },
            { "101": "[15,13,14]" },
            { "125": "[15,11,12,14]" },
            { "126": "[15,14,17,18]" },
            { "137": "[15,10,11,12,13,14]" },
            { "138": "[15,13,14,16,17,18]" }
        ],
    16:
        [
            { "16": "[16]" },
            { "66": "[16,13]" },
            { "47": "[16,17]" },
            { "67": "[16,19]" },
            { "102": "[16,17,18]" },
            { "115": "[16,13,14,17]" },
            { "116": "[16,17,19,20]" },
            { "138": "[16,13,14,15,17,18]" },
            { "139": "[16,17,18,19,20,21]" }
        ],
    17:
        [
            { "17": "[17]" },
            { "78": "[17,14]" },
            { "47": "[17,16]" },
            { "48": "[17,18]" },
            { "79": "[17,20]" },
            { "102": "[17,16,18]" },
            { "115": "[17,13,14,16]" },
            { "126": "[17,14,15,18]" },
            { "116": "[17,16,19,20]" },
            { "127": "[17,18,20,21]" },
            { "138": "[17,13,14,15,16,18]" },
            { "139": "[17,16,18,19,20,21]" }
        ],
    18:
        [
            { "18": "[18]" },
            { "90": "[18,15]" },
            { "48": "[18,17]" },
            { "91": "[18,21]" },
            { "102": "[18,16,17]" },
            { "126": "[18,14,15,17]" },
            { "127": "[18,17,20,21]" },
            { "138": "[18,13,14,15,16,17]" },
            { "139": "[18,16,17,19,20,21]" }
        ],
    19:
        [
            { "19": "[19]" },
            { "67": "[19,16]" },
            { "49": "[19,20]" },
            { "68": "[19,22]" },
            { "103": "[19,20,21]" },
            { "116": "[19,16,17,20]" },
            { "117": "[19,20,22,23]" },
            { "139": "[19,16,17,18,20,21]" },
            { "140": "[19,20,21,22,23,24]" }
        ],
    20:
        [
            { "20": "[20]" },
            { "79": "[20,17]" },
            { "49": "[20,19]" },
            { "50": "[20,21]" },
            { "80": "[20,23]" },
            { "103": "[20,19,21]" },
            { "116": "[20,16,17,19]" },
            { "127": "[20,17,18,21]" },
            { "117": "[20,19,22,23]" },
            { "128": "[20,21,23,24]" },
            { "139": "[20,16,17,18,19,21]" },
            { "140": "[20,19,21,22,23,24]" }
        ],
    21:
        [
            { "21": "[21]" },
            { "91": "[21,18]" },
            { "50": "[21,20]" },
            { "92": "[21,24]" },
            { "103": "[21,19,20]" },
            { "127": "[21,17,18,20]" },
            { "128": "[21,20,23,24]" },
            { "139": "[21,16,17,18,19,20]" },
            { "140": "[21,19,20,22,23,24]" }
        ],
    22:
        [
            { "22": "[22]" },
            { "68": "[22,19]" },
            { "51": "[22,23]" },
            { "69": "[22,25]" },
            { "104": "[22,23,24]" },
            { "117": "[22,19,20,23]" },
            { "118": "[22,23,25,26]" },
            { "140": "[22,19,20,21,23,24]" },
            { "141": "[22,23,24,25,26,27]" }
        ],
    23:
        [
            { "23": "[23]" },
            { "80": "[23,20]" },
            { "51": "[23,22]" },
            { "52": "[23,24]" },
            { "81": "[23,26]" },
            { "104": "[23,22,24]" },
            { "117": "[23,19,20,22]" },
            { "128": "[23,20,21,24]" },
            { "118": "[23,22,25,26]" },
            { "129": "[23,24,26,27]" },
            { "140": "[23,19,20,21,22,24]" },
            { "141": "[23,22,24,25,26,27]" }
        ],
    24:
        [
            { "24": "[24]" },
            { "92": "[24,21]" },
            { "52": "[24,23]" },
            { "93": "[24,27]" },
            { "104": "[24,22,23]" },
            { "128": "[24,20,21,23]" },
            { "129": "[24,23,26,27]" },
            { "140": "[24,19,20,21,22,23]" },
            { "141": "[24,22,23,25,26,27]" }
        ],
    25:
        [
            { "25": "[25]" },
            { "69": "[25,22]" },
            { "53": "[25,26]" },
            { "70": "[25,28]" },
            { "105": "[25,26,27]" },
            { "118": "[25,22,23,26]" },
            { "119": "[25,26,28,29]" },
            { "141": "[25,22,23,24,26,27]" },
            { "142": "[25,26,27,28,29,30]" }
        ],
    26:
        [
            { "26": "[26]" },
            { "81": "[26,23]" },
            { "53": "[26,25]" },
            { "54": "[26,27]" },
            { "82": "[26,29]" },
            { "105": "[26,25,27]" },
            { "118": "[26,22,23,25]" },
            { "129": "[26,23,24,27]" },
            { "119": "[26,25,28,29]" },
            { "130": "[26,27,29,30]" },
            { "141": "[26,22,23,24,25,27]" },
            { "142": "[26,25,27,28,29,30]" }
        ],
    27:
        [
            { "27": "[27]" },
            { "93": "[27,24]" },
            { "54": "[27,26]" },
            { "94": "[27,30]" },
            { "105": "[27,25,26]" },
            { "129": "[27,23,24,26]" },
            { "130": "[27,26,29,30]" },
            { "141": "[27,22,23,24,25,26]" },
            { "142": "[27,25,26,28,29,30]" }
        ],
    28:
        [
            { "28": "[28]" },
            { "70": "[28,25]" },
            { "55": "[28,29]" },
            { "71": "[28,31]" },
            { "106": "[28,29,30]" },
            { "119": "[28,25,26,29]" },
            { "120": "[28,29,31,32]" },
            { "142": "[28,25,26,27,29,30]" },
            { "143": "[28,29,30,31,32,33]" }
        ],
    29:
        [
            { "29": "[29]" },
            { "82": "[29,26]" },
            { "55": "[29,28]" },
            { "56": "[29,30]" },
            { "83": "[29,32]" },
            { "106": "[29,28,30]" },
            { "119": "[29,25,26,28]" },
            { "130": "[29,26,27,30]" },
            { "120": "[29,28,31,32]" },
            { "131": "[29,30,32,33]" },
            { "142": "[29,25,26,27,28,30]" },
            { "143": "[29,28,30,31,32,33]" }
        ],
    30:
        [
            { "30": "[30]" },
            { "94": "[30,27]" },
            { "56": "[30,29]" },
            { "95": "[30,33]" },
            { "106": "[30,28,29]" },
            { "130": "[30,26,27,29]" },
            { "131": "[30,29,32,33]" },
            { "142": "[30,25,26,27,28,29]" },
            { "143": "[30,28,29,31,32,33]" }
        ],
    31:
        [
            { "31": "[31]" },
            { "71": "[31,28]" },
            { "57": "[31,32]" },
            { "72": "[31,34]" },
            { "107": "[31,32,33]" },
            { "120": "[31,28,29,32]" },
            { "121": "[31,32,34,35]" },
            { "143": "[31,28,29,30,32,33]" },
            { "144": "[31,32,33,34,35,36]" }
        ],
    32:
        [
            { "32": "[32]" },
            { "83": "[32,29]" },
            { "57": "[32,31]" },
            { "58": "[32,33]" },
            { "84": "[32,35]" },
            { "107": "[32,31,33]" },
            { "120": "[32,28,29,31]" },
            { "131": "[32,29,30,33]" },
            { "121": "[32,31,34,35]" },
            { "132": "[32,33,35,36]" },
            { "143": "[32,28,29,30,31,33]" },
            { "144": "[32,31,33,34,35,36]" }
        ],
    33:
        [
            { "33": "[33]" },
            { "95": "[33,30]" },
            { "58": "[33,32]" },
            { "96": "[33,36]" },
            { "107": "[33,31,32]" },
            { "131": "[33,29,30,32]" },
            { "132": "[33,32,35,36]" },
            { "143": "[33,28,29,30,31,32]" },
            { "144": "[33,31,32,34,35,36]" }
        ],
    34:
        [
            { "34": "[34]" },
            { "72": "[34,31]" },
            { "59": "[34,35]" },
            { "108": "[34,35,36]" },
            { "121": "[34,31,32,35]" },
            { "144": "[34,31,32,33,35,36]" }
        ],
    35:
        [
            { "35": "[35]" },
            { "84": "[35,32]" },
            { "59": "[35,34]" },
            { "60": "[35,36]" },
            { "121": "[35,31,32,34]" },
            { "132": "[35,32,33,36]" },
            { "144": "[35,31,32,33,34,36]" }
        ],
    36:
        [
            { "36": "[36]" },
            { "96": "[36,33]" },
            { "60": "[36,35]" },
            { "108": "[36,34,35]" },
            { "132": "[36,32,33,35]" },
            { "144": "[36,31,32,33,34,35]" }
        ]
}

lttDef.getBigAreaValue = function (key) {
    return this.bigBetList[Number(key)];
}
module.exports = lttDef;

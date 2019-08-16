
var ASSERT = require("assert")
//数目定义
const MAX_COUNT = 20;                                   //最大数目
const FULL_COUNT = 54;                                  //全牌数目

//逻辑数目
const NORMAL_COUNT = 17;                                //常规数目
const DISPATCH_COUNT = 51;                              //派发数目
const GOOD_CARD_COUTN = 38;                             //好牌数目

//排序类型
const ST_ORDER = 1;                                     //大小排序
const ST_COUNT = 2;                                     //数目排序
const ST_CUSTOM = 3;                                    //自定排序

//数值掩码
const MASK_COLOR = 0xF0;                                //花色掩码
const MASK_VALUE = 0x0F;                                //数值掩码

//逻辑类型
const CT_ERROR = 0;                                     //错误类型
const CT_SINGLE = 1;                                    //单牌类型
const CT_DOUBLE = 2;                                    //对牌类型
const CT_THREE = 3;                                     //三条类型
const CT_SINGLE_LINE = 4;                               //单连类型
const CT_DOUBLE_LINE = 5;                               //对连类型
const CT_THREE_LINE = 6;                                //三连类型
const CT_THREE_TAKE_ONE = 7;                            //三带一单
const CT_THREE_TAKE_TWO = 8;                            //三带一对
const CT_FOUR_TAKE_ONE = 9;                             //四带两单
const CT_FOUR_TAKE_TWO = 10;                            //四带两对
const CT_BOMB_CARD = 11;                                //炸弹类型
const CT_MISSILE_CARD = 12;                             //火箭类型
const CT_THREE_ONE_PLANE = 13;                          //带单飞机类型
const CT_THREE_TWO_PLANE = 14;                          //带对飞机类型


//底牌类型
const BCT_GENERAL = 0;                                  //普通类型
const BCT_FULSH = 1;                                    //顺子类型
const BCT_STRAIGHT = 2;                                 //同花类型
const BCT_STRAIGHT_FULSH = 3;                           //同花顺类型
const BCT_SINGLE_MISSILE = 4;                           //单王类型
const BCT_DOUBLE_MISSILE = 5;                           //对王类型
const BCT_THREE = 6;                                    //三条类型



//索引变量
const cbIndexCount=5;

//扑克数据
const m_cbCardData=[
    0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,   //方块 A - K
    0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1A,0x1B,0x1C,0x1D,   //梅花 A - K
    0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,0x2A,0x2B,0x2C,0x2D,   //红桃 A - K
    0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x3A,0x3B,0x3C,0x3D,   //黑桃 A - K
    0x4E,0x4F];

//////////////////////////////////////////////////////////////////////////////////

let doudizhuFP = {
    //分析结构
    tagAnalyseResult(){
        var AnalyseResult = [];
        AnalyseResult.cbBlockCount = [0,0,0,0];
        AnalyseResult.cbCardData = [];
        for (let i = 0; i<4; i++){
            AnalyseResult.cbCardData.push([]);
        }
        return AnalyseResult;
    },
    //分布信息
    tagDistributing(){
        var Distributing = [];
        Distributing.cbCardCount=0;                       //扑克数目
        Distributing.cbDistributing = [];               //分布信息
        for (let i = 0; i<15; i++){
            let list = [];
            for (let j = 0; j<6; j++){
                list.push([]);
            }
            Distributing.cbDistributing.push(list);
        }
        return Distributing;
    },
    //搜索结果
    tagSearchCardResult(){
        var SearchCardResult = [];
        SearchCardResult.cbSearchCount=0;                 //结果数目
        SearchCardResult.cbCardCount = [0,0,0,0];               //扑克数目
        SearchCardResult.cbResultCard = [];             //结果扑克
        for (let i = 0; i<MAX_COUNT; i++){
            SearchCardResult.cbResultCard.push([]);
        }
        return SearchCardResult;
    },
    //获取数值
    GetCardValue(cbCardData) { return cbCardData&MASK_VALUE; },
    //获取花色
    GetCardColor(cbCardData) { return cbCardData&MASK_COLOR; },
    //获取类型
    GetCardType(cbCardData){
        let cbCardCount = cbCardData.length;
        //简单牌型
        switch (cbCardCount)
        {
        case 0: //空牌
            return CT_ERROR;
        case 1: //单牌
            return CT_SINGLE;
        case 2: //对牌火箭
                //牌型判断
            if (((cbCardData[0]==0x4F)&&(cbCardData[1]==0x4E)) ||
            ((cbCardData[0]==0x4E)&&(cbCardData[1]==0x4F))) return CT_MISSILE_CARD;
            if (this.GetCardLogicValue(cbCardData[0])==this.GetCardLogicValue(cbCardData[1])) return CT_DOUBLE;
            return CT_ERROR;
        }

    //分析扑克
    let AnalyseResult = this.AnalysebCardData(cbCardData);

    //四牌判断
    if (AnalyseResult.cbBlockCount[3]>0)
    {
        //牌型判断
        if ((AnalyseResult.cbBlockCount[3]==1) && (cbCardCount==4)) return CT_BOMB_CARD;
        if ((AnalyseResult.cbBlockCount[3]==1) && (cbCardCount==6)) return CT_FOUR_TAKE_ONE;
        if ((AnalyseResult.cbBlockCount[3]==1)&&(cbCardCount==8)&&(AnalyseResult.cbBlockCount[1]==2)) return CT_FOUR_TAKE_TWO;

        return CT_ERROR;
    }

    //三牌判断
    if (AnalyseResult.cbBlockCount[2]>0)
    {
        //连牌判断
        if (AnalyseResult.cbBlockCount[2]>1)
        {
            //变量定义
            let cbCardData=AnalyseResult.cbCardData[2][0];
            let cbFirstLogicValue=this.GetCardLogicValue(cbCardData);

            //错误过虑
            if (cbFirstLogicValue>=15) return CT_ERROR;

            //连牌判断
            for (let i=1;i<AnalyseResult.cbBlockCount[2];i++)
            {
                let cbCardData=AnalyseResult.cbCardData[2][i*3];
                if (cbFirstLogicValue!=(this.GetCardLogicValue(cbCardData)-i)
                    &&cbFirstLogicValue!=(this.GetCardLogicValue(cbCardData)+i)) return CT_ERROR;
            }
        }
        else if( cbCardCount == 3 ) return CT_THREE;

        console.log("返回了三连类型", AnalyseResult.cbBlockCount[2]*3==cbCardCount)
        console.log("返回了三带一类型", AnalyseResult.cbBlockCount[2]*4==cbCardCount)
        console.log("返回了三带二类型", AnalyseResult.cbBlockCount[2]*5==cbCardCount)
        //牌形判断
        if (AnalyseResult.cbBlockCount[2]*3==cbCardCount) return CT_THREE_LINE;
        if (AnalyseResult.cbBlockCount[2]*4==cbCardCount && AnalyseResult.cbBlockCount[2]>1 ) return CT_THREE_ONE_PLANE;
        if (AnalyseResult.cbBlockCount[2]*5==cbCardCount && AnalyseResult.cbBlockCount[2]>1 ) return CT_THREE_TWO_PLANE;
        if (AnalyseResult.cbBlockCount[2]*4==cbCardCount) return CT_THREE_TAKE_ONE;
        if ((AnalyseResult.cbBlockCount[2]*5==cbCardCount)&&(AnalyseResult.cbBlockCount[1]==AnalyseResult.cbBlockCount[2])) return CT_THREE_TAKE_TWO;

        console.log('返回了什么类型', CT_ERROR)
        return CT_ERROR;
    }

    //两张类型
    if (AnalyseResult.cbBlockCount[1]>=3)
    {
        //变量定义
        let cbCardData=AnalyseResult.cbCardData[1][0];
        let cbFirstLogicValue=this.GetCardLogicValue(cbCardData);

        //错误过虑
        if (cbFirstLogicValue>=15) return CT_ERROR;

        //连牌判断
        for (let i=1;i<AnalyseResult.cbBlockCount[1];i++)
        {
            let cbCardData=AnalyseResult.cbCardData[1][i*2];
            if (cbFirstLogicValue!=(this.GetCardLogicValue(cbCardData)-i)
                &&cbFirstLogicValue!=(this.GetCardLogicValue(cbCardData)+i)) return CT_ERROR;
        }

        //二连判断
        if ((AnalyseResult.cbBlockCount[1]*2)==cbCardCount) return CT_DOUBLE_LINE;

        return CT_ERROR;
    }

    //单张判断
    if ((AnalyseResult.cbBlockCount[0]>=5)&&(AnalyseResult.cbBlockCount[0]==cbCardCount))
    {
        //变量定义
        let cbCardData=AnalyseResult.cbCardData[0][0];
        let cbFirstLogicValue = this.GetCardLogicValue(cbCardData);

        //错误过虑
        if (cbFirstLogicValue>=15) return CT_ERROR;

        //连牌判断
        for (let i=1;i<AnalyseResult.cbBlockCount[0];i++)
        {
            let cbCardData=AnalyseResult.cbCardData[0][i];
            if (cbFirstLogicValue!=(this.GetCardLogicValue(cbCardData)-i)
            &&cbFirstLogicValue!=(this.GetCardLogicValue(cbCardData)+i)) return CT_ERROR;
        }

        return CT_SINGLE_LINE;
    }

    return CT_ERROR;
},

//获取类型
GetBackCardType(cbCardData)
{
    let cbCardDataTemp = cbCardData.slice(0);
    this.SortCardList(cbCardDataTemp, ST_ORDER);
    //分析扑克
    let AnalyseResult = this.AnalysebCardData(cbCardDataTemp);

    if (AnalyseResult.cbBlockCount[2] > 0)
    {
        //三条
        return BCT_THREE;
    }
    else if (3 == AnalyseResult.cbBlockCount[0])
    {
        if (0x4F==AnalyseResult.cbCardData[0][0] && 0x4E==AnalyseResult.cbCardData[0][1])
        {
            //双王
            return BCT_DOUBLE_MISSILE;
        }
        else if (0x4F==AnalyseResult.cbCardData[0][0] || 0x4E==AnalyseResult.cbCardData[0][0]
        || 0x4F==AnalyseResult.cbCardData[0][1] || 0x4E==AnalyseResult.cbCardData[0][1])
        {
            //单王
            return BCT_SINGLE_MISSILE;
        }
        let bStraight = true, bFlush = true;

        for (let i = 1; i < 3; i++)
        {
            if(this.GetCardColor(AnalyseResult.cbCardData[0][0]) != this.GetCardColor(AnalyseResult.cbCardData[0][i]))
            {
                bStraight = false;
                break;
            }
        }
        if (2 != this.GetCardValue(AnalyseResult.cbCardData[0][0]) - this.GetCardValue(AnalyseResult.cbCardData[0][2]))
        {
            bFlush = false;
        }
        if (bFlush && bStraight)
        {
            //同花顺
            return BCT_STRAIGHT_FULSH;
        }
        else if (bFlush)
        {
            //顺子
            return BCT_FULSH;
        }
        else if (bStraight)
        {
            //同花
            return BCT_STRAIGHT;
        }
    }

    return BCT_GENERAL;
},

//排列扑克
SortCardList(cbCardData, cbSortType)
{
    let cbCardCount = cbCardData.length;
    //数目过虑
    if (cbCardCount==0) return;
    if (cbSortType==ST_CUSTOM) return;

    //转换数值
    let cbSortValue = [];
    for (let i=0;i<cbCardCount;i++) cbSortValue[i]=this.GetCardLogicValue(cbCardData[i]);

    //排序操作
    let bSorted=true, cbSwitchData=0, cbLast=cbCardCount-1;
    do
    {
        bSorted=true;
        for (let i=0;i<cbLast;i++)
        {
            if ((cbSortValue[i]<cbSortValue[i+1])||
                ((cbSortValue[i]==cbSortValue[i+1])&&(cbCardData[i]<cbCardData[i+1])))
            {
                //设置标志
                bSorted=false;

                //扑克数据
                cbSwitchData=cbCardData[i];
                cbCardData[i]=cbCardData[i+1];
                cbCardData[i+1]=cbSwitchData;

                //排序权位
                cbSwitchData=cbSortValue[i];
                cbSortValue[i]=cbSortValue[i+1];
                cbSortValue[i+1]=cbSwitchData;
            }
        }
        cbLast--;
    } while(bSorted==false);

    //数目排序
    if (cbSortType==ST_COUNT)
    {
        //变量定义
        let cbCardIndex=0;

        //分析扑克
        let AnalyseResult = this.AnalysebCardData(cbCardData[cbCardIndex]);
        //提取扑克
        for (let i=0;i<AnalyseResult.cbBlockCount.length;i++)
        {
            //拷贝扑克
            let cbIndex=AnalyseResult.cbBlockCount.length-i-1;
            cbCardData[cbCardIndex] = AnalyseResult.cbCardData[cbIndex].slice(0);

            //设置索引
            cbCardIndex+=AnalyseResult.cbBlockCount[cbIndex]*(cbIndex+1);
        }
    }

    return;
},

//混乱扑克
RandCardList(cbCardBuffer, cbBufferCount)
{
    //混乱准备
    let cbCardData = m_cbCardData.slice(0);

    //混乱扑克
    let cbRandCount=0,cbPosition=0;
    do
    {
        cbPosition=parseInt(Math.random()*100)%(cbBufferCount-cbRandCount);
        cbCardBuffer[cbRandCount++]=cbCardData[cbPosition];
        cbCardData[cbPosition]=cbCardData[cbBufferCount-cbRandCount];
    } while (cbRandCount<cbBufferCount);

    return;
},

//删除扑克
RemoveCardList(cbRemoveCard, cbCardData)
{
    let cbRemoveCount = cbRemoveCard.length;
    let cbCardCount = cbCardData.length;
    //检验数据
    ASSERT(cbRemoveCount<=cbCardCount);

    //定义变量
    let cbDeleteCount=0,cbTempCardData = [];
    if (cbCardCount>MAX_COUNT) return false;
    cbTempCardData = cbCardData.slice(0);

    //置零扑克
    for (let i=0;i<cbRemoveCount;i++)
    {
        for (let j=0;j<cbCardCount;j++)
        {
            if (cbRemoveCard[i]==cbTempCardData[j])
            {
                cbDeleteCount++;
                cbTempCardData[j]=0;
                break;
            }
        }
    }
    if (cbDeleteCount!=cbRemoveCount) return false;

    //清理扑克
    let cbCardPos=0;
    for (let i=0;i<cbCardCount;i++)
    {
        if (cbTempCardData[i]!=0) cbCardData[cbCardPos++]=cbTempCardData[i];
    }

    return true;
},

//删除扑克
RemoveCard(cbRemoveCard, cbCardData)
{
    let cbRemoveCount = cbRemoveCard.length;
    let cbCardCount = cbCardData.length;
    //检验数据
    ASSERT(cbRemoveCount<=cbCardCount);

    //定义变量
    let cbDeleteCount=0,cbTempCardData = [];
    if (cbCardCount>MAX_COUNT) return false;
    cbTempCardData = cbCardData.slice(0);

    //置零扑克
    for (let i=0;i<cbRemoveCount;i++)
    {
        for (let j=0;j<cbCardCount;j++)
        {
            if (cbRemoveCard[i]==cbTempCardData[j])
            {
                cbDeleteCount++;
                cbTempCardData[j]=0;
                break;
            }
        }
    }
    if (cbDeleteCount!=cbRemoveCount) return false;

    //清理扑克
    let cbCardPos=0;
    for (let i=0;i<cbCardCount;i++)
    {
        if (cbTempCardData[i]!=0){
            cbCardData[cbCardPos++]=cbTempCardData[i];
        }else {
            cbCardData.splice(i);
        }
    }

    return true;
},

//排列扑克
SortOutCardList(cbCardData)
{
    let cbCardCount = cbCardData.length;
    //获取牌型
    let cbCardType = this.GetCardType(cbCardData);

    if( cbCardType == CT_THREE_TAKE_ONE || cbCardType == CT_THREE_TAKE_TWO )
    {
        //分析牌
        let AnalyseResult = this.AnalysebCardData(cbCardData);
        cbCardCount = AnalyseResult.cbBlockCount[2]*3;
        cbCardData = AnalyseResult.cbCardData[2].slice(0);
        for(let i = AnalyseResult.cbBlockCount.length-1; i >= 0; i--)
        {
            if( i == 2 ) continue;

            if( AnalyseResult.cbBlockCount[i] > 0 )
            {
                cbCardData[cbCardCount] = AnalyseResult.cbCardData[i].slice(0);
                cbCardCount += (i+1)*AnalyseResult.cbBlockCount[i];
            }
        }
    }
    else if( cbCardType == CT_FOUR_TAKE_ONE || cbCardType == CT_FOUR_TAKE_TWO )
    {
        //分析牌
        let AnalyseResult = this.AnalysebCardData(cbCardData);

        cbCardCount = AnalyseResult.cbBlockCount[3]*4;
        cbCardData = AnalyseResult.cbCardData[3].slice(0);
        for( let i = AnalyseResult.cbBlockCount.length-1; i >= 0; i-- )
        {
            if( i == 3 ) continue;

            if( AnalyseResult.cbBlockCount[i] > 0 )
            {
                cbCardData[cbCardCount] = AnalyseResult.cbCardData[i].slice(0);
                cbCardCount += (i+1)*AnalyseResult.cbBlockCount[i];
            }
        }
    }
    else if ( cbCardType == CT_THREE_ONE_PLANE || cbCardType == CT_THREE_TWO_PLANE)
    {
        let AnalyseResult = this.AnalysebCardData(cbCardData);

        cbCardCount = AnalyseResult.cbBlockCount[2]*3;
        cbCardData = AnalyseResult.cbCardData[2].slice(0);
        for(let i = AnalyseResult.cbBlockCount.length-1; i >= 0; i--)
        {
            if( i == 2 ) continue;

            if( AnalyseResult.cbBlockCount[i] > 0 )
            {
                cbCardData[cbCardCount] = AnalyseResult.cbCardData[i].slice(0);
                cbCardCount += (i+1)*AnalyseResult.cbBlockCount[i];
            }
        }
    }

    return cbCardData;
},

//逻辑数值
GetCardLogicValue(cbCardData)
{
    //扑克属性
    let cbCardColor=this.GetCardColor(cbCardData);
    let cbCardValue=this.GetCardValue(cbCardData);

    //转换数值
    if (cbCardColor==0x40) return cbCardValue+2;
    return (cbCardValue<=2)?(cbCardValue+13):cbCardValue;
},

//对比扑克
CompareCard(cbFirstCard, cbNextCard)
{
    let cbFirstCount = cbFirstCard.length,
        cbNextCount = cbNextCard.length;
    //获取类型
    let cbNextType=this.GetCardType(cbNextCard);
    let cbFirstType=this.GetCardType(cbFirstCard);

    //类型判断
    if (cbNextType==CT_ERROR) return false;
    if (cbNextType==CT_MISSILE_CARD) return true;

    //炸弹判断
    if ((cbFirstType!=CT_BOMB_CARD)&&(cbNextType==CT_BOMB_CARD)) return true;
    if ((cbFirstType==CT_BOMB_CARD)&&(cbNextType!=CT_BOMB_CARD)) return false;

    //规则判断
    if ((cbFirstType!=cbNextType)||(cbFirstCount!=cbNextCount)) return false;

    //开始对比
    switch (cbNextType)
    {
    case CT_SINGLE:
    case CT_DOUBLE:
    case CT_THREE:
    case CT_SINGLE_LINE:
    case CT_DOUBLE_LINE:
    case CT_THREE_LINE:
    case CT_BOMB_CARD:
        {
            //获取数值
            let cbNextLogicValue=this.GetCardLogicValue(cbNextCard[0]);
            let cbFirstLogicValue=this.GetCardLogicValue(cbFirstCard[0]);

            //对比扑克
            return cbNextLogicValue>cbFirstLogicValue;
        }
    case CT_THREE_TAKE_ONE:
    case CT_THREE_TAKE_TWO:
        {
            //分析扑克
            let NextResult = this.AnalysebCardData(cbNextCard);
            let FirstResult = this.AnalysebCardData(cbFirstCard);

            //获取数值
            let cbNextLogicValue=this.GetCardLogicValue(NextResult.cbCardData[2][0]);
            let cbFirstLogicValue=this.GetCardLogicValue(FirstResult.cbCardData[2][0]);

            //对比扑克
            return cbNextLogicValue>cbFirstLogicValue;
        }
    case CT_FOUR_TAKE_ONE:
    case CT_FOUR_TAKE_TWO:
        {
            //分析扑克
            let NextResult = this.AnalysebCardData(cbNextCard);
            let FirstResult = this.AnalysebCardData(cbFirstCard);

            //获取数值
            let cbNextLogicValue=this.GetCardLogicValue(NextResult.cbCardData[3][0]);
            let cbFirstLogicValue=this.GetCardLogicValue(FirstResult.cbCardData[3][0]);

            //对比扑克
            return cbNextLogicValue>cbFirstLogicValue;
        }
    }

    return false;
},

//构造扑克
MakeCardData(cbValueIndex, cbColorIndex)
{
    return (cbColorIndex<<4)|(cbValueIndex+1);
},

//分析扑克
AnalysebCardData(cbCardData)
{
    let AnalyseResult = this.tagAnalyseResult(),
        cbCardCount = cbCardData.length;

    //扑克分析
    for (let i=0;i<cbCardCount;i++)
    {
        //变量定义
        let cbSameCount=1,cbCardValueTemp=0;
        let cbLogicValue=this.GetCardLogicValue(cbCardData[i]);

        //搜索同牌
        for (let j=i+1;j<cbCardCount;j++)
        {
            //获取扑克
            if (this.GetCardLogicValue(cbCardData[j])!=cbLogicValue) break;

            //设置变量
            cbSameCount++;
        }

        //设置结果
        let cbIndex=AnalyseResult.cbBlockCount[cbSameCount-1]++;
        for (let j=0;j<cbSameCount;j++)
            AnalyseResult.cbCardData[cbSameCount-1][cbIndex*cbSameCount+j]=cbCardData[i+j];

        //设置索引
        i+=cbSameCount-1;
    }

    return AnalyseResult;
},

//分析分布
AnalysebDistributing(cbCardData)
{
    //设置变量
    let Distributing = this.tagDistributing(),
        cbCardCount = cbCardData.length;

    //设置变量
    for (let i=0;i<cbCardCount;i++)
    {
        if (cbCardData[i]==0) continue;

        //获取属性
        let cbCardColor=this.GetCardColor(cbCardData[i]);
        let cbCardValue=this.GetCardValue(cbCardData[i]);

        //分布信息
        Distributing.cbCardCount++;
        Distributing.cbDistributing[cbCardValue-1][cbIndexCount]++;
        Distributing.cbDistributing[cbCardValue-1][cbCardColor>>4]++;
    }

    return Distributing;
},

//出牌搜索
SearchOutCard(cbHandCardData, cbTurnCardData){
    //设置结果
    let cbHandCardCount = cbHandCardData.length;
    let cbTurnCardCount = cbTurnCardData.length;

    let pSearchCardResult = this.tagSearchCardResult();

    //变量定义
    let cbResultCount = 0;
    let tmpSearchCardResult = [];

    //构造扑克
    let cbCardCount=cbHandCardCount;
    let cbCardData = cbHandCardData.slice(0);

    //排列扑克
    this.SortCardList(cbCardData,ST_ORDER);

    //获取类型
    let cbTurnOutType=this.GetCardType(cbTurnCardData);

    if(cbHandCardCount>=cbTurnCardCount){
    //出牌分析
    switch (cbTurnOutType)
    {
    case CT_ERROR:                  //错误类型
        {
            //提取各种牌型一组
            ASSERT( pSearchCardResult );
            if( !pSearchCardResult ) return 0;

            //是否一手出完
            if( this.GetCardType(cbCardData) != CT_ERROR )
            {
                pSearchCardResult.cbCardCount[cbResultCount] = cbCardCount;
                pSearchCardResult.cbResultCard[cbResultCount] = cbCardData.slice(0);
                cbResultCount++;
            }

            //如果最小牌不是单牌，则提取
            let cbSameCount = 0;
            if( cbCardCount > 1 && this.GetCardValue(cbCardData[cbCardCount-1]) == this.GetCardValue(cbCardData[cbCardCount-2]) )
            {
                cbSameCount = 1;
                pSearchCardResult.cbResultCard[cbResultCount][0] = cbCardData[cbCardCount-1];
                let cbCardValue = this.GetCardValue(cbCardData[cbCardCount-1]);
                for(let i = cbCardCount-2; i >= 0; i-- )
                {
                    if(this.GetCardValue(cbCardData[i]) == cbCardValue)
                    {
                        pSearchCardResult.cbResultCard[cbResultCount][cbSameCount++] = cbCardData[i];
                    }
                    else break;
                }

                pSearchCardResult.cbCardCount[cbResultCount] = cbSameCount;
                cbResultCount++;
            }

            //单牌
            let cbTmpCount = 0;
            if( cbSameCount != 1 )
            {
                let sameData = this.SearchSameCard( cbCardData, 0, 1);
                cbTmpCount = sameData.count;
                tmpSearchCardResult = sameData.result;
                if( cbTmpCount > 0 )
                {
                    pSearchCardResult.cbCardCount[cbResultCount] = tmpSearchCardResult.cbCardCount[0];
                    pSearchCardResult.cbResultCard[cbResultCount] = tmpSearchCardResult.cbResultCard[0].slice(0);
                    cbResultCount++;
                }
            }

            //对牌
            if( cbSameCount != 2 )
            {
                let sameData = this.SearchSameCard( cbCardData, 0, 2);
                cbTmpCount = sameData.count;
                tmpSearchCardResult = sameData.result;
                if( cbTmpCount > 0 )
                {
                    pSearchCardResult.cbCardCount[cbResultCount] = tmpSearchCardResult.cbCardCount[0];
                    pSearchCardResult.cbResultCard[cbResultCount] = tmpSearchCardResult.cbResultCard[0].slice(0);
                    cbResultCount++;
                }
            }

            //三条
            if( cbSameCount != 3 )
            {
                let sameData = this.SearchSameCard(cbCardData, 0, 3);
                cbTmpCount = sameData.count;
                tmpSearchCardResult = sameData.result;
                if( cbTmpCount > 0 )
                {
                    pSearchCardResult.cbCardCount[cbResultCount] = tmpSearchCardResult.cbCardCount[0];
                    pSearchCardResult.cbResultCard[cbResultCount] = tmpSearchCardResult.cbResultCard[0].slice(0);
                    cbResultCount++;
                }
            }

            //三带一单
            let SameData = this.SearchTakeCardType(cbCardData,0, 3, 1);
            cbTmpCount = SameData.count;
            tmpSearchCardResult = SameData.result;
            if( cbTmpCount > 0 )
            {
                pSearchCardResult.cbCardCount[cbResultCount] = tmpSearchCardResult.cbCardCount[0];
                pSearchCardResult.cbResultCard[cbResultCount] = tmpSearchCardResult.cbResultCard[0].slice(0);
                cbResultCount++;
            }

            //三带一对
            SameData = this.SearchTakeCardType( cbCardData,0, 3, 2);
            cbTmpCount = SameData.count;
            tmpSearchCardResult = SameData.result;
            if( cbTmpCount > 0 )
            {
                pSearchCardResult.cbCardCount[cbResultCount] = tmpSearchCardResult.cbCardCount[0];
                pSearchCardResult.cbResultCard[cbResultCount] = tmpSearchCardResult.cbResultCard[0].slice(0);
                cbResultCount++;
            }

            //单连
            let sameData = this.SearchLineCardType(cbCardData, 0, 1, 0);
            cbTmpCount = sameData.count;
            tmpSearchCardResult = sameData.result;
            if( cbTmpCount > 0 )
            {
                pSearchCardResult.cbCardCount[cbResultCount] = tmpSearchCardResult.cbCardCount[0];
                pSearchCardResult.cbResultCard[cbResultCount] = tmpSearchCardResult.cbResultCard[0].slice(0);
                cbResultCount++;
            }

            //连对
            sameData = this.SearchLineCardType(cbCardData, 0, 2, 0);
            cbTmpCount = sameData.count;
            tmpSearchCardResult = sameData.result;
            if( cbTmpCount > 0 )
            {
                pSearchCardResult.cbCardCount[cbResultCount] = tmpSearchCardResult.cbCardCount[0];
                pSearchCardResult.cbResultCard[cbResultCount] = tmpSearchCardResult.cbResultCard[0].slice(0);
                cbResultCount++;
            }

            //三连
            sameData = this.SearchLineCardType(cbCardData, 0, 3, 0);
            cbTmpCount = sameData.count;
            tmpSearchCardResult = sameData.result;
            if( cbTmpCount > 0 )
            {
                pSearchCardResult.cbCardCount[cbResultCount] = tmpSearchCardResult.cbCardCount[0];
                pSearchCardResult.cbResultCard[cbResultCount] = tmpSearchCardResult.cbResultCard[0].slice(0);
                cbResultCount++;
            }

            ////飞机
            sameData = this.SearchThreeTwoLine(cbCardData);
            cbTmpCount = sameData.count;
            tmpSearchCardResult = sameData.result;
            if( cbTmpCount > 0 )
            {
                pSearchCardResult.cbCardCount[cbResultCount] = tmpSearchCardResult.cbCardCount[0];
                pSearchCardResult.cbResultCard[cbResultCount] = tmpSearchCardResult.cbResultCard[0].slice(0);
                cbResultCount++;
            }

            //炸弹
            if( cbSameCount != 4 )
            {
                let sameData = this.SearchSameCard(cbCardData, 0,4);
                cbTmpCount = sameData.count;
                tmpSearchCardResult = sameData.result;
                if( cbTmpCount > 0 )
                {
                    pSearchCardResult.cbCardCount[cbResultCount] = tmpSearchCardResult.cbCardCount[0];
                    pSearchCardResult.cbResultCard[cbResultCount] = tmpSearchCardResult.cbResultCard[0].slice(0);
                    cbResultCount++;
                }
            }

            //搜索火箭
            if ((cbCardCount>=2)&&(cbCardData[0]==0x4F)&&(cbCardData[1]==0x4E))
            {
                //设置结果
                pSearchCardResult.cbCardCount[cbResultCount] = 2;
                pSearchCardResult.cbResultCard[cbResultCount][0] = cbCardData[0];
                pSearchCardResult.cbResultCard[cbResultCount][1] = cbCardData[1];

                cbResultCount++;
            }

            pSearchCardResult.cbSearchCount = cbResultCount;
            return cbResultCount;
        }
    case CT_SINGLE:
    case CT_DOUBLE:
    case CT_THREE:                  //三条类型
        {
            //变量定义
            let cbReferCard=cbTurnCardData[0];
            let cbSameCount = 1;
            if( cbTurnOutType == CT_DOUBLE ) cbSameCount = 2;
            else if( cbTurnOutType == CT_THREE ) cbSameCount = 3;

            //搜索相同牌
            let sameData = this.SearchSameCard( cbCardData, cbReferCard, cbSameCount);
            cbResultCount = sameData.count;
            pSearchCardResult = sameData.result;
            break;
        }
    case CT_SINGLE_LINE:
    case CT_DOUBLE_LINE:
    case CT_THREE_LINE:             //三连类型
        {
            //变量定义
            let cbBlockCount = 1;
            if( cbTurnOutType == CT_DOUBLE_LINE ) cbBlockCount = 2;
            else if( cbTurnOutType == CT_THREE_LINE ) cbBlockCount = 3;

            let cbLineCount = cbTurnCardCount/cbBlockCount;

            //搜索边牌
            let sameData = this.SearchLineCardType( cbCardData,cbTurnCardData[0],cbBlockCount,cbLineCount);
            cbResultCount = sameData.count;
            pSearchCardResult = sameData.result;
            break;
        }
    case CT_THREE_TAKE_ONE:
    case CT_THREE_TAKE_TWO: //三带一对
        {
            //效验牌数
            if( cbCardCount < cbTurnCardCount ) break;

            //如果是三带一或三带二
            if( cbTurnCardCount == 4 || cbTurnCardCount == 5 )
            {
                let cbTakeCardCount = cbTurnOutType==CT_THREE_TAKE_ONE?1:2;

                //搜索三带牌型
                let sameData = this.SearchTakeCardType( cbCardData,cbTurnCardData[2],3,cbTakeCardCount);
                cbResultCount = sameData.count;
                pSearchCardResult = sameData.result;
            }
            else
            {
                //变量定义
                let cbBlockCount = 3;
                let cbLineCount = cbTurnCardCount/(cbTurnOutType==CT_THREE_TAKE_ONE?4:5);
                let cbTakeCardCount = cbTurnOutType==CT_THREE_TAKE_ONE?1:2;

                //搜索连牌
                let cbTmpTurnCard = cbTurnCardData.slice(0);
                this.SortOutCardList(cbTmpTurnCard);
                let sameData = this.SearchLineCardType( cbCardData,cbTmpTurnCard[0],cbBlockCount,cbLineCount);
                cbResultCount = sameData.count;
                pSearchCardResult = sameData.result;
                //提取带牌
                let bAllDistill = true;
                for( let i = 0; i < cbResultCount; i++ )
                {
                    let cbResultIndex = cbResultCount-i-1;

                    //变量定义
                    let cbTmpCardData = cbCardData.slice(0);
                    let cbTmpCardCount = cbCardCount;

                    //删除连牌
                    ASSERT( this.RemoveCard( pSearchCardResult.cbResultCard[cbResultIndex],cbTmpCardData));
                    cbTmpCardCount -= pSearchCardResult.cbCardCount[cbResultIndex];

                    //分析牌
                    let TmpResult = this.AnalysebCardData(cbTmpCardData);

                    //提取牌
                    let cbDistillCard = [];
                    let cbDistillCount = 0;
                    for( let j = cbTakeCardCount-1; j < TmpResult.cbBlockCount.length; j++ )
                    {
                        if( TmpResult.cbBlockCount[j] > 0 )
                        {
                            if( j+1 == cbTakeCardCount && TmpResult.cbBlockCount[j] >= cbLineCount )
                            {
                                let cbTmpBlockCount = TmpResult.cbBlockCount[j];
                                cbDistillCard = TmpResult.cbCardData[j].slice(0);
                                cbDistillCount = (j+1)*cbLineCount;
                                break;
                            }
                            else
                            {
                                for(let k = 0; k < TmpResult.cbBlockCount[j]; k++ )
                                {
                                    let cbTmpBlockCount = TmpResult.cbBlockCount[j];
                                    cbDistillCard[cbDistillCount] = TmpResult.cbCardData[j].slice(0);
                                    cbDistillCount += cbTakeCardCount;

                                    //提取完成
                                    if( cbDistillCount == cbTakeCardCount*cbLineCount ) break;
                                }
                            }
                        }

                        //提取完成
                        if( cbDistillCount == cbTakeCardCount*cbLineCount ) break;
                    }

                    //提取完成
                    if( cbDistillCount == cbTakeCardCount*cbLineCount )
                    {
                        //复制带牌
                        let cbCount = pSearchCardResult.cbCardCount[cbResultIndex];
                        pSearchCardResult.cbResultCard[cbResultIndex] = pSearchCardResult.cbResultCard[cbResultIndex].concat(cbDistillCard);
                        pSearchCardResult.cbCardCount[cbResultIndex] += cbDistillCount;
                    }
                    //否则删除连牌
                    else
                    {
                        bAllDistill = false;
                        pSearchCardResult.cbCardCount[cbResultIndex] = 0;
                    }
                }

                //整理组合
                if( !bAllDistill )
                {
                    pSearchCardResult.cbSearchCount = cbResultCount;
                    cbResultCount = 0;
                    for(let i = 0; i < pSearchCardResult.cbSearchCount; i++ )
                    {
                        if( pSearchCardResult.cbCardCount[i] != 0 )
                        {
                            tmpSearchCardResult.cbCardCount[cbResultCount] = pSearchCardResult.cbCardCount[i];
                            tmpSearchCardResult.cbResultCard[cbResultCount] = pSearchCardResult.cbResultCard[i].slice(0);
                            cbResultCount++;
                        }
                    }
                    tmpSearchCardResult.cbSearchCount = cbResultCount;
                    pSearchCardResult = tmpSearchCardResult.slice(0);
                }
            }

            break;
        }
    case CT_THREE_ONE_PLANE:
    case CT_THREE_TWO_PLANE:
        {
            //在结果中
            let resultIndex = cbTurnOutType==CT_THREE_ONE_PLANE?0:1;

            // let cbTmpTurnCard = cbTurnCardData.slice(0);
            let cbTmpTurnCardList = cbTurnCardData.slice(0),
                cbTmpTurnCard = 0;

            let threeData = this.SearchSameCard(cbTmpTurnCardList, 0, 3);
            if (threeData.count < 2)break;

            for (let threeIndex = 0; threeIndex<threeData.result.cbSearchCount; threeIndex++){
                let before = this.GetCardValue(threeData.result.cbResultCard[threeIndex][0]);
                cbTmpTurnCard = before>cbTmpTurnCard?before:cbTmpTurnCard;
            }


            let sameData = this.SearchThreeTwoLine(cbCardData, cbTmpTurnCard);
            cbResultCount = sameData.count;
            pSearchCardResult = sameData.result;

            if(resultIndex==0){
                pSearchCardResult.cbResultCard[0] = pSearchCardResult.cbResultCard[1].slice(0);
                pSearchCardResult.cbResultCard[1] = [];
                cbResultCount = 1;
            }else{
                pSearchCardResult.cbResultCard[1] = [];
                cbResultCount = 1;
            }
            break;
        }
    case CT_FOUR_TAKE_ONE:
    case CT_FOUR_TAKE_TWO:      //四带两双
        {
            let cbTakeCount = cbTurnOutType==CT_FOUR_TAKE_ONE?1:2;

            let cbTmpTurnCard = cbTurnCardData.slice(0);
            this.SortOutCardList(cbTmpTurnCard);

            //搜索带牌
            let sameData = this.SearchTakeCardType( cbCardData,cbTmpTurnCard[0],4,cbTakeCount);
            cbResultCount = sameData.count;
            pSearchCardResult = sameData.result;
            break;
        }
    }
    }

    //搜索炸弹
    if ((cbCardCount>=4)&&(cbTurnOutType!=CT_MISSILE_CARD))
    {
        //变量定义
        let cbReferCard = 0;
        if (cbTurnOutType==CT_BOMB_CARD) cbReferCard=cbTurnCardData[0];

        //搜索炸弹
        let sameData = this.SearchSameCard( cbCardData,cbReferCard,4);
        let cbTmpResultCount = sameData.count;
        tmpSearchCardResult = sameData.result;
        for(let i = 0; i < cbTmpResultCount; i++ )
        {
            pSearchCardResult.cbCardCount[cbResultCount] = tmpSearchCardResult.cbCardCount[i];
            pSearchCardResult.cbResultCard[cbResultCount] = tmpSearchCardResult.cbResultCard[i].slice(0);
            cbResultCount++;
        }
    }

    //搜索火箭
    if (cbTurnOutType!=CT_MISSILE_CARD&&(cbCardCount>=2)&&(cbCardData[0]==0x4F)&&(cbCardData[1]==0x4E))
    {
        //设置结果
        pSearchCardResult.cbCardCount[cbResultCount] = 2;
        pSearchCardResult.cbResultCard[cbResultCount][0] = cbCardData[0];
        pSearchCardResult.cbResultCard[cbResultCount][1] = cbCardData[1];

        cbResultCount++;
    }
    pSearchCardResult.cbSearchCount = cbResultCount;
    return {count:cbResultCount, result:pSearchCardResult};
},

//同牌搜索
SearchSameCard(cbHandCardData, cbReferCard, cbSameCardCount)
{
    //设置结果
    let pSearchCardResult = this.tagSearchCardResult();
    let cbResultCount = 0;

    //构造扑克
    let cbCardData = cbHandCardData.slice(0);

    //排列扑克
    this.SortCardList(cbCardData,ST_ORDER);

    //分析扑克
    let AnalyseResult = this.AnalysebCardData(cbCardData);

    let cbReferLogicValue = cbReferCard==0?0:this.GetCardLogicValue(cbReferCard);
    let cbBlockIndex = cbSameCardCount-1;
    do
    {
        for(let i = 0; i < AnalyseResult.cbBlockCount[cbBlockIndex]; i++ )
        {
            let cbIndex = (AnalyseResult.cbBlockCount[cbBlockIndex]-i-1)*(cbBlockIndex+1);
            if(this.GetCardLogicValue(AnalyseResult.cbCardData[cbBlockIndex][cbIndex]) > cbReferLogicValue)
            {
                if( pSearchCardResult == null ) return {count:cbResultCount,result:pSearchCardResult};

                //if( cbResultCount > pSearchCardResult.cbCardCount.length ) continue;

                //复制扑克
                pSearchCardResult.cbResultCard[cbResultCount] = AnalyseResult.cbCardData[cbBlockIndex].slice(cbIndex, cbIndex+cbSameCardCount);
                pSearchCardResult.cbCardCount[cbResultCount] = cbSameCardCount;

                cbResultCount++;
            }
        }

        cbBlockIndex++;
    }while(cbBlockIndex < AnalyseResult.cbBlockCount.length);

    if(pSearchCardResult)pSearchCardResult.cbSearchCount = cbResultCount;
    return {count:cbResultCount,result:pSearchCardResult};
},

//带牌类型搜索(三带一，四带一等)
SearchTakeCardType(cbHandCardData, cbReferCard, cbSameCount, cbTakeCardCount)
{
    //设置结果
    let pSearchCardResult = this.tagSearchCardResult();
    let cbResultCount = 0;
    let cbHandCardCount = cbHandCardData.length;

    //效验
    ASSERT( cbSameCount == 3 || cbSameCount == 4 );
    ASSERT( cbTakeCardCount == 1 || cbTakeCardCount == 2 );
    if( cbSameCount != 3 && cbSameCount != 4 )
        return cbResultCount;
    if( cbTakeCardCount != 1 && cbTakeCardCount != 2 )
        return cbResultCount;

    //长度判断
    if( cbSameCount == 4 && cbHandCardCount<cbSameCount+cbTakeCardCount*2 ||
        cbHandCardCount < cbSameCount+cbTakeCardCount )
        return cbResultCount;

    //构造扑克
    let cbCardData = cbHandCardData.slice(0);

    //排列扑克
    this.SortCardList(cbCardData,ST_ORDER);

    //搜索同张
    let sameData = this.SearchSameCard(cbCardData, cbReferCard, cbSameCount),
        cbSameCardResultCount = sameData.count,
        SameCardResult = sameData.result;

    if( cbSameCardResultCount > 0 )
    {
        //分析扑克
        let AnalyseResult = this.AnalysebCardData(cbCardData);

        //需要牌数
        let cbNeedCount = cbSameCount+cbTakeCardCount;
        if( cbSameCount == 4 ) cbNeedCount += cbTakeCardCount;

        //提取带牌
        for(let i = 0; i < cbSameCardResultCount; i++ )
        {
            let bMerge = false;

            for(let j = cbTakeCardCount-1; j < AnalyseResult.cbBlockCount.length; j++ ){
                for(let k = 0; k < AnalyseResult.cbBlockCount[j]; k++ ){
                    //从小到大
                    let cbIndex = (AnalyseResult.cbBlockCount[j]-k-1)*(j+1);

                    //过滤相同牌
                    if(this.GetCardValue(SameCardResult.cbResultCard[i][0]) ==
                        this.GetCardValue(AnalyseResult.cbCardData[j][cbIndex]))
                        continue;


                    //复制带牌
                    let gap_card = AnalyseResult.cbCardData[j].slice(cbIndex, cbIndex+cbTakeCardCount);
                    SameCardResult.cbResultCard[i] = SameCardResult.cbResultCard[i].concat(gap_card);
                    SameCardResult.cbCardCount[i] += cbTakeCardCount;

                    if( SameCardResult.cbCardCount[i] < cbNeedCount ) continue;

                    if( pSearchCardResult == null ) return 1;

                    //复制结果
                    pSearchCardResult.cbResultCard[cbResultCount] = SameCardResult.cbResultCard[i];
                    pSearchCardResult.cbCardCount[cbResultCount] = SameCardResult.cbCardCount[i];
                    cbResultCount++;

                    bMerge = true;

                    //下一组合
                    break;
                }

                if( bMerge ) break;
            }
        }
    }

    if( pSearchCardResult )pSearchCardResult.cbSearchCount = cbResultCount;
    return {count:cbResultCount, result:pSearchCardResult};;
},

//连牌搜索
SearchLineCardType(cbHandCardData, cbReferCard, cbBlockCount, cbLineCount)
{
    //设置结果
    let pSearchCardResult = this.tagSearchCardResult();
    let cbHandCardCount = cbHandCardData.length;
    let cbResultCount = 0;

    //定义变量
    let cbLessLineCount = 0;
    if(cbLineCount == 0 )
    {
        if( cbBlockCount == 1 )
            cbLessLineCount = 5;
        else if( cbBlockCount == 2 )
            cbLessLineCount = 3;
        else cbLessLineCount = 2;
    }
    else cbLessLineCount = cbLineCount;

    if(cbReferCard==0){
        cbReferCard = cbHandCardData[cbHandCardCount-1];
    }

    let cbReferIndex = this.GetCardLogicValue(cbReferCard);
    if(cbReferCard != 2 )
    {
        if (this.GetCardLogicValue(cbReferCard)-cbLessLineCount>=2){
            cbReferIndex = this.GetCardLogicValue(cbReferCard)-cbLessLineCount+1;
        }
    }
    //超过A
    if(cbReferIndex+cbLessLineCount > 14 ) return { count: cbResultCount, result: pSearchCardResult };

    //长度判断
    if(cbHandCardCount < cbLessLineCount*cbBlockCount ) return { count: cbResultCount, result: pSearchCardResult };

    //构造扑克
    let cbCardCount=cbHandCardCount;
    let cbCardData = cbHandCardData.slice();

    //排列扑克
    this.SortCardList(cbCardData,ST_ORDER);

    //分析扑克
    let Distributing = this.AnalysebDistributing(cbCardData);

    //搜索顺子
    let cbTmpLinkCount = 0;
    let cbValueIndex = 0;
    for (cbValueIndex=cbReferIndex;cbValueIndex<13;cbValueIndex++){
        //继续判断
        if ( Distributing.cbDistributing[cbValueIndex][cbIndexCount]<cbBlockCount )
        {
            if( cbTmpLinkCount < cbLessLineCount )
            {
                cbTmpLinkCount=0;
                continue;
            }
            else cbValueIndex--;
        }
        else
        {
            cbTmpLinkCount++;
            //寻找最长连
            if( cbLineCount == 0 ) continue;
        }

        if( cbTmpLinkCount >= cbLessLineCount )
        {
            if( pSearchCardResult == null ) return 1;

            if (cbResultCount < pSearchCardResult.cbCardCount.length){

                //复制扑克
                let cbCount = 0;
                for(let cbIndex = cbValueIndex+1-cbTmpLinkCount; cbIndex <= cbValueIndex; cbIndex++ )
                {
                    let cbTmpCount = 0;
                    for (let cbColorIndex=0;cbColorIndex<4;cbColorIndex++)
                    {
                        for(let cbColorCount = 0; cbColorCount < Distributing.cbDistributing[cbIndex][3-cbColorIndex]; cbColorCount++ )
                        {
                            pSearchCardResult.cbResultCard[cbResultCount][cbCount++]=this.MakeCardData(cbIndex,3-cbColorIndex);

                            if( ++cbTmpCount == cbBlockCount ) break;
                        }
                        if( cbTmpCount == cbBlockCount ) break;
                    }
                }

                //设置变量
                pSearchCardResult.cbCardCount[cbResultCount] = cbCount;
                cbResultCount++;

                if( cbLineCount != 0 )
                {
                    cbTmpLinkCount--;
                }
                else
                {
                    cbTmpLinkCount = 0;
                }
            }
        }
    }

    //特殊顺子
    if( cbTmpLinkCount >= cbLessLineCount-1 && cbValueIndex == 13 )
    {
        if( Distributing.cbDistributing[0][cbIndexCount] >= cbBlockCount ||
            cbTmpLinkCount >= cbLessLineCount )
        {
            if( pSearchCardResult == null ) return 1;

            if ( cbResultCount < pSearchCardResult.cbCardCount.length){
                //复制扑克
                let cbCount = 0;
                let cbTmpCount = 0;
                for(let cbIndex = cbValueIndex-cbTmpLinkCount; cbIndex < 13; cbIndex++ )
                {
                    cbTmpCount = 0;
                    for (let cbColorIndex=0;cbColorIndex<4;cbColorIndex++)
                    {
                        for(let cbColorCount = 0; cbColorCount < Distributing.cbDistributing[cbIndex][3-cbColorIndex]; cbColorCount++ )
                        {
                            pSearchCardResult.cbResultCard[cbResultCount][cbCount++]=this.MakeCardData(cbIndex,3-cbColorIndex);

                            if( ++cbTmpCount == cbBlockCount ) break;
                        }
                        if( cbTmpCount == cbBlockCount ) break;
                    }
                }
                //复制A
                if( Distributing.cbDistributing[0][cbIndexCount] >= cbBlockCount )
                {
                    cbTmpCount = 0;
                    for (let cbColorIndex=0;cbColorIndex<4;cbColorIndex++)
                    {
                        for(let cbColorCount = 0; cbColorCount < Distributing.cbDistributing[0][3-cbColorIndex]; cbColorCount++ )
                        {
                            pSearchCardResult.cbResultCard[cbResultCount][cbCount++]=this.MakeCardData(0,3-cbColorIndex);

                            if( ++cbTmpCount == cbBlockCount ) break;
                        }
                        if( cbTmpCount == cbBlockCount ) break;
                    }
                }

                //设置变量
                pSearchCardResult.cbCardCount[cbResultCount] = cbCount;
                cbResultCount++;
            }
        }
    }

    if( pSearchCardResult )
        pSearchCardResult.cbSearchCount = cbResultCount;
    return {count:cbResultCount, result:pSearchCardResult};
},

//搜索飞机
SearchThreeTwoLine(cbHandCardData, cbReferCard)
{
    //设置结果
    let pSearchCardResult = this.tagSearchCardResult();
    let cbHandCardCount = cbHandCardData.length;

    //变量定义
    let tmpSearchResult = this.tagSearchCardResult();
    let tmpSingleWing = this.tagSearchCardResult();
    let tmpDoubleWing = this.tagSearchCardResult();
    let cbTmpResultCount = 0;

    //搜索连牌
    let sameData = this.SearchLineCardType( cbHandCardData,cbReferCard,3,2);
    cbTmpResultCount = sameData.count;
    tmpSearchResult = sameData.result;
    if( cbTmpResultCount > 0 )
    {
        //提取带牌
        for(let i = 0; i < cbTmpResultCount; i++ )
        {
            //变量定义
            let cbTmpCardData = [];
            let cbTmpCardCount = cbHandCardCount;

            //不够牌
            if( cbHandCardCount-tmpSearchResult.cbCardCount[i] < tmpSearchResult.cbCardCount[i]/3 )
            {
                let cbNeedDelCount = 3;
                while( cbHandCardCount+cbNeedDelCount-tmpSearchResult.cbCardCount[i] < (tmpSearchResult.cbCardCount[i]-cbNeedDelCount)/3 )
                    cbNeedDelCount += 3;
                //不够连牌
                if( (tmpSearchResult.cbCardCount[i]-cbNeedDelCount)/3 < 2 )
                {
                    //废除连牌
                    continue;
                }

                //拆分连牌
                this.RemoveCard(tmpSearchResult.cbResultCard[i],tmpSearchResult.cbResultCard[i]);
                tmpSearchResult.cbCardCount[i] -= cbNeedDelCount;
            }

            if( pSearchCardResult == null ) return 1;

            //删除连牌
            cbTmpCardData = cbHandCardData.slice(0);
            ASSERT(this.RemoveCard( tmpSearchResult.cbResultCard[i],cbTmpCardData));
            cbTmpCardCount -= tmpSearchResult.cbCardCount[i];

            //组合飞机
            let cbNeedCount = tmpSearchResult.cbCardCount[i]/3;
            ASSERT( cbNeedCount <= cbTmpCardCount );


            let singleResult = this.SearchSameCard(cbTmpCardData, 0, 1);
            let singleResultCount = singleResult.count,
                singleCardList = [],
                resultArr = singleResult.result.cbResultCard;
            for (let i=0; i<singleResultCount; i++) {
                singleCardList.push(resultArr[i][0])
            }
            this.SortCardList(singleCardList, ST_ORDER);
            let cbResultCount = tmpSingleWing.cbSearchCount++;
            tmpSingleWing.cbResultCard[cbResultCount] = tmpSearchResult.cbResultCard[i].slice(0);
            tmpSingleWing.cbResultCard[cbResultCount][tmpSearchResult.cbCardCount[i]] = singleCardList.slice(singleResultCount-cbNeedCount,singleResultCount);
            tmpSingleWing.cbCardCount[i] = tmpSearchResult.cbCardCount[i]+cbNeedCount;

            //不够带翅膀
            if( cbTmpCardCount < tmpSearchResult.cbCardCount[i]/3*2 )
            {
                let cbNeedDelCount = 3;
                while( cbTmpCardCount+cbNeedDelCount-tmpSearchResult.cbCardCount[i] < (tmpSearchResult.cbCardCount[i]-cbNeedDelCount)/3*2 )
                    cbNeedDelCount += 3;
                //不够连牌
                if( (tmpSearchResult.cbCardCount[i]-cbNeedDelCount)/3 < 2 )
                {
                    //废除连牌
                    continue;
                }

                //拆分连牌
                this.RemoveCard( tmpSearchResult.cbResultCard[i],tmpSearchResult.cbResultCard[i]);
                tmpSearchResult.cbCardCount[i] -= cbNeedDelCount;

                //重新删除连牌
                cbTmpCardData = cbHandCardData.slice(0);
                ASSERT(this.RemoveCard( tmpSearchResult.cbResultCard[i], cbTmpCardData) );
                cbTmpCardCount = cbHandCardCount-tmpSearchResult.cbCardCount[i];
            }

            //分析牌
            let TmpResult = this.AnalysebCardData(cbTmpCardData);

            //提取翅膀
            let cbDistillCard = [];
            let cbDistillCount = 0;
            let cbLineCount = tmpSearchResult.cbCardCount[i]/3;
            for(let j = 1; j < TmpResult.cbBlockCount.length; j++ )
            {
                if( TmpResult.cbBlockCount[j] > 0 )
                {
                    if( j+1 == 2 && TmpResult.cbBlockCount[j] >= cbLineCount )
                    {
                        let cbTmpBlockCount = TmpResult.cbBlockCount[j];
                        cbDistillCard = TmpResult.cbCardData[j].slice((cbTmpBlockCount-cbLineCount)*(j+1), cbTmpBlockCount*(j+1));
                        cbDistillCount = (j+1)*cbLineCount;
                        break;
                    }
                    else
                    {
                        for(let k = 0; k < TmpResult.cbBlockCount[j]; k++ )
                        {
                            let cbTmpBlockCount = TmpResult.cbBlockCount[j];
                            cbDistillCard[cbDistillCount] = TmpResult.cbCardData[j][(cbTmpBlockCount-k-1)*(j+1)];
                            cbDistillCount+=2;

                            //提取完成
                            if( cbDistillCount == 2*cbLineCount ) break;
                        }
                    }
                }

                //提取完成
                if( cbDistillCount == 2*cbLineCount ) break;
            }

            //提取完成
            if( cbDistillCount == 2*cbLineCount )
            {
                //复制翅膀
                cbResultCount = tmpDoubleWing.cbSearchCount++;
                tmpDoubleWing.cbResultCard[cbResultCount] = tmpSearchResult.cbResultCard[i].slice(0);
                tmpDoubleWing.cbResultCard[cbResultCount][tmpSearchResult.cbCardCount[i]] = cbDistillCard.slice(0);
                tmpDoubleWing.cbCardCount[i] = tmpSearchResult.cbCardCount[i]+cbDistillCount;
            }
        }

        //复制结果
        for(let i = 0; i < tmpDoubleWing.cbSearchCount; i++ )
        {
            let cbResultCount = pSearchCardResult.cbSearchCount++;

            pSearchCardResult.cbResultCard[cbResultCount] = tmpDoubleWing.cbResultCard[i].slice(0)
            pSearchCardResult.cbCardCount[cbResultCount] = tmpDoubleWing.cbCardCount[i];
        }
        for(let i = 0; i < tmpSingleWing.cbSearchCount; i++ )
        {
            let cbResultCount = pSearchCardResult.cbSearchCount++;

            pSearchCardResult.cbResultCard[cbResultCount] = tmpSingleWing.cbResultCard[i].slice(0);
            pSearchCardResult.cbCardCount[cbResultCount] = tmpSingleWing.cbCardCount[i];
        }
    }
    let cbResultCount = pSearchCardResult==null?0:pSearchCardResult.cbSearchCount
    return {count:cbResultCount, result:pSearchCardResult};
},
}

//////////////////////////////////////////////////////////////////////////////////
module.exports = doudizhuFP;
